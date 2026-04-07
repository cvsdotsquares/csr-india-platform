'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import {
  updateEmailTemplate,
  deleteEmailTemplate,
} from '@/lib/actions/email-actions';
import { Plus, MoreHorizontal, Eye, Edit2, Trash2, Loader2 } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  html_body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    subject: '',
    htmlBody: '',
    isActive: false,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading templates:', error);
      } else {
        setTemplates(data || []);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditOpen = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditFormData({
      name: template.name,
      subject: template.subject,
      htmlBody: template.html_body,
      isActive: template.is_active,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('subject', editFormData.subject);
      formData.append('htmlBody', editFormData.htmlBody);
      formData.append(
        'isActive',
        editFormData.isActive ? 'on' : 'off'
      );

      const result = await updateEmailTemplate(
        selectedTemplate.id,
        formData
      );
      if (result.error) {
        console.error('Error saving template:', result.error);
      } else {
        setEditOpen(false);
        loadTemplates();
      }
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await deleteEmailTemplate(templateId);
      if (result.error) {
        console.error('Error deleting template:', result.error);
      } else {
        loadTemplates();
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Email Templates
          </h1>
          <p className="text-gray-600 mt-1">
            Manage email templates for notifications and communications
          </p>
        </div>
        <Link href="/admin/email-templates/new">
          <Button className="bg-[#1B3A5C] hover:bg-[#152a47]">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length > 0 ? (
              templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    {template.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {template.subject}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={template.is_active ? 'default' : 'outline'}
                      className={
                        template.is_active
                          ? 'bg-green-100 text-green-800'
                          : ''
                      }
                    >
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(template.updated_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTemplate(template);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditOpen(template)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No email templates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Subject: {selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <div
              dangerouslySetInnerHTML={{
                __html: selectedTemplate?.html_body || '',
              }}
              className="prose prose-sm max-w-none"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={e =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                value={editFormData.subject}
                onChange={e =>
                  setEditFormData({
                    ...editFormData,
                    subject: e.target.value,
                  })
                }
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Body
              </label>
              <textarea
                value={editFormData.htmlBody}
                onChange={e =>
                  setEditFormData({
                    ...editFormData,
                    htmlBody: e.target.value,
                  })
                }
                rows={8}
                className="w-full rounded-md border px-3 py-2 font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Use variables like {'{{full_name}}'} and {'{{email}}'} in your
                template.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editFormData.isActive}
                onChange={e =>
                  setEditFormData({
                    ...editFormData,
                    isActive: e.target.checked,
                  })
                }
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1B3A5C] hover:bg-[#152a47]"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Template'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
