import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, Copy, Download, Edit2 } from 'lucide-react';
import type { UploadedFile } from './BulkFileUpload';
import { getPresetOutput } from '@/lib/presets';
import { getOutputByMode } from '@/lib/converters';

interface BulkPreviewGridProps {
  files: UploadedFile[];
  outputMode?: 'preview' | 'jsx' | 'html' | 'react-js' | 'react-ts' | 'nextjs';
  onFilesUpdated?: (files: UploadedFile[]) => void;
  className?: string;
}

export function BulkPreviewGrid({
  files,
  outputMode = 'preview',
  onFilesUpdated,
  className = '',
}: BulkPreviewGridProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingFileId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingFileId]);

  const successfulFiles = files.filter((f) => f.status === 'success');

  if (successfulFiles.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-white/40 text-sm">No files to preview</p>
      </div>
    );
  }

  const getConvertedContent = (file: UploadedFile): string => {
    const baseName = file.file.name.replace(/\.svg$/i, '');
    const componentName = baseName
      .split(/[-_\s]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    switch (outputMode) {
      case 'jsx':
        return getOutputByMode(file.content, 'jsx');
      case 'html':
        return getOutputByMode(file.content, 'html');
      case 'react-js':
        return getPresetOutput(file.content, 'react-js', componentName);
      case 'react-ts':
        return getPresetOutput(file.content, 'react-ts', componentName);
      case 'nextjs':
        return getPresetOutput(file.content, 'nextjs', componentName);
      case 'preview':
      default:
        return file.content;
    }
  };

  const handleCopy = async (file: UploadedFile) => {
    try {
      const content = getConvertedContent(file);
      await navigator.clipboard.writeText(content);
      setCopiedFileId(file.id);
      setTimeout(() => setCopiedFileId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = (file: UploadedFile) => {
    const content = getConvertedContent(file);
    const baseName = file.file.name.replace(/\.svg$/i, '');

    let extension = 'svg';
    if (outputMode === 'jsx') extension = 'jsx';
    else if (outputMode === 'react-js') extension = 'jsx';
    else if (outputMode === 'react-ts' || outputMode === 'nextjs') extension = 'tsx';
    else if (outputMode === 'html') extension = 'html';

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEditing = (file: UploadedFile) => {
    setEditingFileId(file.id);
    setEditingFileName(file.file.name);
  };

  const cancelEditing = () => {
    setEditingFileId(null);
    setEditingFileName('');
  };

  const saveFileName = (fileId: string) => {
    if (!editingFileName.trim()) {
      cancelEditing();
      return;
    }

    // Ensure .svg extension
    let newName = editingFileName.trim();
    if (!newName.toLowerCase().endsWith('.svg')) {
      newName += '.svg';
    }

    const updatedFiles = files.map((f) => {
      if (f.id === fileId) {
        const newFile = new File([f.file], newName, { type: f.file.type });
        return { ...f, file: newFile };
      }
      return f;
    });

    onFilesUpdated?.(updatedFiles);
    cancelEditing();
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, fileId: string) => {
    if (e.key === 'Enter') {
      saveFileName(fileId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className={`p-6 overflow-y-auto custom-scrollbar ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {successfulFiles.map((file) => {
          const isSelected = selectedFileId === file.id;
          const isCopied = copiedFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={`
                relative border rounded-lg p-4 cursor-pointer transition-all group
                ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
                }
              `}
            >
              {/* Preview */}
              <div className="aspect-square bg-black/30 border border-white/5 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {outputMode === 'preview' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: file.content }}
                    className="w-4/5 h-4/5 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                  />
                ) : (
                  <div className="w-full h-full p-3 overflow-hidden">
                    <pre className="text-[9px] text-white/60 font-mono leading-snug overflow-hidden">
                      {getConvertedContent(file).substring(0, 250)}...
                    </pre>
                  </div>
                )}
              </div>

              {/* File Name */}
              <div className="mb-3">
                {editingFileId === file.id ? (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingFileName}
                      onChange={(e) => setEditingFileName(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, file.id)}
                      onBlur={() => saveFileName(file.id)}
                      className="w-full px-2 py-1.5 bg-primary/20 border-2 border-primary rounded-lg text-sm text-white focus:outline-none shadow-lg shadow-primary/20"
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 group/name"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditing(file);
                    }}
                  >
                    <p
                      className="text-sm text-white/90 truncate font-medium cursor-text flex-1"
                      title="Double-click to rename"
                    >
                      {file.file.name}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(file);
                      }}
                      className="opacity-0 group-hover:opacity-100 group-hover/name:opacity-100 p-1 hover:bg-primary/20 rounded transition-all shrink-0"
                      title="Rename file"
                    >
                      <Edit2 className="w-3 h-3 text-primary" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(file);
                  }}
                  className={`
                    flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5
                    ${
                      isCopied
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white'
                    }
                  `}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
