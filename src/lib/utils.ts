import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects and splits multiple SVG elements from a text string
 * Returns an array of individual SVG strings
 */
export function detectAndSplitSVGs(text: string): string[] {
  if (!text.trim()) {
    console.log('[detectAndSplitSVGs] Empty text received');
    return [];
  }

  console.log('[detectAndSplitSVGs] Input text length:', text.length);

  // Split by </svg> and filter out empty strings
  const parts = text.split('</svg>').filter((part) => part.trim());
  console.log('[detectAndSplitSVGs] Found parts after split:', parts.length);

  // Reconstruct each SVG by adding back the closing tag
  const svgs = parts
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return null;

      // Find the start of the SVG tag
      const svgStart = trimmed.indexOf('<svg');
      if (svgStart === -1) return null;

      // Return the complete SVG
      return trimmed.substring(svgStart) + '</svg>';
    })
    .filter((svg): svg is string => svg !== null && svg.includes('<svg'));

  console.log('[detectAndSplitSVGs] Detected SVGs count:', svgs.length);
  return svgs;
}

/**
 * Checks if a string contains valid SVG content
 */
export function isValidSVG(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.includes('<svg') && trimmed.includes('</svg>');
}
