import { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Panel,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms';
import { SVGPreview, CodeDisplay, BulkPreviewGrid } from '@/components/molecules';
import { BulkDownloadPanel } from '@/components/organisms/BulkDownloadPanel';
import { getOutputByMode } from '@/lib/converters';
import { getPresetOutput } from '@/lib/presets';
import type { UploadedFile } from '@/components/molecules/BulkFileUpload';

interface PreviewPanelProps {
  svgContent?: string;
  componentName?: string;
  bulkFiles?: UploadedFile[];
  isBulkMode?: boolean;
  onComponentNameChange?: (name: string) => void;
}

type OutputMode =
  | 'preview'
  | 'jsx'
  | 'html'
  | 'react-js'
  | 'react-ts'
  | 'nextjs'
  | 'bulk-download';

export function PreviewPanel({ svgContent, componentName, bulkFiles = [], isBulkMode = false, onComponentNameChange }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<OutputMode>('preview');

  const hasBulkFiles = bulkFiles.length > 0;
  const hasSvgContent = svgContent && svgContent.trim().length > 0;

  const handleComponentNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onComponentNameChange?.(value);
  };

  const jsxOutput = getOutputByMode(svgContent || '', 'jsx');
  const htmlOutput = getOutputByMode(svgContent || '', 'html');

  const reactJSOutput = getPresetOutput(svgContent || '', 'react-js', componentName);
  const reactTSOutput = getPresetOutput(svgContent || '', 'react-ts', componentName);
  const nextJSOutput = getPresetOutput(svgContent || '', 'nextjs', componentName);

  return (
    <Panel className="h-full">
      {/* Component Name Input - Only show in single mode when there's SVG content */}
      {!isBulkMode && hasSvgContent && (
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <label className="text-sm font-medium text-white/70 whitespace-nowrap">
            Component Name:
          </label>
          <input
            type="text"
            value={componentName ?? ''}
            onChange={handleComponentNameChange}
            placeholder="Icon"
            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as OutputMode)}
        className="flex flex-col flex-1 min-h-0"
      >
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="jsx">JSX</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="react-js">React (JS)</TabsTrigger>
          <TabsTrigger value="react-ts">React (TS)</TabsTrigger>
          <TabsTrigger value="nextjs">Next.js</TabsTrigger>
          {isBulkMode && hasBulkFiles && (
            <TabsTrigger value="bulk-download">Bulk Download</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preview" className="overflow-hidden">
          {hasBulkFiles && isBulkMode ? (
            <BulkPreviewGrid files={bulkFiles} outputMode="preview" className="h-full" />
          ) : (
            <SVGPreview svgContent={svgContent} className="h-full" />
          )}
        </TabsContent>

        <TabsContent value="jsx" className="overflow-hidden">
          {hasBulkFiles && isBulkMode ? (
            <BulkPreviewGrid files={bulkFiles} outputMode="jsx" className="h-full" />
          ) : (
            <CodeDisplay code={jsxOutput} language="jsx" className="h-full" />
          )}
        </TabsContent>

        <TabsContent value="html" className="overflow-hidden">
          {hasBulkFiles && isBulkMode ? (
            <BulkPreviewGrid files={bulkFiles} outputMode="html" className="h-full" />
          ) : (
            <CodeDisplay code={htmlOutput} language="html" className="h-full" />
          )}
        </TabsContent>

        <TabsContent value="react-js" className="overflow-hidden">
          {hasBulkFiles && isBulkMode ? (
            <BulkPreviewGrid files={bulkFiles} outputMode="react-js" className="h-full" />
          ) : (
            <CodeDisplay
              code={reactJSOutput}
              language="jsx"
              skipFormatting={true}
              className="h-full"
            />
          )}
        </TabsContent>

        <TabsContent value="react-ts" className="overflow-hidden">
          {hasBulkFiles && isBulkMode ? (
            <BulkPreviewGrid files={bulkFiles} outputMode="react-ts" className="h-full" />
          ) : (
            <CodeDisplay
              code={reactTSOutput}
              language="tsx"
              skipFormatting={true}
              className="h-full"
            />
          )}
        </TabsContent>

        <TabsContent value="nextjs" className="overflow-hidden">
          {hasBulkFiles && isBulkMode ? (
            <BulkPreviewGrid files={bulkFiles} outputMode="nextjs" className="h-full" />
          ) : (
            <CodeDisplay
              code={nextJSOutput}
              language="tsx"
              skipFormatting={true}
              className="h-full"
            />
          )}
        </TabsContent>

        {isBulkMode && hasBulkFiles && (
          <TabsContent value="bulk-download" className="overflow-hidden">
            <BulkDownloadPanel files={bulkFiles} className="h-full" />
          </TabsContent>
        )}
      </Tabs>
    </Panel>
  );
}
