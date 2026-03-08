'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { suggestSVGName } from '@/lib/actions';
import { Panel } from '@/components/atoms';
import {
  SVGPreview,
  CodeDisplay,
  BulkPreviewGrid,
} from '@/components/molecules';
import { BulkDownloadPanel } from '@/components/organisms/BulkDownloadPanel';
import { getOutputByMode } from '@/lib/converters';
import { getPresetOutput } from '@/lib/presets';
import type { UploadedFile } from '@/components/molecules/BulkFileUpload';
import { Code, Copy, Download, Wand2 } from 'lucide-react';
import { Button } from '@/components/atoms';
import { AINameModal } from '@/components/molecules/AINameModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PreviewPanelProps {
  svgContent?: string;
  componentName?: string;
  bulkFiles?: UploadedFile[];
  isBulkMode?: boolean;
  onComponentNameChange?: (name: string) => void;
  onBulkFilesUpdate?: (files: UploadedFile[]) => void;
}

type FormatMode =
  | 'jsx'
  | 'html'
  | 'react-js'
  | 'react-ts'
  | 'nextjs'
  | 'bulk-download';
type BulkPreviewMode =
  | 'jsx'
  | 'html'
  | 'react-js'
  | 'react-ts'
  | 'nextjs'
  | 'preview';
type ViewMode = 'preview' | 'code';
type ModalState = 'closed' | 'loading' | 'result';

export function PreviewPanel({
  svgContent,
  componentName,
  bulkFiles = [],
  isBulkMode = false,
  onComponentNameChange,
  onBulkFilesUpdate,
}: PreviewPanelProps) {
  const [format, setFormat] = useState<FormatMode>('jsx');
  const [view, setView] = useState<ViewMode>('preview');
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [suggestedName, setSuggestedName] = useState('');
  const [loadingMsgIndex] = useState(() => Math.floor(Math.random() * 4));

  const hasBulkFiles = bulkFiles.length > 0;
  const hasSvgContent = svgContent && svgContent.trim().length > 0;

  const handleComponentNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onComponentNameChange?.(e.target.value);
  };

  const handleSuggestName = async () => {
    if (!svgContent || modalState !== 'closed') return;
    setModalState('loading');
    try {
      const name = await suggestSVGName(svgContent);
      setSuggestedName(name);
      setModalState('result');
    } catch {
      setModalState('closed');
    }
  };

  const handleUseName = () => {
    onComponentNameChange?.(suggestedName);
    setModalState('closed');
  };

  const handleDismiss = () => {
    setModalState('closed');
  };

  const jsxOutput = getOutputByMode(svgContent || '', 'jsx');
  const htmlOutput = getOutputByMode(svgContent || '', 'html');

  const reactJSOutput = getPresetOutput(svgContent || '', 'react-js', componentName);
  const reactTSOutput = getPresetOutput(svgContent || '', 'react-ts', componentName);
  const nextJSOutput = getPresetOutput(svgContent || '', 'nextjs', componentName);

  const getCodeForFormat = () => {
    switch (format) {
      case 'jsx':
        return { code: jsxOutput, language: 'jsx' as const };
      case 'html':
        return { code: htmlOutput, language: 'html' as const };
      case 'react-js':
        return { code: reactJSOutput, language: 'jsx' as const, skipFormatting: true };
      case 'react-ts':
        return { code: reactTSOutput, language: 'tsx' as const, skipFormatting: true };
      case 'nextjs':
        return { code: nextJSOutput, language: 'tsx' as const, skipFormatting: true };
      default:
        return { code: jsxOutput, language: 'jsx' as const };
    }
  };

  const handleCopy = async () => {
    const { code } = getCodeForFormat();
    await navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const { code } = getCodeForFormat();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    let extension = '.jsx';
    if (format === 'html') extension = '.html';
    else if (format === 'react-ts' || format === 'nextjs') extension = '.tsx';

    a.download = `${componentName || 'icon'}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (format === 'bulk-download' && isBulkMode && hasBulkFiles) {
      return <BulkDownloadPanel files={bulkFiles} className="h-full" />;
    }

    if (view === 'preview') {
      if (hasBulkFiles && isBulkMode) {
        return (
          <BulkPreviewGrid
            files={bulkFiles}
            outputMode="preview"
            onFilesUpdated={onBulkFilesUpdate}
            className="h-full"
          />
        );
      }
      return <SVGPreview svgContent={svgContent} className="h-full" />;
    }

    if (hasBulkFiles && isBulkMode) {
      return (
        <BulkPreviewGrid
          files={bulkFiles}
          outputMode={format as BulkPreviewMode}
          onFilesUpdated={onBulkFilesUpdate}
          className="h-full"
        />
      );
    }

    const { code, language, skipFormatting } = getCodeForFormat();
    return (
      <CodeDisplay
        code={code}
        language={language}
        skipFormatting={skipFormatting}
        className="h-full"
      />
    );
  };

  return (
    <>
      <AINameModal
        state={modalState}
        suggestedName={suggestedName}
        loadingMsgIndex={loadingMsgIndex}
        onUse={handleUseName}
        onDismiss={handleDismiss}
      />

      <Panel className="h-full flex flex-col">
        {/* Top Header */}
        {!isBulkMode && hasSvgContent && (
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium text-white">Output</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Second Header */}
        {!isBulkMode && hasSvgContent && (
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Name Input */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white/70 whitespace-nowrap">
                  Name
                </label>
                <input
                  type="text"
                  value={componentName ?? ''}
                  onChange={handleComponentNameChange}
                  placeholder="file"
                  className="w-40 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleSuggestName}
                  disabled={modalState !== 'closed' || !hasSvgContent}
                  title="AI suggest name"
                  className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white/60 hover:text-primary"
                >
                  <Wand2 className={`w-4 h-4 ${modalState === 'loading' ? 'animate-pulse text-primary' : ''}`} />
                </button>
              </div>

              {/* Format Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white/70 whitespace-nowrap">
                  Format
                </label>
                <Select
                  value={format}
                  onValueChange={(value) => setFormat(value as FormatMode)}
                >
                  <SelectTrigger size="sm" className="w-35">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jsx">JSX</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="react-js">React (JS)</SelectItem>
                    <SelectItem value="react-ts">React (TS)</SelectItem>
                    <SelectItem value="nextjs">Next.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview/Code Tabs */}
            <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
              <TabsList variant="default">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Bulk mode headers */}
        {isBulkMode && hasBulkFiles && (
          <>
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-white/70" />
                <span className="text-sm font-medium text-white">Output</span>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white/70 whitespace-nowrap">
                  Format
                </label>
                <Select
                  value={format}
                  onValueChange={(value) => setFormat(value as FormatMode)}
                >
                  <SelectTrigger size="sm" className="w-35">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jsx">JSX</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="react-js">React (JS)</SelectItem>
                    <SelectItem value="react-ts">React (TS)</SelectItem>
                    <SelectItem value="nextjs">Next.js</SelectItem>
                    <SelectItem value="bulk-download">Bulk Download</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {format !== 'bulk-download' && (
                <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
                  <TabsList variant="default">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </>
        )}

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">{renderContent()}</div>
      </Panel>
    </>
  );
}
