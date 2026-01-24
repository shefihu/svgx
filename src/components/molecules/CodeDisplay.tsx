import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import '@/styles/prism-theme.css';
import { cn } from '@/lib/utils';
import { formatXml } from '@/lib/formatters';
import { Copy, Check, Download } from 'lucide-react';

interface CodeDisplayProps extends HTMLAttributes<HTMLDivElement> {
  code?: string;
  language?: 'jsx' | 'html' | 'svg' | 'typescript' | 'tsx' | 'javascript';
  skipFormatting?: boolean;
  filename?: string;
}

export function CodeDisplay({
  code,
  language = 'jsx',
  skipFormatting = false,
  filename,
  className,
  ...props
}: CodeDisplayProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current && code) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!code) return;

    const fileExtension = language === 'html' ? 'html' : language === 'tsx' || language === 'typescript' ? 'tsx' : language === 'jsx' || language === 'javascript' ? 'jsx' : 'txt';
    const defaultFilename = `export.${fileExtension}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || defaultFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!code) {
    return (
      <div
        className={cn('h-full overflow-auto bg-black', className)}
        {...props}
      >
        <div className="flex items-center justify-center h-full text-white/40 text-sm">
          No {language.toUpperCase()} output available
        </div>
      </div>
    );
  }

  const shouldFormat =
    !skipFormatting &&
    (language === 'jsx' ||
      language === 'html' ||
      language === 'svg' ||
      language === 'tsx');
  const formattedCode = shouldFormat ? formatXml(code) : code;

  const prismLanguageMap: Record<string, string> = {
    jsx: 'jsx',
    tsx: 'tsx',
    typescript: 'typescript',
    javascript: 'javascript',
    html: 'markup',
    svg: 'markup',
  };
  const prismLanguage = prismLanguageMap[language] || 'markup';

  return (
    <div
      className={cn(
        'h-full overflow-y-auto overflow-x-hidden bg-black relative',
        className
      )}
      {...props}
    >
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          onClick={handleCopy}
          className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/60" />
          )}
        </button>
        <button
          onClick={handleDownload}
          className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
          title="Download file"
        >
          <Download className="w-4 h-4 text-white/60" />
        </button>
      </div>
      <pre className="p-4 pr-12 text-sm bg-black! m-0! min-w-0 max-w-full">
        <code ref={codeRef} className={`language-${prismLanguage} bg-black!`}>
          {formattedCode}
        </code>
      </pre>
    </div>
  );
}
