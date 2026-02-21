import { useState } from 'react';
import type { ChangeEvent, ClipboardEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { Panel, CodeEditor, Button } from '@/components/atoms';
import { FileUpload } from '@/components/molecules';
import { detectAndSplitSVGs } from '@/lib/utils';
import { optimizeSVG } from '@/lib/optimizer';
import type { OptimizationResult } from '@/lib/types';

interface EditorPanelProps {
  onSVGChange?: (svg: string) => void;
  onMultipleSVGsDetected?: (svgs: string[]) => void;
  onOptimizationComplete?: (result: OptimizationResult) => void;
}

export function EditorPanel({
  onSVGChange,
  onMultipleSVGsDetected,
  onOptimizationComplete,
}: EditorPanelProps) {
  const [svgCode, setSvgCode] = useState('');
  const [isOptimized, setIsOptimized] = useState(false);

  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSvgCode(value);
    onSVGChange?.(value);
    // Reset optimization status when user manually edits
    setIsOptimized(false);
  };

  const handleNativePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const target = e.currentTarget;
    const hasSelection = target.selectionStart !== target.selectionEnd;

    // If user has selected text, they're replacing it, not appending
    // So only check the pasted content for multiple SVGs
    // Otherwise, check if combining existing content with new paste creates multiple SVGs
    const combinedContent = hasSelection
      ? pastedText
      : svgCode.trim()
        ? `${svgCode}\n${pastedText}`
        : pastedText;

    const svgs = detectAndSplitSVGs(combinedContent);

    if (svgs.length > 1) {
      // Multiple SVGs detected - prevent default paste and switch to bulk mode
      e.preventDefault();
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
        setIsOptimized(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      // Check if the pasted text itself contains multiple SVGs
      const svgs = detectAndSplitSVGs(text);

      if (svgs.length > 1) {
        // Multiple SVGs detected - switch to bulk mode
        onMultipleSVGsDetected?.(svgs);
      } else {
        // Single SVG or plain text - proceed normally
        setSvgCode(text);
        onSVGChange?.(text);
        setIsOptimized(false);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleOptimize = () => {
    if (!svgCode.trim() || isOptimized) return;

    try {
      const result = optimizeSVG(svgCode);

      // Update the editor with optimized SVG
      setSvgCode(result.optimized);
      onSVGChange?.(result.optimized);

      // Mark as optimized
      setIsOptimized(true);

      // Pass optimization result to parent
      onOptimizationComplete?.(result);
    } catch (err) {
      console.error('Failed to optimize SVG:', err);
    }
  };

  return (
    <Panel className="h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold mb-4">SVG Input</h2>
          <div className="flex gap-2">
            <FileUpload onFileSelect={handleFileSelect} />
            <Button
              variant="default"
              onClick={handleOptimize}
              disabled={!svgCode.trim() || isOptimized}
              title={isOptimized ? 'Already optimized' : 'Optimize SVG'}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">
                {isOptimized ? 'Optimized' : 'Optimize'}
              </span>
            </Button>
          </div>
        </div>
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
