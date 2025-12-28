import { useState } from 'react';
import { EditorPanel, PreviewPanel } from '@/components/organisms';

export function MainLayout() {
  const [svgContent, setSvgContent] = useState('');

  const handleSVGChange = (svg: string) => {
    setSvgContent(svg);
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <header className="border-b border-white/10 px-6 py-4">
        <h1 className="text-2xl font-bold">SVGX</h1>
        <p className="text-sm text-white/60 mt-1">
          SVG Optimization & Conversion Tool
        </p>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-white/10 flex flex-col">
          <EditorPanel onSVGChange={handleSVGChange} />
        </div>

        <div className="w-1/2 flex flex-col">
          <PreviewPanel svgContent={svgContent} />
        </div>
      </div>
    </div>
  );
}
