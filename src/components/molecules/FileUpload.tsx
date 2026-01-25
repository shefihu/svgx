import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = '.svg',
  className,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button variant="outline" onClick={handleClick}>
        <Upload className="w-4 h-4" />
        Upload
      </Button>
    </div>
  );
}
