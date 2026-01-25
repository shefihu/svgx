import { optimize } from 'svgo';
import type { OptimizationMetrics, OptimizationResult } from './types';

export function optimizeSVG(svgContent: string): OptimizationResult {
  const originalSize = new Blob([svgContent]).size;

  const result = optimize(svgContent, {
    multipass: true,
  });
  const optimized = result.data;
  const optimizedSize = new Blob([optimized]).size;

  const reduction = Math.round(
    ((originalSize - optimizedSize) / originalSize) * 100
  );

  // Count paths
  const pathCount = (optimized.match(/<path/g) || []).length;

  return {
    original: svgContent,
    optimized,
    originalSize,
    optimizedSize,
    reduction: Math.max(0, reduction),
    pathCount,
  };
}

export function getOptimizationMetrics(
  original: string,
  optimized: string
): OptimizationMetrics {
  const originalSize = new Blob([original]).size;
  const optimizedSize = new Blob([optimized]).size;
  const reduction = ((originalSize - optimizedSize) / originalSize) * 100;

  const pathCount = (optimized.match(/<path/g) || []).length;

  return {
    originalSize,
    optimizedSize,
    reduction: Math.max(0, reduction),
    pathCount,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
