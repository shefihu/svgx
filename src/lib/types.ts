export interface OptimizationMetrics {
  originalSize: number;
  optimizedSize: number;
  reduction: number;
  pathCount: number;
}

export interface OptimizationResult {
  original: string;
  optimized: string;
  originalSize: number;
  optimizedSize: number;
  reduction: number;
  pathCount: number;
}
