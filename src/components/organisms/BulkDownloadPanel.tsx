import { useState } from 'react';
import { Download, Package, Settings, Check } from 'lucide-react';
import type { UploadedFile } from '@/components/molecules/BulkFileUpload';
import { getPresetOutput } from '@/lib/presets';
import { getOutputByMode } from '@/lib/converters';

interface BulkDownloadPanelProps {
  files: UploadedFile[];
  className?: string;
}

type OutputFormat = {
  id: string;
  label: string;
  extension: string;
  folder: string;
  enabled: boolean;
};

type NamingConvention = 'original' | 'kebab-case' | 'PascalCase' | 'camelCase';

export function BulkDownloadPanel({ files, className = '' }: BulkDownloadPanelProps) {
  const [formats, setFormats] = useState<OutputFormat[]>([
    { id: 'svg', label: 'Original SVG', extension: 'svg', folder: 'svg', enabled: true },
    { id: 'jsx', label: 'JSX', extension: 'jsx', folder: 'jsx', enabled: false },
    { id: 'react-js', label: 'React (JS)', extension: 'jsx', folder: 'react-js', enabled: false },
    { id: 'react-ts', label: 'React (TS)', extension: 'tsx', folder: 'react-ts', enabled: false },
    { id: 'nextjs', label: 'Next.js', extension: 'tsx', folder: 'nextjs', enabled: false },
  ]);

  const [namingConvention, setNamingConvention] = useState<NamingConvention>('original');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const successfulFiles = files.filter((f) => f.status === 'success');
  const enabledFormats = formats.filter((f) => f.enabled);

  const toggleFormat = (formatId: string) => {
    setFormats((prev) =>
      prev.map((f) => (f.id === formatId ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const toggleAllFormats = () => {
    const allEnabled = formats.every((f) => f.enabled);
    setFormats((prev) => prev.map((f) => ({ ...f, enabled: !allEnabled })));
  };

  const convertFileName = (fileName: string, convention: NamingConvention): string => {
    // Remove .svg extension and clean
    const baseName = fileName.replace(/\.svg$/i, '').replace(/[^a-zA-Z0-9-_]/g, '-');

    switch (convention) {
      case 'kebab-case':
        return baseName
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .toLowerCase()
          .replace(/[_\s]+/g, '-')
          .replace(/-+/g, '-');

      case 'PascalCase':
        return baseName
          .split(/[-_\s]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');

      case 'camelCase': {
        const pascal = baseName
          .split(/[-_\s]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
      }

      case 'original':
      default:
        return baseName;
    }
  };

  const generateOutput = (
    svgContent: string,
    format: OutputFormat,
    fileName: string
  ): string => {
    const componentNameForFile = convertFileName(fileName, namingConvention);

    switch (format.id) {
      case 'svg':
        return svgContent;
      case 'jsx':
        return getOutputByMode(svgContent, 'jsx');
      case 'react-js':
        return getPresetOutput(svgContent, 'react-js', componentNameForFile);
      case 'react-ts':
        return getPresetOutput(svgContent, 'react-ts', componentNameForFile);
      case 'nextjs':
        return getPresetOutput(svgContent, 'nextjs', componentNameForFile);
      default:
        return svgContent;
    }
  };

  const handleDownloadAll = async () => {
    if (successfulFiles.length === 0 || enabledFormats.length === 0) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Dynamic import of JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const totalOperations = successfulFiles.length * enabledFormats.length;
      let completed = 0;

      // Generate all files
      for (const file of successfulFiles) {
        const baseName = file.file.name.replace(/\.svg$/i, '');
        const convertedName = convertFileName(baseName, namingConvention);

        for (const format of enabledFormats) {
          const output = generateOutput(file.content, format, baseName);
          const fileName = `${convertedName}.${format.extension}`;
          const filePath = `${format.folder}/${fileName}`;

          zip.file(filePath, output);

          completed++;
          setProgress(Math.round((completed / totalOperations) * 100));

          // Small delay to allow UI updates
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      // Generate README
      const readme = generateReadme(successfulFiles.length, enabledFormats);
      zip.file('README.md', readme);

      // Generate ZIP file
      const blob = await zip.generateAsync({ type: 'blob' });

      // Download ZIP
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `svgx-export-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error generating ZIP:', error);
      alert('Failed to generate ZIP file. Please try again.');
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const generateReadme = (fileCount: number, formats: OutputFormat[]): string => {
    return `# SVGX Bulk Export

Generated: ${new Date().toLocaleString()}

## Export Summary

- **Total Files**: ${fileCount}
- **Formats**: ${formats.map((f) => f.label).join(', ')}
- **Naming Convention**: ${namingConvention}

## Folder Structure

${formats.map((f) => `- \`${f.folder}/\` - ${f.label} files`).join('\n')}

## Usage

Each folder contains the converted files in the respective format. Import and use them in your project as needed.

---

Generated with [SVGX](https://github.com/yourusername/svgx) - SVG Optimization & Conversion Tool
`;
  };

  return (
    <div className={`flex flex-col p-6 overflow-y-auto ${className}`}>
      {successfulFiles.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Package className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-medium text-white/80 mb-2">
              No files ready for download
            </h3>
            <p className="text-sm text-white/50">
              Upload SVG files using the bulk upload feature to get started with bulk downloads.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Format Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Export Formats
              </h3>
              <button
                onClick={toggleAllFormats}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {formats.every((f) => f.enabled) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {formats.map((format) => (
                <label
                  key={format.id}
                  className={`
                    flex items-center gap-3 p-3 rounded border cursor-pointer transition-all
                    ${
                      format.enabled
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={format.enabled}
                    onChange={() => toggleFormat(format.id)}
                    className="sr-only"
                  />
                  <div
                    className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                      ${
                        format.enabled
                          ? 'bg-primary border-primary'
                          : 'border-white/30'
                      }
                    `}
                  >
                    {format.enabled && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-white/90">{format.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Naming Convention */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4">
              File Naming Convention
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(['original', 'kebab-case', 'PascalCase', 'camelCase'] as NamingConvention[]).map(
                (convention) => (
                  <label
                    key={convention}
                    className={`
                      flex items-center gap-3 p-3 rounded border cursor-pointer transition-all
                      ${
                        namingConvention === convention
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="naming"
                      checked={namingConvention === convention}
                      onChange={() => setNamingConvention(convention)}
                      className="sr-only"
                    />
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${
                          namingConvention === convention
                            ? 'bg-primary border-primary'
                            : 'border-white/30'
                        }
                      `}
                    >
                      {namingConvention === convention && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-sm text-white/90">{convention}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Export Summary */}
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded">
            <h4 className="text-sm font-medium text-white/80 mb-3">Export Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Files to export:</span>
                <span className="text-white/90 font-medium">{successfulFiles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Selected formats:</span>
                <span className="text-white/90 font-medium">{enabledFormats.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total files in ZIP:</span>
                <span className="text-white/90 font-medium">
                  {successfulFiles.length * enabledFormats.length}
                </span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadAll}
            disabled={isGenerating || enabledFormats.length === 0}
            className={`
              w-full py-4 px-6 rounded font-medium flex items-center justify-center gap-2
              transition-all
              ${
                isGenerating || enabledFormats.length === 0
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 text-white'
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating... {progress}%</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download All as ZIP</span>
              </>
            )}
          </button>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mt-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
