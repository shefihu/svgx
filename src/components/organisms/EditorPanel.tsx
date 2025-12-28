import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Panel, CodeEditor } from '@/components/atoms';
import { FileUpload, ActionBar } from '@/components/molecules';

interface EditorPanelProps {
  onSVGChange?: (svg: string) => void;
}

export function EditorPanel({ onSVGChange }: EditorPanelProps) {
  const [svgCode, setSvgCode] = useState('');

  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSvgCode(value);
    onSVGChange?.(value);
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSvgCode(content);
      onSVGChange?.(content);
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSvgCode(text);
      onSVGChange?.(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Panel className="h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold mb-4">SVG Input</h2>
        <FileUpload onFileSelect={handleFileSelect} />
        <div className="mt-4">
          <button
            onClick={handlePaste}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            or paste from clipboard
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <CodeEditor
          value={svgCode}
          onChange={handleCodeChange}
          placeholder="Paste your SVG code here..."
          className="border-0 border-b"
        />
      </div>

      <ActionBar onCopy={handleCopy} onDownload={handleDownload} />
    </Panel>
  );
}
