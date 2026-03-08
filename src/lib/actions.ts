'use server';

export async function suggestSVGName(svgContent: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in environment');

  const truncated = svgContent.slice(0, 4000);
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Analyze this SVG and suggest a single descriptive PascalCase component name (e.g. ArrowRight, ShoppingCart, UserProfile). Reply with ONLY the name, nothing else.\n\n${truncated}`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const name =
    (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
  const sanitized = name.replace(/[^a-zA-Z0-9]/g, '');
  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1) || 'Icon';
}
