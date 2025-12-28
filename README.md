# SVGX

> A developer-focused web application for optimizing SVG files, converting SVG ↔ JSX, and exporting framework-ready components with real-time visual preview.

[![Built with React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff?logo=vite)](https://vitejs.dev/)

---

## Overview

SVGX helps frontend engineers, React developers, and UI engineers quickly optimize and convert SVG files into production-ready code. Never lose visual context while working with SVGs — preview changes in real time and export to multiple frameworks with a single click.

### Key Features

- **Live SVG Preview** — Real-time before/after visualization
- **SVG Optimization** — Reduce file size with safe defaults
- **SVG ↔ JSX Conversion** — Instant attribute conversion
- **Framework Export Presets** — React, Next.js, and HTML ready components
- **Copy & Download** — Export optimized SVGs with one click
- **Developer-First UI** — Clean, minimal interface with monospace code display

---

## Problem Statement

Developers frequently:

- Receive **large batches of poorly named SVGs** from designers (Figma, Illustrator)
- Lose visual context while optimizing, converting, or exporting SVGs
- Manually clean SVGs to make them React- and framework-ready
- Spend time renaming SVG files and components to match codebase conventions
- Worry about ID collisions, file size, and runtime performance
- Need to ship the **same SVGs across web and native platforms** (React, mobile, etc.)
- Work with **large icon sets** that require repetitive renaming and exporting

Existing tools (e.g., SVGOMG, svgviewer.dev):

- Focus primarily on **single-file optimization**
- Are not React- or framework-aware by default
- Do not support **bulk workflows**
- Do not generate **semantic, code-ready component names**
- Do not provide **cross-platform framework outputs**

As a result, developers rely on multiple tools and manual steps, increasing the risk of visual bugs and inconsistencies.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/svgx.git
cd svgx

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## Usage

1. **Upload or Paste SVG**
   - Click "Upload SVG File" or paste SVG code directly into the editor
   - The original SVG preview renders instantly

2. **View Live Preview**
   - See your SVG rendered in real-time on the right panel
   - Switch between different output modes using tabs

3. **Select Output Format**
   - **Preview** — Visual rendering of your SVG
   - **JSX** — JSX-ready SVG code
   - **HTML** — Plain HTML with SVG
   - **React (JS)** — React component (JavaScript)
   - **React (TS)** — React component (TypeScript)
   - **Next.js** — Next.js Client Component

4. **Copy or Download**
   - Click the copy button in the code display
   - Or use the download button to save as `.svg` file

---

## Features

### SVG Input
- Paste SVG code into the editor
- Upload `.svg` files
- Auto-detect valid SVG
- Error handling for invalid SVG

### Live SVG Visualization
- Real-time SVG preview
- Side-by-side before/after views
- Instant updates on changes

### SVG ↔ JSX Conversion
- **SVG → JSX:**
  - Convert `class` → `className`
  - CamelCase all attributes
  - JSX-safe formatting
- **JSX → SVG:**
  - Convert JSX back to valid SVG markup

### Framework Export Presets

#### React (JavaScript)
```jsx
export const Icon = ({ className, width = 24, height = 24 }) => (
  <svg className={className} width={width} height={height} ...>
    {/* SVG content */}
  </svg>
);
```

#### React (TypeScript)
```tsx
interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Icon = ({ className, width = 24, height = 24 }: IconProps) => (
  <svg className={className} width={width} height={height} ...>
    {/* SVG content */}
  </svg>
);
```

#### Next.js
```tsx
'use client';

interface IconProps {
  className?: string;
  size?: number;
}

export function Icon({ className, size = 24 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} ...>
      {/* SVG content */}
    </svg>
  );
}
```

---

## Tech Stack

- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.x
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4
- **Syntax Highlighting:** Prism.js
- **Code Formatting:** Prettier
- **Icons:** Lucide React

---

## Project Structure

```
svgx/
├── src/
│   ├── components/
│   │   ├── atoms/          # Basic UI components (Button, Panel, Tabs, etc.)
│   │   ├── molecules/      # Composite components (FileUpload, CodeDisplay, etc.)
│   │   ├── organisms/      # Complex components (EditorPanel, PreviewPanel)
│   │   └── templates/      # Page layouts (MainLayout)
│   ├── lib/
│   │   ├── converters.ts   # SVG ↔ JSX conversion logic
│   │   ├── formatters.ts   # Code formatting utilities
│   │   ├── presets.ts      # Framework preset generators
│   │   └── utils.ts        # Helper functions
│   ├── styles/
│   │   └── prism-theme.css # Syntax highlighting theme
│   └── main.tsx            # App entry point
├── public/                  # Static assets
└── package.json
```

### Architecture: Atomic Design Pattern

SVGX follows the Atomic Design methodology:

- **Atoms:** Basic building blocks (Button, Panel, CodeEditor)
- **Molecules:** Simple component groups (FileUpload, ActionBar, CodeDisplay)
- **Organisms:** Complex UI sections (EditorPanel, PreviewPanel)
- **Templates:** Page-level layouts (MainLayout)

---

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint
```

### Code Style

This project uses:
- **Prettier** for code formatting
- **ESLint** for linting
- **TypeScript** for type safety

All code is automatically formatted on save if you have Prettier configured in your editor.

---

## Roadmap

### MVP v1 (Current)
- ✅ SVG input (paste/upload)
- ✅ Live SVG preview
- ✅ SVG ↔ JSX conversion
- ✅ Framework export presets (React, Next.js, HTML)
- ✅ Copy & download functionality
- ⏳ AI-assisted component naming (In Progress)

### Future Features
- SVG optimization with SVGO
- Bulk upload and export
- Additional framework support (Flutter, SwiftUI, Jetpack Compose)
- File size metrics and analytics
- Advanced SVG editing capabilities

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Syntax highlighting by [Prism.js](https://prismjs.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ for developers who work with SVGs**
# svgx
