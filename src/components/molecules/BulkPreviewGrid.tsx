import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import type { UploadedFile } from './BulkFileUpload';
import { getPresetOutput } from '@/lib/presets';
import { getOutputByMode } from '@/lib/converters';

interface BulkPreviewGridProps {
  files: UploadedFile[];
  outputMode?: 'preview' | 'jsx' | 'html' | 'react-js' | 'react-ts' | 'nextjs';
  className?: string;
}

export function BulkPreviewGrid({
  files,
  outputMode = 'preview',
  className = '',
}: BulkPreviewGridProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

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
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
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
              <p className="text-sm text-white/90 truncate mb-3 font-medium" title={file.file.name}>
                {file.file.name}
              </p>

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
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
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
