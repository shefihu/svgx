import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SVGPreviewProps extends HTMLAttributes<HTMLDivElement> {
  svgContent?: string;
  title?: string;
}

export function SVGPreview({
  svgContent,
  title,
  className,
  ...props
}: SVGPreviewProps) {
  return (
    <div className={cn('flex flex-col h-full', className)} {...props}>
      {title && (
        <div className="px-4 py-2 border-b border-white/10 text-sm text-white/60">
          {title}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-black">
        {svgContent ? (
          <div
            className="max-w-full max-h-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-white/40 text-sm">No SVG loaded</div>
        )}
      </div>
    </div>
  );
}
