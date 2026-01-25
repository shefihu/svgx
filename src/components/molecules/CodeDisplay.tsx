import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import '@/styles/prism-theme.css';
import { cn } from '@/lib/utils';
import { formatXml } from '@/lib/formatters';

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
  className,
  ...props
}: CodeDisplayProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && code) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

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
      <pre className="p-4 pr-12 text-sm bg-black! m-0! min-w-0 max-w-full">
        <code ref={codeRef} className={`language-${prismLanguage} bg-black!`}>
          {formattedCode}
        </code>
      </pre>
    </div>
  );
}
