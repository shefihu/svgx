import { svgToJsx } from './converters';

export function generateReactJS(
  svgCode: string,
  componentName?: string
): string {
  if (!svgCode.trim()) return '';

  // Use provided component name or default to 'Icon'
  const finalName = componentName || 'Icon';

  const jsxCode = svgToJsx(svgCode);

  // Extract SVG attributes and content
  const svgMatch = jsxCode.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  if (!svgMatch) return '';

  let svgAttributes = svgMatch[1] || '';
  const svgContent = svgMatch[2] || '';

  // Remove width, height, and className from original attributes
  svgAttributes = svgAttributes
    .replace(/\s*width="[^"]*"/g, '')
    .replace(/\s*height="[^"]*"/g, '')
    .replace(/\s*className="[^"]*"/g, '')
    .trim();

  return `export const ${finalName} = ({ className, width = 24, height = 24 }) => (
  <svg
    className={className}
    width={width}
    height={height}${svgAttributes ? '\n    ' + svgAttributes : ''}
  >
${svgContent
  .split('\n')
  .map((line) => (line ? '    ' + line : ''))
  .join('\n')}
  </svg>
);`;
}

export function generateReactTS(
  svgCode: string,
  componentName?: string
): string {
  if (!svgCode.trim()) return '';

  // Use provided component name or default to 'Icon'
  const finalName = componentName || 'Icon';

  const jsxCode = svgToJsx(svgCode);

  // Extract SVG attributes and content
  const svgMatch = jsxCode.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  if (!svgMatch) return '';

  let svgAttributes = svgMatch[1] || '';
  const svgContent = svgMatch[2] || '';

  // Remove width, height, and className from original attributes
  svgAttributes = svgAttributes
    .replace(/\s*width="[^"]*"/g, '')
    .replace(/\s*height="[^"]*"/g, '')
    .replace(/\s*className="[^"]*"/g, '')
    .trim();

  return `interface ${finalName}Props {
  className?: string;
  width?: number;
  height?: number;
}

export const ${finalName} = ({
  className,
  width = 24,
  height = 24
}: ${finalName}Props) => (
  <svg
    className={className}
    width={width}
    height={height}${svgAttributes ? '\n    ' + svgAttributes : ''}
  >
${svgContent
  .split('\n')
  .map((line) => (line ? '    ' + line : ''))
  .join('\n')}
  </svg>
);`;
}

export function generateNextJS(
  svgCode: string,
  componentName?: string
): string {
  if (!svgCode.trim()) return '';

  // Use provided component name or default to 'Icon'
  const finalName = componentName || 'Icon';

  const jsxCode = svgToJsx(svgCode);

  // Extract SVG attributes and content
  const svgMatch = jsxCode.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  if (!svgMatch) return '';

  let svgAttributes = svgMatch[1] || '';
  const svgContent = svgMatch[2] || '';

  // Remove width, height, and className from original attributes
  svgAttributes = svgAttributes
    .replace(/\s*width="[^"]*"/g, '')
    .replace(/\s*height="[^"]*"/g, '')
    .replace(/\s*className="[^"]*"/g, '')
    .trim();

  return `'use client';

interface ${finalName}Props {
  className?: string;
  size?: number;
}

export function ${finalName}({ className, size = 24 }: ${finalName}Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}${svgAttributes ? '\n      ' + svgAttributes : ''}
    >
${svgContent
  .split('\n')
  .map((line) => (line ? '      ' + line : ''))
  .join('\n')}
    </svg>
  );
}`;
}

export function generateHTML(svgCode: string): string {
  if (!svgCode.trim()) return '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SVG Icon</title>
</head>
<body>
  ${svgCode}
</body>
</html>`;
}

export function getPresetOutput(
  svgCode: string,
  preset: 'react-js' | 'react-ts' | 'nextjs' | 'html',
  componentName?: string
): string {
  switch (preset) {
    case 'react-js':
      return generateReactJS(svgCode, componentName);
    case 'react-ts':
      return generateReactTS(svgCode, componentName);
    case 'nextjs':
      return generateNextJS(svgCode, componentName);
    case 'html':
      return generateHTML(svgCode);
    default:
      return svgCode;
  }
}
