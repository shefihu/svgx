import { useState } from 'react';
import {
  Panel,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms';
import { SVGPreview, CodeDisplay } from '@/components/molecules';
import { getOutputByMode } from '@/lib/converters';
import { getPresetOutput } from '@/lib/presets';

interface PreviewPanelProps {
  svgContent?: string;
}

type OutputMode =
  | 'preview'
  | 'jsx'
  | 'html'
  | 'react-js'
  | 'react-ts'
  | 'nextjs'
  | 'bulk-download';

export function PreviewPanel({ svgContent }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<OutputMode>('preview');

  const jsxOutput = getOutputByMode(svgContent || '', 'jsx');
  const htmlOutput = getOutputByMode(svgContent || '', 'html');

  const reactJSOutput = getPresetOutput(svgContent || '', 'react-js');
  const reactTSOutput = getPresetOutput(svgContent || '', 'react-ts');
  const nextJSOutput = getPresetOutput(svgContent || '', 'nextjs');

  return (
    <Panel className="h-full">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as OutputMode)}
      >
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="jsx">JSX</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="react-js">React (JS)</TabsTrigger>
          <TabsTrigger value="react-ts">React (TS)</TabsTrigger>
          <TabsTrigger value="nextjs">Next.js</TabsTrigger>
          <TabsTrigger value="bulk-download">Bulk Download</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <SVGPreview svgContent={svgContent} />
        </TabsContent>

        <TabsContent value="jsx">
          <CodeDisplay code={jsxOutput} language="jsx" />
        </TabsContent>

        <TabsContent value="html">
          <CodeDisplay code={htmlOutput} language="html" />
        </TabsContent>

        <TabsContent value="react-js">
          <CodeDisplay
            code={reactJSOutput}
            language="jsx"
            skipFormatting={true}
          />
        </TabsContent>

        <TabsContent value="react-ts">
          <CodeDisplay
            code={reactTSOutput}
            language="tsx"
            skipFormatting={true}
          />
        </TabsContent>

        <TabsContent value="nextjs">
          <CodeDisplay
            code={nextJSOutput}
            language="tsx"
            skipFormatting={true}
          />
        </TabsContent>

        <TabsContent value="bulk-download">
          <div className="flex items-center justify-center h-full text-white/40 text-sm">
            Bulk Download feature coming soon
          </div>
        </TabsContent>
      </Tabs>
    </Panel>
  );
}
