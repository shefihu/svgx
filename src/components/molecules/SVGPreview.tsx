'use client';

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
    <div className={cn('flex flex-col h-full relative', className)} {...props}>
      {title && (
        <div className="px-4 py-2 border-b border-white/10 text-sm text-white/60">
          {title}
        </div>
      )}
      <div
        className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden"
        style={{
          backgroundColor: '#1a1a1a',
          backgroundImage:
            'linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        {svgContent ? (
          <div
            className="flex items-center justify-center w-full h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-white/40 text-sm">No SVG loaded</div>
        )}
      </div>
    </div>
  );
}
