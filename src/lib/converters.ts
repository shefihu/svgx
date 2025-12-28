export function svgToJsx(svgCode: string): string {
  if (!svgCode.trim()) return '';

  let jsxCode = svgCode;

  // Convert attribute names to camelCase
  const attributeMap: Record<string, string> = {
    class: 'className',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'stroke-miterlimit': 'strokeMiterlimit',
    'fill-opacity': 'fillOpacity',
    'stroke-opacity': 'strokeOpacity',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    'font-family': 'fontFamily',
    'font-size': 'fontSize',
    'font-weight': 'fontWeight',
    'text-anchor': 'textAnchor',
    'xmlns:xlink': 'xmlnsXlink',
    'xlink:href': 'xlinkHref',
  };

  // Replace attributes
  Object.entries(attributeMap).forEach(([htmlAttr, jsxAttr]) => {
    const regex = new RegExp(`\\s${htmlAttr}=`, 'g');
    jsxCode = jsxCode.replace(regex, ` ${jsxAttr}=`);
  });

  return jsxCode;
}

/**
 * Convert JSX back to SVG (HTML format)
 */
export function jsxToSvg(jsxCode: string): string {
  if (!jsxCode.trim()) return '';

  let svgCode = jsxCode;

  // Convert JSX attributes back to HTML
  const attributeMap: Record<string, string> = {
    className: 'class',
    strokeWidth: 'stroke-width',
    strokeLinecap: 'stroke-linecap',
    strokeLinejoin: 'stroke-linejoin',
    fillRule: 'fill-rule',
    clipRule: 'clip-rule',
    strokeDasharray: 'stroke-dasharray',
    strokeDashoffset: 'stroke-dashoffset',
    strokeMiterlimit: 'stroke-miterlimit',
    fillOpacity: 'fill-opacity',
    strokeOpacity: 'stroke-opacity',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontWeight: 'font-weight',
    textAnchor: 'text-anchor',
    xmlnsXlink: 'xmlns:xlink',
    xlinkHref: 'xlink:href',
  };

  Object.entries(attributeMap).forEach(([jsxAttr, htmlAttr]) => {
    const regex = new RegExp(`\\s${jsxAttr}=`, 'g');
    svgCode = svgCode.replace(regex, ` ${htmlAttr}=`);
  });

  return svgCode;
}

export function getOutputByMode(
  svgCode: string,
  mode: 'preview' | 'jsx' | 'html' | 'bulk-download'
): string {
  switch (mode) {
    case 'preview':
      return svgCode;
    case 'jsx':
      return svgToJsx(svgCode);
    case 'html':
      return svgCode; // HTML is same as original SVG
    case 'bulk-download':
      return ''; // Empty for now as requested
    default:
      return svgCode;
  }
}
