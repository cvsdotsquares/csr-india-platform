'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export async function submitContactForm(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData);

    const parsed = contactFormSchema.safeParse({
      name: raw.name,
      email: raw.email,
      phone: raw.phone || undefined,
      organization: raw.organization || undefined,
      subject: raw.subject,
      message: raw.message,
    });

    if (!parsed.success) {
      return { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createClient();

    const { data, error } = await (supabase
      .from('contact_submissions') as any)
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        organization: parsed.data.organization || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Send confirmation email to user
    const confirmationHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Thank You for Contacting Us</h2>
          <p>Hi ${parsed.data.name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <h4>Your Message Details:</h4>
          <p><strong>Subject:</strong> ${parsed.data.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${parsed.data.message.replace(/\n/g, '<br>')}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Best regards,<br>CSR India Team</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: parsed.data.email,
      subject: `Re: ${parsed.data.subject} - We received your message`,
      html: confirmationHtml,
    });

    // Send notification email to admin
    const adminHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${parsed.data.name}</p>
          <p><strong>Email:</strong> ${parsed.data.email}</p>
          ${parsed.data.phone ? `<p><strong>Phone:</strong> ${parsed.data.phone}</p>` : ''}
          ${parsed.data.organization ? `<p><strong>Organization:</strong> ${parsed.data.organization}</p>` : ''}
          <p><strong>Subject:</strong> ${parsed.data.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${parsed.data.message.replace(/\n/g, '<br>')}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/contact" style="background-color: #1B3A5C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Admin Panel</a></p>
        </body>
      </html>
    `;

    await sendEmail({
      to: process.env.CONTACT_ADMIN_EMAIL || 'admin@csrindia.org',
      subject: `New Contact Form Submission: ${parsed.data.subject}`,
      html: adminHtml,
    });

    revalidatePath('/contact');

    return { success: true, data };
  } catch (err) {
    console.error('Contact form error:', err);
    return { error: 'Failed to submit contact form' };
  }
}

export async function markContactRead(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await (supabase
      .from('contact_submissions') as any)
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/contact');

    return { success: true };
  } catch (err) {
    console.error('Error marking contact as read:', err);
    return { error: 'Failed to mark as read' };
  }
}

export async function replyToContact(id: string, message: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Get contact submission
    const { data: submissionData, error: fetchError } = await supabase
      .from('contact_submissions')
      .select('id, email, name, subject')
      .eq('id', id)
      .single();
    const submission = submissionData as {
      id: string;
      email: string;
      name: string;
      subject: string;
    } | null;

    if (fetchError || !submission) {
      return { error: 'Submission not found' };
    }

    // Send reply email
    const replyHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hi ${submission.name},</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Best regards,<br>CSR India Team</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: submission.email,
      subject: `Re: ${submission.subject}`,
      html: replyHtml,
    });

    // Update replied_at
    const { error: updateError } = await (supabase
      .from('contact_submissions') as any)
      .update({ replied_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath('/admin/contact');

    return { success: true };
  } catch (err) {
    console.error('Error replying to contact:', err);
    return { error: 'Failed to send reply' };
  }
}

export async function deleteContactSubmission(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/contact');

    return { success: true };
  } catch (err) {
    console.error('Error deleting contact submission:', err);
    return { error: 'Failed to delete submission' };
  }
}

export async function subscribeNewsletter(email: string) {
  try {
    const supabase = await createClient();
    type NewsletterSubscriber = {
      id: string;
      is_active: boolean;
    };

    // Check if already subscribed
    const { data: existingData } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .single();
    const existing = existingData as NewsletterSubscriber | null;

    if (existing && existing.is_active) {
      return { success: true, message: 'Already subscribed' };
    }

    if (existing) {
      // Reactivate subscription
      const { error } = await (supabase
        .from('newsletter_subscribers') as any)
        .update({ is_active: true, unsubscribed_at: null })
        .eq('id', existing.id);

      if (error) {
        return { error: error.message };
      }
    } else {
      // New subscription
      const { error } = await (supabase
        .from('newsletter_subscribers') as any)
        .insert({
          email,
          is_active: true,
        });

      if (error) {
        return { error: error.message };
      }
    }

    // Send confirmation email
    const confirmHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to CSR India Newsletter</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive updates about our latest events and news.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #1B3A5C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Visit our website</a></p>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: 'Welcome to CSR India Newsletter',
      html: confirmHtml,
    });

    return { success: true };
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    return { error: 'Failed to subscribe' };
  }
}

export async function unsubscribeNewsletter(email: string) {
  try {
    const supabase = await createClient();

    const { error } = await (supabase
      .from('newsletter_subscribers') as any)
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Newsletter unsubscribe error:', err);
    return { error: 'Failed to unsubscribe' };
  }
}
