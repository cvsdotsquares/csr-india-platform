'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { uploadMedia } from '@/lib/actions/content-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileIcon, Upload, X, Loader2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';

type MediaAsset = Database['public']['Tables']['media_assets']['Row'];

interface MediaPickerProps {
  onSelect: (url: string) => void;
  isOpen: boolean;
  onClose: () => void;
  mediaAssets?: MediaAsset[];
  isLoading?: boolean;
}

export default function MediaPicker({
  onSelect,
  isOpen,
  onClose,
  mediaAssets = [],
  isLoading = false,
}: MediaPickerProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files[0]) {
      setUploadError(null);
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadError(null);
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    if (altText) formData.append('altText', altText);

    const result = (await uploadMedia(formData)) as {
      success?: boolean;
      error?: string;
      data?: MediaAsset;
    };

    if (result.success && result.data) {
      onSelect(result.data.file_url);
      setUploadedFile(null);
      setAltText('');
      onClose();
    } else if (result.error) {
      setUploadError(result.error);
    }

    setUploading(false);
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = filterType === 'all'
    ? mediaAssets
    : mediaAssets.filter((asset) => asset.media_type === filterType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="cursor-pointer"
            >
              {uploadedFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="mt-2">
                    <Input
                      type="text"
                      placeholder="Alt text (optional)"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="mb-2"
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
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadError(null);
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium mb-1">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Supported: Images, Videos, PDFs
                  </p>
                  <Input
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
            {uploadError && (
              <p className="mt-3 text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterType === 'image' ? 'default' : 'outline'}
              onClick={() => setFilterType('image')}
              size="sm"
            >
              Images
            </Button>
            <Button
              variant={filterType === 'video' ? 'default' : 'outline'}
              onClick={() => setFilterType('video')}
              size="sm"
            >
              Videos
            </Button>
            <Button
              variant={filterType === 'document' ? 'default' : 'outline'}
              onClick={() => setFilterType('document')}
              size="sm"
            >
              Documents
            </Button>
          </div>

          {/* Media Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No media files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-brand-500 transition-colors group"
                >
                  {/* Preview */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {asset.media_type === 'image' ? (
                      <Image
                        src={asset.file_url}
                        alt={asset.alt_text || 'media'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <FileIcon className="h-8 w-8 text-gray-400" />
                    )}
                    <button
                      onClick={() => onSelect(asset.file_url)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-medium">Select</span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2 text-xs">
                    <p className="font-medium truncate mb-1">{asset.original_filename}</p>
                    <p className="text-gray-500 mb-2">
                      {(asset.file_size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      onClick={() => handleCopyUrl(asset.file_url, asset.id)}
                      className={cn(
                        'w-full py-1 rounded text-white font-medium flex items-center justify-center gap-1 transition-colors',
                        copiedId === asset.id
                          ? 'bg-green-600'
                          : 'bg-brand-500 hover:bg-brand-600'
                      )}
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy URL
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
