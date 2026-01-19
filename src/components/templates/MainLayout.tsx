import { useState } from 'react';
import { EditorPanel, PreviewPanel } from '@/components/organisms';
import { BulkFileUpload } from '@/components/molecules/BulkFileUpload';
import type { UploadedFile } from '@/components/molecules/BulkFileUpload';
import { Package, CheckCircle } from 'lucide-react';

export function MainLayout() {
  const [svgContent, setSvgContent] = useState('');
  const [componentName, setComponentName] = useState('Icon');
  const [bulkFiles, setBulkFiles] = useState<UploadedFile[]>([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAutoSwitchNotification, setShowAutoSwitchNotification] = useState(false);

  const handleSVGChange = (svg: string) => {
    setSvgContent(svg);
  };

  const handleComponentNameChange = (name: string) => {
    setComponentName(name);
  };

  const handleBulkFilesAdded = (files: UploadedFile[]) => {
    setBulkFiles(files);
  };

  const handleModeToggle = () => {
    const newMode = !showBulkUpload;
    setShowBulkUpload(newMode);

    // Clear bulk files when switching from bulk to single mode
    if (!newMode) {
      setBulkFiles([]);
    }
  };

  const handleMultipleSVGsDetected = (svgs: string[]) => {
    console.log('[MainLayout] handleMultipleSVGsDetected called with', svgs.length, 'SVGs');
    console.log('[MainLayout] Current showBulkUpload:', showBulkUpload);

    // Convert SVG strings to UploadedFile format
    const startIndex = bulkFiles.length > 0 ? bulkFiles.length : 0;
    const newFiles: UploadedFile[] = svgs.map((svg, index) => ({
      id: `auto-detected-${Date.now()}-${index}`,
      file: new File([svg], `pasted-icon-${startIndex + index + 1}.svg`, { type: 'image/svg+xml' }),
      content: svg,
      status: 'success' as const,
    }));

    console.log('[MainLayout] Created', newFiles.length, 'new files');

    // Add to existing bulk files
    setBulkFiles((prev) => {
      console.log('[MainLayout] Adding files, prev count:', prev.length);
      return [...prev, ...newFiles];
    });

    // Switch to bulk mode if not already in it
    if (!showBulkUpload) {
      console.log('[MainLayout] Switching to bulk mode!');
      setShowBulkUpload(true);

      // Show notification only when auto-switching
      setShowAutoSwitchNotification(true);
      setTimeout(() => {
        setShowAutoSwitchNotification(false);
      }, 3000);
    } else {
      console.log('[MainLayout] Already in bulk mode, not showing notification');
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden relative">
      {/* Auto-Switch Notification */}
      {showAutoSwitchNotification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {bulkFiles.length} SVGs detected - Switched to Bulk Mode
            </span>
          </div>
        </div>
      )}

      <header className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SVGX</h1>
            <p className="text-sm text-white/60 mt-1">
              SVG Optimization & Conversion Tool
            </p>
          </div>
          <button
            onClick={handleModeToggle}
            className={`
              flex items-center gap-2 px-4 py-2 rounded border transition-all
              ${
                showBulkUpload
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-white/5 border-white/10 hover:border-white/30 text-white/80'
              }
            `}
          >
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showBulkUpload ? 'Single Mode' : 'Bulk Mode'}
            </span>
            {bulkFiles.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {bulkFiles.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showBulkUpload ? (
          // Bulk Upload Mode
          <>
            <div className="w-1/2 border-r border-white/10 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-semibold mb-2">Bulk Upload</h2>
                <p className="text-sm text-white/60">
                  Upload multiple SVG files and download them in various formats
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <BulkFileUpload
                  files={bulkFiles}
                  onFilesAdded={handleBulkFilesAdded}
                />
              </div>
            </div>

            <div className="w-1/2 flex flex-col">
              <PreviewPanel
                svgContent={svgContent}
                componentName={componentName}
                bulkFiles={bulkFiles}
                isBulkMode={true}
              />
            </div>
          </>
        ) : (
          // Single File Mode
          <>
            <div className="w-1/2 border-r border-white/10 flex flex-col">
              <EditorPanel
                onSVGChange={handleSVGChange}
                onMultipleSVGsDetected={handleMultipleSVGsDetected}
              />
            </div>

            <div className="w-1/2 flex flex-col">
              <PreviewPanel
                svgContent={svgContent}
                componentName={componentName}
                bulkFiles={bulkFiles}
                isBulkMode={false}
                onComponentNameChange={handleComponentNameChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
