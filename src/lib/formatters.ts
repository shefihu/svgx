export function formatXml(xml: string, indent = 2): string {
  if (!xml || !xml.trim()) return '';

  const PADDING = ' '.repeat(indent);
  const reg = /(>)(<)(\/*)/g;
  let formatted = '';
  let pad = 0;

  // Add newlines between tags
  xml = xml.replace(reg, '$1\n$2$3');

  // Split by newlines
  const lines = xml.split('\n');

  lines.forEach((line) => {
    let indent = 0;
    const node = line.trim();

    if (!node) return;

    // Decrease indent for closing tags
    if (node.match(/^<\/\w/)) {
      pad -= 1;
    }
    // Self-closing tags or closing tags on same line
    else if (node.match(/^<\w[^>]*[^\/]>.*<\/\w/)) {
      indent = 0;
    }
    // Opening tags
    else if (node.match(/^<\w/) && !node.match(/\/>/)) {
      indent = 1;
    }

    // Apply padding
    formatted += PADDING.repeat(Math.max(0, pad)) + node + '\n';
    pad += indent;
  });

  return formatted.trim();
}

/**
 * Format JSX string with proper indentation
 * @param jsx - The JSX string to format
 * @returns Formatted JSX string
 */
export function formatJsx(jsx: string): string {
  return formatXml(jsx, 2);
}

/**
 * Format HTML string with proper indentation
 * @param html - The HTML string to format
 * @returns Formatted HTML string
 */
export function formatHtml(html: string): string {
  return formatXml(html, 2);
}
