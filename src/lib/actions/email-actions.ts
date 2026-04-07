'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import Handlebars from 'handlebars';

type EmailTemplateRecord = {
  id: string;
  subject: string;
  html_body: string;
  is_active?: boolean;
};

export async function sendTemplateEmail(
  templateSlug: string,
  recipientEmail: string,
  variables: Record<string, string>
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Get email template
    const { data: templateData, error: templateError } = await supabase
      .from('email_templates')
      .select('id, subject, html_body, is_active')
      .eq('slug', templateSlug)
      .eq('is_active', true)
      .single();
    const template = templateData as EmailTemplateRecord | null;

    if (templateError || !template) {
      return { error: 'Email template not found' };
    }

    // Compile template with variables
    const subjectTemplate = Handlebars.compile(template.subject);
    const htmlTemplate = Handlebars.compile(template.html_body);

    const compiledSubject = subjectTemplate(variables);
    const compiledHtml = htmlTemplate(variables);

    // Send email via Resend
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: compiledSubject,
      html: compiledHtml,
    });

    if (!emailResult.success) {
      return { error: emailResult.error || 'Failed to send email' };
    }

    // Log email
    const { error: logError } = await (supabase
      .from('email_logs') as any)
      .insert({
        template_id: template.id,
        recipient_email: recipientEmail,
        subject: compiledSubject,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Failed to log email:', logError);
    }

    return { success: true, messageId: emailResult.id };
  } catch (err) {
    console.error('Email send error:', err);
    return { error: 'An error occurred while sending email' };
  }
}

export async function sendBulkEmail(templateSlug: string, eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Get email template
    const { data: templateData, error: templateError } = await supabase
      .from('email_templates')
      .select('id, subject, html_body')
      .eq('slug', templateSlug)
      .eq('is_active', true)
      .single();
    const template = templateData as EmailTemplateRecord | null;

    if (templateError || !template) {
      return { error: 'Email template not found' };
    }

    // Get all approved registrations for event
    const { data: registrationsData, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        profiles!inner(full_name, email)
      `)
      .eq('event_id', eventId)
      .in('status', ['approved', 'checked_in']);
    const registrations = (registrationsData || []) as Array<{
      id: string;
      profiles: {
        full_name: string | null;
        email: string | null;
      } | null;
    }>;

    if (regError || !registrations) {
      return { error: 'Failed to fetch registrations' };
    }

    let sent = 0;
    let failed = 0;

    // Send emails
    for (const registration of registrations) {
      const profile = (registration as any).profiles;
      if (!profile?.email) continue;

      const variables = {
        full_name: profile.full_name || 'Attendee',
        email: profile.email,
      };

      const result = await sendTemplateEmail(templateSlug, profile.email, variables);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Log bulk action in audit
    await (supabase.from('audit_logs') as any).insert({
      user_id: user.id,
      action: 'bulk_action',
      entity_type: 'email',
      entity_id: eventId,
      new_data: { template_slug: templateSlug, total: registrations.length, sent, failed },
      ip_address: null,
      user_agent: null,
    });

    revalidatePath('/admin');

    return {
      success: true,
      message: `Sent ${sent} emails, ${failed} failed`,
      sent,
      failed,
      total: registrations.length,
    };
  } catch (err) {
    console.error('Bulk email error:', err);
    return { error: 'An error occurred while sending bulk emails' };
  }
}

export async function getEmailLogs(
  filters?: {
    templateId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  },
  page = 1,
  pageSize = 20
) {
  try {
    const supabase = await createClient();
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('email_logs')
      .select(
        `
        id,
        template_id,
        recipient_email,
        subject,
        status,
        sent_at,
        error_message,
        created_at,
        email_templates(name, slug)
      `,
        { count: 'exact' }
      );

    if (filters?.templateId) {
      query = query.eq('template_id', filters.templateId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return { error: error.message };
    }

    return {
      success: true,
      data,
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (err) {
    console.error('Error fetching email logs:', err);
    return { error: 'Failed to fetch email logs' };
  }
}

export async function updateEmailTemplate(templateId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const subject = formData.get('subject') as string;
    const htmlBody = formData.get('htmlBody') as string;
    const isActive = formData.get('isActive') === 'on';

    if (!name || !subject || !htmlBody) {
      return { error: 'Missing required fields' };
    }

    // Extract variables from template
    const variableMatches = htmlBody.match(/\{\{(\w+)\}\}/g) || [];
    const variables = Array.from(new Set(variableMatches.map(m => m.replace(/\{\{|\}\}/g, ''))));

    const { error } = await (supabase
      .from('email_templates') as any)
      .update({
        name,
        subject,
        html_body: htmlBody,
        variables,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId);

    if (error) {
      return { error: error.message };
    }

    // Audit log
    await (supabase.from('audit_logs') as any).insert({
      user_id: user.id,
      action: 'update',
      entity_type: 'email_template',
      entity_id: templateId,
      new_data: { name, subject, variables },
      ip_address: null,
      user_agent: null,
    });

    revalidatePath('/admin/email-templates');

    return { success: true };
  } catch (err) {
    console.error('Error updating email template:', err);
    return { error: 'Failed to update email template' };
  }
}

export async function createEmailTemplate(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const slug = (name.toLowerCase().replace(/\s+/g, '-'));
    const subject = formData.get('subject') as string;
    const htmlBody = formData.get('htmlBody') as string;

    if (!name || !subject || !htmlBody) {
      return { error: 'Missing required fields' };
    }

    // Extract variables from template
    const variableMatches = htmlBody.match(/\{\{(\w+)\}\}/g) || [];
    const variables = Array.from(new Set(variableMatches.map(m => m.replace(/\{\{|\}\}/g, ''))));

    const { data, error } = await (supabase
      .from('email_templates') as any)
      .insert({
        name,
        slug,
        subject,
        html_body: htmlBody,
        variables,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/email-templates');

    return { success: true, data };
  } catch (err) {
    console.error('Error creating email template:', err);
    return { error: 'Failed to create email template' };
  }
}

export async function deleteEmailTemplate(templateId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/email-templates');

    return { success: true };
  } catch (err) {
    console.error('Error deleting email template:', err);
    return { error: 'Failed to delete email template' };
  }
}
