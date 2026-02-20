import { FileText, TrendingDown, Layers } from 'lucide-react';
import { formatBytes } from '@/lib/optimizer';
import type { OptimizationResult } from '@/lib/types';

interface OptimizationMetricsProps {
  result: OptimizationResult | null;
}

export function OptimizationMetrics({ result }: OptimizationMetricsProps) {
  if (!result) return null;

  return (
    <div className="border-b border-white/10 bg-white/2">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-center gap-8 md:gap-12">
          {/* Original Size */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Original
              </p>
              <p className="text-lg font-semibold">
                {formatBytes(result.originalSize)}
              </p>
            </div>
          </div>

          {/* Optimized Size */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Optimized
              </p>
              <p className="text-lg font-semibold flex items-center gap-2">
                {formatBytes(result.optimizedSize)}
                <span className="text-sm text-green-500 font-medium">
                  -{result.reduction}%
                </span>
              </p>
            </div>
          </div>

          {/* Path Count */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Paths
              </p>
              <p className="text-lg font-semibold">{result.pathCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
