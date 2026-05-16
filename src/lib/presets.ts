import { svgToJsx } from './converters';

const ATTR_VALUE = '(?:"[^"]*"|\'[^\']*\'|\\{[^}]*\\})';

function stripInjectedAttrs(attrs: string): string {
  return attrs
    .replace(new RegExp(`\\s*\\bwidth=${ATTR_VALUE}`, 'g'), '')
    .replace(new RegExp(`\\s*\\bheight=${ATTR_VALUE}`, 'g'), '')
    .replace(new RegExp(`\\s*\\b(?:class|className)=${ATTR_VALUE}`, 'g'), '')
    .trim();
}

function parseSvg(svgCode: string): { attributes: string; content: string } | null {
  const jsxCode = svgToJsx(svgCode);
  const match = jsxCode.match(/<svg([\s\S]*?)>([\s\S]*)<\/svg>/);
  if (!match) return null;
  return {
    attributes: stripInjectedAttrs(match[1] || ''),
    content: match[2] || '',
  };
}

export function generateReactJS(
  svgCode: string,
  componentName?: string
): string {
  if (!svgCode.trim()) return '';

  const finalName = componentName || 'Icon';
  const parsed = parseSvg(svgCode);
  if (!parsed) return '';

  const { attributes: svgAttributes, content: svgContent } = parsed;

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

  const finalName = componentName || 'Icon';
  const parsed = parseSvg(svgCode);
  if (!parsed) return '';

  const { attributes: svgAttributes, content: svgContent } = parsed;

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

  const finalName = componentName || 'Icon';
  const parsed = parseSvg(svgCode);
  if (!parsed) return '';

  const { attributes: svgAttributes, content: svgContent } = parsed;

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
