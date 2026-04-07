'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Minus,
  Strikethrough,
  ALargeSmall,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TiptapEditorProps {
  content?: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  icon,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', active && 'bg-muted text-brand-500')}
      onClick={onClick}
      title={title}
    >
      {icon}
    </Button>
  );
}

export default function TiptapEditor({
  content = '',
  onChange,
  placeholder = 'Start typing...',
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-500 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none text-gray-900',
      },
    },
  });

  if (!editor) return null;

  const handleAddLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
    }
  };

  const handleAddImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
    }
  };

  return (
    <div className="rounded-md border border-gray-300 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-200 pr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            icon={<Bold className="h-4 w-4" />}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            icon={<Italic className="h-4 w-4" />}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            icon={<Strikethrough className="h-4 w-4" />}
            title="Strikethrough"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            icon={<Code className="h-4 w-4" />}
            title="Inline Code"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-200 pr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            icon={<Heading1 className="h-4 w-4" />}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            icon={<Heading2 className="h-4 w-4" />}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            icon={<Heading3 className="h-4 w-4" />}
            title="Heading 3"
          />
        </div>

        {/* Lists & Blocks */}
        <div className="flex gap-1 border-r border-gray-200 pr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            icon={<List className="h-4 w-4" />}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            icon={<ListOrdered className="h-4 w-4" />}
            title="Ordered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            icon={<Quote className="h-4 w-4" />}
            title="Blockquote"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<Minus className="h-4 w-4" />}
            title="Horizontal Rule"
          />
        </div>

        {/* Media & Links */}
        <div className="flex gap-1 border-r border-gray-200 pr-1">
          <div className="flex gap-1">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddLink();
                }
              }}
              placeholder="https://..."
              className="h-8 rounded border border-gray-300 px-2 text-xs"
            />
            <ToolbarButton
              onClick={handleAddLink}
              icon={<LinkIcon className="h-4 w-4" />}
              title="Add Link"
            />
          </div>
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            icon={<LinkIcon className="h-4 w-4 opacity-50" />}
            title="Remove Link"
          />
        </div>

        {/* Image */}
        <div className="flex gap-1 border-r border-gray-200 pr-1">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddImage();
              }
            }}
            placeholder="Image URL..."
            className="h-8 rounded border border-gray-300 px-2 text-xs"
          />
          <ToolbarButton
            onClick={handleAddImage}
            icon={<ImageIcon className="h-4 w-4" />}
            title="Insert Image"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={<Undo className="h-4 w-4" />}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={<Redo className="h-4 w-4" />}
            title="Redo (Ctrl+Y)"
          />
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
