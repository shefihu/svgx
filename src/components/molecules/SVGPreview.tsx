import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';

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
  const handleDownload = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('flex flex-col h-full relative', className)} {...props}>
      {title && (
        <div className="px-4 py-2 border-b border-white/10 text-sm text-white/60">
          {title}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-black">
        {svgContent ? (
          <>
            <button
              onClick={handleDownload}
              className="absolute top-2 right-2 p-2 rounded bg-white/10 hover:bg-white/20 transition-colors z-10"
              title="Download SVG"
            >
              <Download className="w-4 h-4 text-white/60" />
            </button>
            <div
              className="max-w-full max-h-full"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </>
        ) : (
          <div className="text-white/40 text-sm">No SVG loaded</div>
        )}
      </div>
    </div>
  );
}
