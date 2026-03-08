import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'SVGX | SVG Optimization & Conversion Tool for Developers',
  description:
    'The ultimate developer tool for optimizing SVGs, converting SVG to JSX/React, and managing bulk SVG exports. Fast, free, and developer-focused.',
  keywords:
    'svg, jsx, react, nextjs, svg optimizer, svg converter, svg to jsx, bulk svg export, developer tools, ui engineering',
  authors: [{ name: 'SVGX' }],
  themeColor: '#000000',
  openGraph: {
    type: 'website',
    url: 'https://svg-x.vercel.app/',
    title: 'SVGX | SVG Optimization & Conversion Tool',
    description:
      'Optimize SVGs and convert them to production-ready React/Next.js components in seconds.',
    images: [{ url: '/thumbnail.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: 'https://svg-x.vercel.app/',
    title: 'SVGX | SVG Optimization & Conversion Tool',
    description:
      'Optimize SVGs and convert them to production-ready React/Next.js components in seconds.',
    images: ['/thumbnail.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        {/* Satoshi font */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
          rel="stylesheet"
        />
        {/* Oxanium font (used by h1/logo) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oxanium:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
