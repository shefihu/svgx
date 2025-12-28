import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  onCopy?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function ActionBar({ onCopy, onDownload, className }: ActionBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4 border-t border-white/10',
        className
      )}
    >
      <Button variant="outline" size="sm" onClick={onCopy} className="flex-1">
        <Copy className="w-4 h-4" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
        className="flex-1"
      >
        <Download className="w-4 h-4" />
        Download
      </Button>
    </div>
  );
}
