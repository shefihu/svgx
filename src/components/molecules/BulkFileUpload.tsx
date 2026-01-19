import { useRef, useState, useEffect } from 'react';
import type { DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Upload, X, FileCheck, AlertCircle, Clipboard, Edit2, Search } from 'lucide-react';

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
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with prop changes
  useEffect(() => {
    setUploadedFiles(files);
  }, [files]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingFileId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingFileId]);

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
    setSearchQuery('');
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

    const updatedFiles = uploadedFiles.map((f) => {
      if (f.id === fileId) {
        const newFile = new File([f.file], newName, { type: f.file.type });
        return { ...f, file: newFile };
      }
      return f;
    });

    setUploadedFiles(updatedFiles);
    onFilesAdded?.(updatedFiles);
    cancelEditing();
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, fileId: string) => {
    if (e.key === 'Enter') {
      saveFileName(fileId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const filteredFiles = uploadedFiles.filter((file) =>
    file.file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Stats Summary */}
      {uploadedFiles.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white/90">{uploadedFiles.length}</div>
            <div className="text-xs text-white/60 mt-1">Total Files</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{successCount}</div>
            <div className="text-xs text-green-300/80 mt-1">Ready</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{errorCount}</div>
            <div className="text-xs text-red-300/80 mt-1">Errors</div>
          </div>
        </div>
      )}

      {/* Paste Button */}
      <div className="mb-4">
        <button
          onClick={handlePaste}
          className="w-full py-3 px-4 bg-white/5 border border-white/20 hover:border-white/40 hover:bg-white/10 rounded-lg transition-all flex items-center justify-center gap-2 text-white/80"
        >
          <Clipboard className="w-4 h-4" />
          <span className="text-sm font-medium">Paste SVGs from Clipboard</span>
        </button>
        <p className="text-xs text-white/40 mt-2 text-center">
          Paste one or multiple SVG codes - they'll be automatically detected
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
          {/* Search and Actions */}
          <div className="mb-4 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">
                {searchQuery ? `${filteredFiles.length} of ${uploadedFiles.length}` : `${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}`}
              </span>
              <button
                onClick={handleClearAll}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Files */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">
                No files match your search
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`
                    group relative p-3 rounded-lg border transition-all
                    ${
                      file.status === 'error'
                        ? 'bg-red-500/10 border-red-500/30'
                        : file.status === 'success'
                        ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        : 'bg-white/5 border-white/10 animate-pulse'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className="shrink-0 mt-0.5">
                      {file.status === 'success' && (
                        <FileCheck className="w-5 h-5 text-green-400" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      {file.status === 'processing' && (
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      {editingFileId === file.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingFileName}
                          onChange={(e) => setEditingFileName(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, file.id)}
                          onBlur={() => saveFileName(file.id)}
                          className="w-full px-2 py-1 bg-white/10 border border-blue-500 rounded text-sm text-white focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white/90 truncate font-medium">
                            {file.file.name}
                          </p>
                          {file.status === 'success' && (
                            <button
                              onClick={() => startEditing(file)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                              title="Rename file"
                            >
                              <Edit2 className="w-3 h-3 text-white/60" />
                            </button>
                          )}
                        </div>
                      )}
                      {file.error && (
                        <p className="text-xs text-red-400 mt-1">{file.error}</p>
                      )}
                      <p className="text-xs text-white/50 mt-1">
                        {(file.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="shrink-0 p-1.5 hover:bg-red-500/20 rounded transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
