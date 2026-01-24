import { useState } from 'react';
import type { ChangeEvent, ClipboardEvent } from 'react';
import { Panel, CodeEditor } from '@/components/atoms';
import { FileUpload } from '@/components/molecules';
import { detectAndSplitSVGs } from '@/lib/utils';

interface EditorPanelProps {
  onSVGChange?: (svg: string) => void;
  onMultipleSVGsDetected?: (svgs: string[]) => void;
}

export function EditorPanel({
  onSVGChange,
  onMultipleSVGsDetected,
}: EditorPanelProps) {
  const [svgCode, setSvgCode] = useState('');

  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSvgCode(value);
    onSVGChange?.(value);
  };

  const handleNativePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    console.log('[EditorPanel] Native paste detected, text length:', pastedText.length);

    // Check if combining existing content with new paste creates multiple SVGs
    const combinedContent = svgCode.trim() ? `${svgCode}\n${pastedText}` : pastedText;
    const svgs = detectAndSplitSVGs(combinedContent);
    console.log('[EditorPanel] Detected SVGs in combined content:', svgs.length);

    if (svgs.length > 1) {
      // Multiple SVGs detected - prevent default paste and switch to bulk mode
      e.preventDefault();
      console.log('[EditorPanel] Multiple SVGs detected! Calling onMultipleSVGsDetected');
      onMultipleSVGsDetected?.(svgs);
    }
    // If single SVG, let the default paste behavior happen (will trigger handleCodeChange)
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Check if the single file contains multiple SVGs
      const svgs = detectAndSplitSVGs(content);

      if (svgs.length > 1) {
        // Multiple SVGs in one file - notify parent to switch to bulk mode
        onMultipleSVGsDetected?.(svgs);
      } else {
        // Single SVG - proceed normally
        setSvgCode(content);
        onSVGChange?.(content);
      }
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      console.log('[EditorPanel] Pasted text length:', text.length);

      // Check if combining existing content with new paste creates multiple SVGs
      const combinedContent = svgCode.trim() ? `${svgCode}\n${text}` : text;
      const svgs = detectAndSplitSVGs(combinedContent);
      console.log('[EditorPanel] Detected SVGs in combined content:', svgs.length);

      if (svgs.length > 1) {
        // Multiple SVGs detected (either in paste alone or combined with existing) - switch to bulk mode
        console.log('[EditorPanel] Multiple SVGs detected! Calling onMultipleSVGsDetected');
        onMultipleSVGsDetected?.(svgs);
      } else {
        // Single SVG or plain text - proceed normally
        console.log('[EditorPanel] Single SVG or text, proceeding normally');
        setSvgCode(text);
        onSVGChange?.(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
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
          onPaste={handleNativePaste}
          placeholder="Paste your SVG code here..."
          className="border-0 border-b"
        />
      </div>
    </Panel>
  );
}
