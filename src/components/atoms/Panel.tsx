import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {}

const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col bg-black text-white', className)}
        {...props}
      />
    );
  }
);

Panel.displayName = 'Panel';

export { Panel };
