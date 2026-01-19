import { useRef, useState, useEffect } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileCheck, AlertCircle, Clipboard } from 'lucide-react';

export interface UploadedFile {
  id: string;
  file: File;
  content: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  preview?: string;
}

interface BulkFileUploadProps {
  files?: UploadedFile[];
  onFilesAdded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

export function BulkFileUpload({
  files = [],
  onFilesAdded,
  maxFiles = 50,
  maxFileSize = 5,
  className = '',
}: BulkFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(files);

  // Sync internal state with prop changes
  useEffect(() => {
    setUploadedFiles(files);
  }, [files]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
      return { valid: false, error: 'Only SVG files are allowed' };
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxFileSize}MB` };
    }
    return { valid: true };
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);

    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      const fileId = `${file.name}-${Date.now()}-${Math.random()}`;

      if (!validation.valid) {
        newFiles.push({
          id: fileId,
          file,
          content: '',
          status: 'error',
          error: validation.error,
        });
        continue;
      }

      newFiles.push({
        id: fileId,
        file,
        content: '',
        status: 'processing',
      });

      // Read file content
      try {
        const content = await readFileContent(file);
        const fileIndex = newFiles.findIndex((f) => f.id === fileId);
        if (fileIndex !== -1) {
          newFiles[fileIndex].content = content;
          newFiles[fileIndex].status = 'success';
          newFiles[fileIndex].preview = content;
        }
      } catch (error) {
        const fileIndex = newFiles.findIndex((f) => f.id === fileId);
        if (fileIndex !== -1) {
          newFiles[fileIndex].status = 'error';
          newFiles[fileIndex].error = 'Failed to read file';
        }
      }
    }

    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesAdded?.(updatedFiles);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter((f) => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesAdded?.(updatedFiles);
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    onFilesAdded?.([]);
  };

  const detectAndSplitSVGs = (text: string): string[] => {
    // Match all SVG tags (including nested content)
    const svgRegex = /<svg[\s\S]*?<\/svg>/gi;
    const matches = text.match(svgRegex);
    return matches || [];
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const svgs = detectAndSplitSVGs(text);

      if (svgs.length === 0) {
        alert('No valid SVG content found in clipboard');
        return;
      }

      if (uploadedFiles.length + svgs.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed. Found ${svgs.length} SVGs in clipboard.`);
        return;
      }

      const newFiles: UploadedFile[] = [];

      svgs.forEach((svgContent, index) => {
        const fileId = `pasted-svg-${Date.now()}-${index}`;
        const fileName = `pasted-icon-${index + 1}.svg`;

        // Create a fake File object for pasted content
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const file = new File([blob], fileName, { type: 'image/svg+xml' });

        newFiles.push({
          id: fileId,
          file,
          content: svgContent,
          status: 'success',
          preview: svgContent,
        });
      });

      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      onFilesAdded?.(updatedFiles);
    } catch (error) {
      console.error('Failed to paste:', error);
      alert('Failed to read clipboard. Please try again.');
    }
  };

  const successCount = uploadedFiles.filter((f) => f.status === 'success').length;
  const errorCount = uploadedFiles.filter((f) => f.status === 'error').length;

  return (
    <div className={className}>
      {/* Paste Button */}
      <div className="mb-4">
        <button
          onClick={handlePaste}
          className="w-full py-3 px-4 bg-white/5 border border-white/20 hover:border-white/40 hover:bg-white/10 rounded transition-all flex items-center justify-center gap-2 text-white/80"
        >
          <Clipboard className="w-4 h-4" />
          <span className="text-sm font-medium">Paste SVGs from Clipboard</span>
        </button>
        <p className="text-xs text-white/40 mt-2 text-center">
          Paste one or multiple SVG codes and they'll be automatically detected
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-white/60" />

        <p className="text-white/80 font-medium mb-2">
          {isDragging ? 'Drop files here' : 'Drag & drop SVG files here'}
        </p>

        <p className="text-sm text-white/50 mb-4">
          or click to browse files
        </p>

        <p className="text-xs text-white/40">
          Maximum {maxFiles} files • {maxFileSize}MB per file
        </p>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/80">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
              </span>
              {successCount > 0 && (
                <span className="text-green-400 flex items-center gap-1">
                  <FileCheck className="w-4 h-4" />
                  {successCount} ready
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorCount} failed
                </span>
              )}
            </div>

            <button
              onClick={handleClearAll}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className={`
                  flex items-center justify-between p-3 rounded border
                  ${
                    file.status === 'error'
                      ? 'bg-red-500/10 border-red-500/30'
                      : file.status === 'success'
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/5 border-white/10 animate-pulse'
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 truncate">
                    {file.file.name}
                  </p>
                  {file.error && (
                    <p className="text-xs text-red-400 mt-1">{file.error}</p>
                  )}
                  <p className="text-xs text-white/50 mt-1">
                    {(file.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {file.status === 'success' && (
                    <FileCheck className="w-4 h-4 text-green-400" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  {file.status === 'processing' && (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}

                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
