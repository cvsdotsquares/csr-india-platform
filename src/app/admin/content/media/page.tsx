'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { uploadMedia, deleteMedia } from '@/lib/actions/content-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileIcon, Upload, Trash2, Copy, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';

type MediaAsset = Database['public']['Tables']['media_assets']['Row'];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssets(data);
    }
    setLoading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    if (altText) formData.append('altText', altText);

    const result = (await uploadMedia(formData)) as {
      success?: boolean;
      error?: string;
      data?: MediaAsset;
    };

    if (result.success && result.data) {
      setAssets([result.data, ...assets]);
      setUploadedFile(null);
      setAltText('');
    }

    setUploading(false);
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const result = (await deleteMedia(deleteId)) as {
      success?: boolean;
      error?: string;
    };
    if (result.success) {
      setAssets(assets.filter(a => a.id !== deleteId));
    }
    setDeleteId(null);
  };

  const filteredAssets = filterType === 'all'
    ? assets
    : assets.filter((asset) => asset.media_type === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600 mt-1">Upload and manage your media files</p>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload New Media</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="cursor-pointer"
          >
            {uploadedFile ? (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Alt text (optional)"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setUploadedFile(null)}
                    variant="outline"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium mb-1">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Supported: Images, Videos, PDFs (max 100MB)
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <Button
                  onClick={() => document.getElementById('file-input')?.click()}
                  variant="outline"
                  size="sm"
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
          size="sm"
        >
          All ({assets.length})
        </Button>
        <Button
          variant={filterType === 'image' ? 'default' : 'outline'}
          onClick={() => setFilterType('image')}
          size="sm"
        >
          Images ({assets.filter(a => a.media_type === 'image').length})
        </Button>
        <Button
          variant={filterType === 'video' ? 'default' : 'outline'}
          onClick={() => setFilterType('video')}
          size="sm"
        >
          Videos ({assets.filter(a => a.media_type === 'video').length})
        </Button>
        <Button
          variant={filterType === 'document' ? 'default' : 'outline'}
          onClick={() => setFilterType('document')}
          size="sm"
        >
          Documents ({assets.filter(a => a.media_type === 'document').length})
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>No media files found in this category</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-brand-500 hover:shadow-md transition-all group bg-white"
            >
              {/* Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {asset.media_type === 'image' && asset.file_url ? (
                  <Image
                    src={asset.file_url}
                    alt={asset.alt_text || 'media'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FileIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Info & Actions */}
              <div className="p-2 space-y-2">
                <p className="text-xs font-medium truncate" title={asset.original_filename}>
                  {asset.original_filename}
                </p>
                <p className="text-xs text-gray-500">
                  {(asset.file_size / 1024).toFixed(2)} KB
                </p>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleCopyUrl(asset.file_url, asset.id)}
                    className={cn(
                      'flex-1 py-1 px-2 rounded text-white font-medium flex items-center justify-center gap-1 text-xs transition-colors',
                      copiedId === asset.id
                        ? 'bg-green-600'
                        : 'bg-brand-500 hover:bg-brand-600'
                    )}
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(asset.id)}
                    className="py-1 px-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The file will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
