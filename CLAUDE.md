# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SVGX is a React + TypeScript web application for optimizing SVG files, converting SVG ↔ JSX, and exporting framework-ready components. Built with Vite, it features both single-file and bulk-upload modes with real-time visual preview.

## Development Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:5173
npm run build           # TypeScript compile + Vite production build
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without modifying
```

## Architecture

### Component Structure (Atomic Design)

The codebase follows Atomic Design methodology:

- **atoms/** - Basic UI building blocks (Button, Panel, Tabs, CodeEditor)
- **molecules/** - Composite components (FileUpload, CodeDisplay, ActionBar, BulkFileUpload, BulkPreviewGrid)
- **organisms/** - Complex UI sections (EditorPanel, PreviewPanel, BulkDownloadPanel)
- **templates/** - Page layouts (MainLayout)

Components are organized by responsibility, not feature. Each level composes from lower levels.

### Core Library Functions

**src/lib/converters.ts**
- `svgToJsx(svgCode)` - Converts SVG attributes to JSX (class → className, stroke-width → strokeWidth, etc.)
- `jsxToSvg(jsxCode)` - Reverse conversion from JSX to SVG
- `getOutputByMode()` - Returns appropriate output based on selected mode

**src/lib/presets.ts**
- `generateReactJS(svgCode, componentName)` - Generates React functional component (JS)
- `generateReactTS(svgCode, componentName)` - Generates React functional component with TypeScript interfaces
- `generateNextJS(svgCode, componentName)` - Generates Next.js client component with 'use client' directive
- `generateHTML(svgCode)` - Wraps SVG in basic HTML document
- `getPresetOutput()` - Main entry point for framework preset generation

All preset generators:
1. Convert SVG to JSX format first
2. Parse and extract SVG attributes and content
3. Strip out width/height/className to make them component props
4. Generate framework-specific wrapper code
5. Re-indent SVG content appropriately

**src/lib/utils.ts**
- `cn()` - Tailwind class name merger using clsx and tailwind-merge
- `detectAndSplitSVGs(text)` - Detects and splits multiple SVG elements from text string; returns array of individual SVG strings
- `isValidSVG(content)` - Checks if a string contains valid SVG content (has both opening and closing svg tags)

### Application Modes

The app operates in two modes controlled by `MainLayout`:

**Single Mode (Default)**
- Editor on left, preview on right
- Direct SVG input via paste or file upload
- Real-time conversion to JSX, React, Next.js, HTML
- Component naming customization (in PreviewPanel header)
- Individual copy/download actions

**Bulk Mode**
- BulkFileUpload component on left (drag-drop or paste from clipboard)
- BulkPreviewGrid on right showing all files
- Can paste multiple SVGs - they're auto-detected and split
- Grid view with per-file copy/download in any format
- Special "Bulk Download" tab for ZIP export with multiple formats
- Supports up to 50 files, max 5MB each

**Auto-Switch to Bulk Mode**
- When in Single Mode, if user pastes/uploads content with multiple SVGs detected, app automatically:
  1. Detects and splits the SVGs using `detectAndSplitSVGs()` utility
  2. Converts them to UploadedFile format
  3. Switches to Bulk Mode
  4. Shows a notification "X SVGs detected - Switched to Bulk Mode"
  5. Adds all files to the bulk files list
- If already in Bulk Mode, multiple SVGs are just added to existing files without notification
- Detection works for both paste and file upload operations

The mode toggle clears bulk files when switching from bulk → single.

### State Management

State lives in `MainLayout` and flows down:
- `svgContent` - Current SVG code (single mode)
- `componentName` - Name for generated components (defaults to 'Icon')
- `bulkFiles` - Array of `UploadedFile` objects (bulk mode)
- `showBulkUpload` - Boolean controlling mode
- `showAutoSwitchNotification` - Boolean for showing bulk mode auto-switch notification

No external state management library. Props drilling is intentional and manageable.

**Component Name Input Location**: The component name input is in PreviewPanel header (right side), only visible in single mode when SVG content exists. This UX decision places the control near where it's used (the generated component outputs).

### Type System

Uses TypeScript with path aliases configured:
- `@/*` maps to `src/*` (configured in tsconfig.json)
- Import format: `import { Component } from '@/components/atoms'`

Important types:
- `UploadedFile` - Defined in BulkFileUpload.tsx, includes filename, content, status, error
- Component props are defined inline with TypeScript interfaces

## Key Technical Details

### SVG Attribute Conversion

The attribute mapping in `converters.ts` is comprehensive but not exhaustive. It covers:
- Common React/JSX conventions (class → className)
- SVG presentation attributes (stroke-width, fill-rule, etc.)
- Namespaced attributes (xmlns:xlink, xlink:href)

When adding new conversions, update both `svgToJsx` and `jsxToSvg` attribute maps symmetrically.

### Framework Preset Patterns

All generated components follow these conventions:
- React JS: Named exports with destructured props, default values inline
- React TS: Separate interface definition, typed props
- Next.js: 'use client' directive, `function` keyword (not arrow), unified `size` prop instead of width/height
- All strip original width/height/className to make them configurable

Component names default to 'Icon' if not specified. In bulk mode, component names are derived from filenames using selected naming convention.

### Bulk Operations

**File Validation** (BulkFileUpload.tsx):
- Checks file type is SVG
- Enforces 5MB size limit
- Prevents exceeding 50 file maximum
- Returns structured error messages

**Paste Detection**:
- Reads clipboard via `navigator.clipboard.readText()`
- Splits on `</svg>` tag to detect multiple SVGs
- Creates synthetic filenames: `pasted-icon-1.svg`, `pasted-icon-2.svg`, etc.
- Each detected SVG becomes an `UploadedFile` with 'success' status

**ZIP Generation** (BulkDownloadPanel.tsx):
- Uses JSZip library to create organized folder structure
- Converts filenames using selected convention (kebab-case, PascalCase, camelCase, original)
- Component names in generated code match filename convention
- Includes auto-generated README.md with export metadata
- Shows progress bar during generation
- Auto-revokes blob URLs after download

### Styling

- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Dark theme with black background (`bg-black`)
- White text with opacity variants (`text-white/60`, `text-white/10`)
- Border-based visual separators (`border-white/10`)
- Uses `class-variance-authority` for component variants (see `button.variants.ts`)
- Custom Prism.js theme in `styles/prism-theme.css` for syntax highlighting

### Icons

Uses `lucide-react` for all icons. Common ones:
- `Package` - Bulk mode toggle
- `Upload`, `Download`, `Copy` - Action buttons
- `Check`, `X`, `Loader2` - Status indicators

## Development Patterns

### Adding New Export Formats

1. Add format type to preset unions in `presets.ts`
2. Create generator function following pattern:
   - Accept `svgCode` and optional `componentName`
   - Convert to JSX first using `svgToJsx()`
   - Parse with regex: `/<svg([^>]*)>([\s\S]*)<\/svg>/`
   - Strip width/height/className from attributes
   - Build template string with proper indentation
   - Return complete code string
3. Add case to `getPresetOutput()` switch statement
4. Add tab to PreviewPanel for the new format
5. Add checkbox to BulkDownloadPanel format selection
6. Add folder name to ZIP structure in `handleDownloadAll()`

### Adding New Naming Conventions

1. Add type to `NamingConvention` union in BulkDownloadPanel
2. Add conversion logic to `convertFileName()` function
3. Add radio button option in BulkDownloadPanel UI
4. Convention applies to both filenames AND component names in generated code

### Component Creation Guidelines

- Use functional components with TypeScript
- Props interfaces should be inline, not separate files
- Follow atomic design level assignments strictly
- Export from index.ts barrel files in each directory
- Use Tailwind classes directly, no CSS modules
- Prefer explicit prop drilling over context for simple cases

## Important Caveats

### File Size Limits

Bulk operations have hardcoded limits:
- Max 50 files per batch
- Max 5MB per file

These are defined as constants in BulkFileUpload component. Adjust if needed but consider browser memory constraints.

### Browser APIs

The app depends on modern browser APIs:
- FileReader API (for file uploads)
- Clipboard API (for paste functionality)
- Blob/URL APIs (for downloads)
- No polyfills included - assumes evergreen browsers

### Regex-Based Parsing

SVG parsing uses regex, not a proper XML parser:
- Works for well-formed SVG but fragile with malformed input
- Regex: `/<svg([^>]*)>([\s\S]*)<\/svg>/`
- Could fail with nested SVG tags or CDATA sections
- Consider using DOMParser for more robust parsing if issues arise

### No SVG Optimization

Despite the name "optimization" in the UI, SVGO is not yet integrated. The "optimization" currently refers only to framework conversion and export. This is a planned feature per README roadmap.

## Testing Notes

No test suite currently exists. When adding tests:
- Focus on converter functions first (pure, easy to test)
- Test preset generators with various SVG inputs
- Mock FileReader for upload component tests
- Mock clipboard API for paste functionality tests
