import { useState, useMemo } from 'react';
import { X, Wand2, RotateCcw } from 'lucide-react';
import type { UploadedFile } from './BulkFileUpload';

interface BulkRenameModalProps {
  isOpen: boolean;
  files: UploadedFile[];
  onClose: () => void;
  onApply: (updatedFiles: UploadedFile[]) => void;
}

type RenamePattern = 'prefix' | 'suffix' | 'replace' | 'numbering';

export function BulkRenameModal({
  isOpen,
  files,
  onClose,
  onApply,
}: BulkRenameModalProps) {
  const [pattern, setPattern] = useState<RenamePattern>('numbering');
  const [prefixText, setPrefixText] = useState('');
  const [suffixText, setSuffixText] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [numberingStart, setNumberingStart] = useState(1);
  const [numberingPadding, setNumberingPadding] = useState(2);
  const previewFiles = useMemo(() => {
    if (!isOpen) return [];

    return files.map((file, index) => {
      const baseName = file.file.name.replace(/\.svg$/i, '');
      let newName = baseName;

      switch (pattern) {
        case 'prefix':
          newName = prefixText ? `${prefixText}${baseName}` : baseName;
          break;
        case 'suffix':
          newName = suffixText ? `${baseName}${suffixText}` : baseName;
          break;
        case 'replace':
          newName = findText ? baseName.replace(new RegExp(findText, 'g'), replaceText) : baseName;
          break;
        case 'numbering': {
          const num = (numberingStart + index).toString().padStart(numberingPadding, '0');
          newName = `${baseName}-${num}`;
          break;
        }
      }

      newName = `${newName}.svg`;
      const newFile = new File([file.file], newName, { type: file.file.type });
      return { ...file, file: newFile };
    });
  }, [files, isOpen, pattern, prefixText, suffixText, findText, replaceText, numberingStart, numberingPadding]);

  const handleApply = () => {
    onApply(previewFiles);
    onClose();
  };

  const handleReset = () => {
    setPrefixText('');
    setSuffixText('');
    setFindText('');
    setReplaceText('');
    setNumberingStart(1);
    setNumberingPadding(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black border border-white/20 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Bulk Rename</h2>
              <p className="text-sm text-white/60 mt-0.5">Rename {files.length} files at once</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Pattern Selection */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Rename Pattern
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['numbering', 'prefix', 'suffix', 'replace'] as RenamePattern[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPattern(p)}
                  className={`
                    px-4 py-3 rounded-lg border text-left transition-all
                    ${
                      pattern === p
                        ? 'bg-primary/20 border-primary/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                    }
                  `}
                >
                  <div className="font-medium capitalize">{p}</div>
                  <div className="text-xs text-white/50 mt-1">
                    {p === 'numbering' && 'Add numbers to filenames'}
                    {p === 'prefix' && 'Add text before filename'}
                    {p === 'suffix' && 'Add text after filename'}
                    {p === 'replace' && 'Find and replace text'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Options */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            {pattern === 'prefix' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Prefix Text
                </label>
                <input
                  type="text"
                  value={prefixText}
                  onChange={(e) => setPrefixText(e.target.value)}
                  placeholder="icon-"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {pattern === 'suffix' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Suffix Text
                </label>
                <input
                  type="text"
                  value={suffixText}
                  onChange={(e) => setSuffixText(e.target.value)}
                  placeholder="-icon"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {pattern === 'replace' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Find Text
                  </label>
                  <input
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="old"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Replace With
                  </label>
                  <input
                    type="text"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="new"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {pattern === 'numbering' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Start Number
                  </label>
                  <input
                    type="number"
                    value={numberingStart}
                    onChange={(e) => setNumberingStart(parseInt(e.target.value) || 1)}
                    min="0"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Number Padding (digits)
                  </label>
                  <input
                    type="number"
                    value={numberingPadding}
                    onChange={(e) => setNumberingPadding(parseInt(e.target.value) || 1)}
                    min="1"
                    max="5"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Example: 2 digits = 01, 02, 03...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white/80">
                Preview ({previewFiles.length} files)
              </label>
              <button
                onClick={handleReset}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
              {previewFiles.slice(0, 10).map((file, index) => (
                <div key={file.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/60 truncate flex-1">
                    {files[index].file.name}
                  </span>
                  <span className="mx-3 text-white/40">→</span>
                  <span className="text-primary truncate flex-1 text-right font-medium">
                    {file.file.name}
                  </span>
                </div>
              ))}
              {previewFiles.length > 10 && (
                <div className="text-center text-xs text-white/40 pt-2">
                  ... and {previewFiles.length - 10} more files
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
          >
            Apply to All Files
          </button>
        </div>
      </div>
    </div>
  );
}
