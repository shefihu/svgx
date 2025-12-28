import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CodeEditorProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full h-full resize-none bg-black text-white font-mono text-sm p-4 border border-white/10 focus:outline-none focus:border-white/30 transition-colors',
          className
        )}
        spellCheck={false}
        {...props}
      />
    );
  }
);

CodeEditor.displayName = 'CodeEditor';

export { CodeEditor };
