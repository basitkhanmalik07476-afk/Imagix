# Imagix — All-in-One Image Optimization Platform

A client-side, privacy-first image optimization suite that compresses, converts, resizes, crops, inspects, and batch-processes images directly in the browser using Web Workers, Canvas/Pica, Cropper.js, and real binary codecs—without uploading user files to external servers or fabricating compression metrics.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The confirmed architectural choices below align the requested capabilities with the existing Vite + React 19 runtime and ensure zero simulated functionality.

- **Confirmed Decision 1 (Runtime & SEO Architecture)**: Keep the existing **Vite + React 19 + TypeScript + Tailwind CSS v4** workspace with client-side SEO routing (`react-router-dom`), dynamic per-route `<title>`, meta descriptions, canonical tags, Open Graph/Twitter tags, JSON-LD structured data, and static `sitemap.xml` / `robots.txt` assets.
- **Confirmed Decision 2 (Format Codec Strategy)**: Implement **full client-side codecs with capability fallback**—combining native Canvas encoding (`JPG`, `PNG`, `WebP`, and browser-checked `AVIF`), pure-TypeScript binary encoders/decoders (`BMP`, `ICO`), `utif` (`TIFF`), `gifenc`/`omggif` (`GIF`), and `browser-image-compression` + `Pica` inside Web Workers, surfacing explicit capability errors whenever a browser/codec combination is unsupported.
- **Confirmed Decision 3 (Hero Upload Flow)**: Dropping, browsing, or pasting (`Ctrl+V` / `Cmd+V`) images on the Homepage hero immediately seeds a shared workspace queue and routes directly into the **Image Compressor**, with a one-click tool switcher to carry those same images into Converter, Resizer, Cropper, or Metadata tools without re-uploading.

---

## 1. Overview & Core Concept

- **What It Does**: Imagix provides a unified, zero-upload image engineering studio featuring real-time compression with before/after visual diffing, multi-format conversion (with transparency background controls), high-quality Lanczos resizing with social/web presets, interactive cropping/rotation/flipping, binary format & EXIF metadata inspection, Base64 encoding/decoding, and ZIP-bundled batch workflows.
- **Target Audience**: Web developers, UI/UX designers, content creators, and e-commerce teams who need fast, repeatable asset optimization without server-side privacy risks, file-count paywalls, or bloated ad-heavy converters.
- **Key Value**: Every byte metric, compression percentage, pixel dimension, and EXIF/magic-byte reading is computed from actual binary outputs in browser memory, backed by automated `URL.revokeObjectURL` cleanup and Web Worker offloading so the UI remains responsive under large batches.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Instant Hero-to-Workspace Flow**:
   - User lands on `/` and either drags files, clicks **Browse Files**, or presses `Ctrl+V` / `Cmd+V` anywhere on the page.
   - Files are validated by binary magic-byte signatures (rejecting non-images or oversized files >50 MB per file with clear inline error feedback) and added to the shared Workspace Queue.
   - The app navigates immediately to `/tools/image-compressor`, begins compressing with the default balanced preset (`75%`), and displays live byte deltas alongside a tool switcher strip (`Compressor`, `Converter`, `Resizer`, `Cropper`, `Metadata`) so the active queue stays loaded across tools.
2. **Batch Compression & Visual Inspection**:
   - Users adjust a global quality slider (`1–100%`) or presets (`High Quality`, `Balanced`, `Compact`, `Web Optimal`), or tune individual files in the queue.
   - Clicking any processed item opens an interactive **Before / After Split Comparison** canvas showing original vs. compressed pixels, exact byte savings, and compression percentage.
   - Users download individual files or trigger a single **Download All (ZIP)** bundle via JSZip.
3. **Format Conversion & Transparency Handling**:
   - Users visit `/tools/image-converter` or dedicated SEO landing routes (`/tools/jpg-to-webp`, `/tools/png-to-jpg`, `/tools/webp-to-png`, `/tools/png-to-avif`, etc.) where source/target presets are pre-configured.
   - When converting transparent formats (`PNG`, `WebP`, `GIF`, `ICO`) into non-alpha formats (`JPG`, `BMP`), a matte background color picker (White, Black, Transparent-to-White default, or custom hex) renders cleanly before encoding.
4. **Precision Resizing, Cropping & Utility Suite**:
   - **Resizer**: Toggle aspect-ratio lock, enter exact `W × H` or percentage scale (`25%`, `50%`, `75%`, `150%`), or pick curated Social Media / Web Thumbnail presets processed via Pica's Lanczos3 filter.
   - **Cropper**: Interactive Cropper.js viewport with Free, `1:1`, `16:9`, `4:3`, `3:2`, `4:5`, `9:16`, and custom aspect ratios, plus `90°` rotate, fine straighten angle, and horizontal/vertical flip.
   - **Specialized Utilities**: Dedicated functional pages for Image Rotator, Image Flipper, Metadata Viewer (EXIF/dimensions/strip-metadata export), Image ↔ Base64, Format-specific Compressors (JPG/PNG/WebP/GIF), and Binary Format Detector.

### Visual Identity & Theme

- **Aesthetic Direction**: Utilitarian commercial SaaS studio—crisp technical clarity with editorial restraint. Clean white and cool soft-gray surfaces paired with precision blue/indigo action accents, zero decorative clutter, no fake statistics or fabricated testimonials, and zero AI-slop badges.
- **Color Palette & Dual-Theme Architecture**:
  - *60% Neutral Canvas*: Pure white (`#FFFFFF`) and cool off-white (`#F8FAFC`) in Light mode (default); deep slate (`#090D16`) and elevated slate (`#0F172A`) in Dark mode.
  - *30% Structural Surfaces*: Hairline borders (`#E2E8F0` light / `#1E293B` dark), subdued control surfaces (`#F1F5F9` / `#1E293B`), and slate typography (`#0F172A` / `#F8FAFC`, muted `#475569` / `#94A3B8`).
  - *10% Accent Budget*: Precision Cobalt Blue (`#2563EB`) and Indigo (`#4F46E5`) reserved strictly for primary CTAs, active tool indicators, slider thumbs, and focus rings.
  - *Tailwind v4 Wiring*: Global stylesheet declares `@custom-variant dark (&:where(.dark, .dark *));` directly beneath `@import "tailwindcss";` with semantic CSS variables so Light and Dark modes maintain strict WCAG AA contrast without brittle `!important` overrides.
- **Typography & Tabular Discipline**:
  - *Display & Headings*: `Plus Jakarta Sans` (`600` / `700`, `tracking-tight`, `text-wrap: balance`).
  - *Body & Controls*: `DM Sans` (`400` / `500`, 15px–16px prose, `whitespace-nowrap shrink-0` on buttons and links).
  - *Metrics, Dimensions & Byte Deltas*: `JetBrains Mono` with `font-variant-numeric: tabular-nums` so file sizes, percentages, and pixel dimensions align cleanly without layout jitter.
- **Component Styling & Top Bar Contract**:
  - Single-row, three-zone header (`Brand Wordmark` — `Single-line Navigation Links` — `Theme Toggle & Primary Workspace Action`), keeping mobile sticky height compact (`<= 15%` viewport).
  - Single-elevation surfaces (`1px` hairline borders, no nested card-within-card boxes, no thick `border-l-4` accent stripes, no static pill tags on metadata—using clean `·` typographic separators instead).
  - Reusable shadcn/ui-patterned primitives (Button, Slider, Select, Tabs, Switch, Tooltip, Toast feedback) with visible `focus-visible` rings and `>= 40px` touch targets.

### Interactive Feedback & Motion

- Routine state transitions (tab switching, hover states, drag-over highlights) settle within `150–200ms` via GPU-composited `transform` and `opacity` transitions, respecting `prefers-reduced-motion`.
- Real progress bars per queued image and overall batch status with explicit icon + text indicators (`Pending`, `Processing`, `Ready`, `Error`—never color-only signaling).
- Graceful empty, loading, and corrupted-file error states with actionable recovery buttons (`Replace File`, `Clear Error`, `Download ZIP`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Pure Client-Side Processing vs. Server Uploads**:
  - *Chosen Approach*: Run all compression, conversion, resizing, cropping, EXIF parsing, and Base64/ZIP operations locally in browser memory via Web Workers and HTML5 Canvas/WASM codecs.
  - *Why*: Guarantees instant zero-latency throughput, protects user image privacy, avoids server bandwidth bottlenecks, and requires zero temporary file storage.
  - *Alternatives Considered*: Express/Sharp server endpoints were passed over because uploading user images violates the privacy-first architecture unless an explicit cloud dependency is needed.
- **Decision 2 — Magic-Byte Validation & Explicit Capability Probing**:
  - *Chosen Approach*: Inspect file header bytes (`FF D8 FF` JPEG, `89 50 4E 47` PNG, `52 49 46 46 ... 57 45 42 50` WebP, `47 49 46 38` GIF, `42 4D` BMP, `49 49 2A 00` / `4D 4D 00 2A` TIFF, `00 00 01 00` ICO, `ftypavif`/`ftypavis` AVIF) and probe browser `canvas.toBlob` support for AVIF/WebP at startup, falling back to bundled WASM/JS encoders when native encoding is missing.
  - *Why*: Catches renamed/corrupted files before decoding crashes and ensures honest, accurate error messaging if a specific format conversion is unavailable in the user's browser.
  - *Alternatives Considered*: Relying solely on `file.type` MIME strings or silently falling back to PNG when AVIF fails—rejected because `file.type` is easily spoofed and silent fallbacks produce misleading results.
- **Decision 3 — Shared In-Memory Workspace Queue Across Tools**:
  - *Chosen Approach*: Maintain a React context holding the active image queue (`ImageAsset[]`), lifecycle-managed object URLs, and a global paste listener so users can transition seamlessly from Homepage → Compressor → Converter → Resizer → Cropper without re-selecting files.
  - *Why*: Eliminates repetitive upload friction when chaining optimization steps (e.g., crop first, then resize, then convert to WebP).
  - *Alternatives Considered*: Isolated per-page file state—rejected because multi-step workflows feel fragmented.

---

## 4. Technical Architecture & Data Strategy

### System & Component Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  App Shell (Router + ThemeProvider + WorkspaceQueueContext + SEO Head Mgr)  │
│  ┌───────────────────────┐   ┌───────────────────────────────────────────┐  │
│  │ Top Navigation Header │   │ Global Clipboard Paste & Drag-Drop Guard  │  │
│  └───────────────────────┘   └───────────────────────────────────────────┘  │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌───────────────┐             ┌───────────────────┐           ┌───────────────┐
│ Homepage View │             │ Tool Workspace    │           │ Utility Pages │
│ • Hero Drop   │────────────▶│ • Tool Switcher   │           │ • Metadata    │
│ • 8 Pop Tools │  (Auto-nav  │ • Batch Queue Bar │           │ • Base64 I/O  │
│ • How It Works│  on drop)   │ • Settings Panel  │           │ • Format Det. │
│ • Formats/FAQ │             │ • Diff Preview    │           │ • All Tools   │
└───────────────┘             └─────────┬─────────┘           └───────┬───────┘
                                        │                             │
                                        ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Client Processing & Codec Engine                         │
│  ┌────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐  │
│  │ Magic-Byte Sniffer │  │ Web Worker Pool     │  │ Specialized Codecs   │  │
│  │ & Capability Probe │  │ • browser-img-comp  │  │ • AVIF / WebP / JPG  │  │
│  │ & Memory Cleanup   │  │ • Pica Lanczos3     │  │ • UTIF (TIFF)        │  │
│  └────────────────────┘  │ • JSZip Packager    │  │ • GIF / BMP / ICO    │  │
│                          └─────────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **Workspace Asset (`WorkspaceImage`)**:
  - `id`: Unique identifier.
  - `file`: Original `File` reference.
  - `name`, `detectedFormat` (from binary signature), `declaredMime`, `originalSize`, `width`, `height`, `hasAlpha`.
  - `previewUrl`: Lifecycle-managed `blob:` URL (revoked automatically on item removal or workspace clear).
  - `status`: `'idle' | 'processing' | 'done' | 'error'`, `progress` (`0–100`), `errorMessage?`.
  - `result`: `{ blob, url, size, width, height, format, durationMs }` computed strictly from the real output `Blob`.
- **Tool Presets & SEO Route Registry (`ToolDefinition[]`)**:
  - Declarative registry mapping all 20+ routes (`/tools/image-compressor`, `/tools/jpg-to-webp`, `/tools/png-to-jpg`, `/tools/webp-to-png`, `/tools/png-to-avif`, `/tools/image-resizer`, `/tools/image-cropper`, `/tools/image-metadata-viewer`, `/tools/image-to-base64`, `/tools/base64-to-image`, `/tools/image-format-detector`, etc.) to their unique SEO metadata, JSON-LD schema, default parameters, and active workspace component.

### Interactive Component & State Mapping

- **Dropzone & Global Paste Handler**: Validates magic bytes and 50 MB size ceiling, reads natural image dimensions (including TIFF/ICO decoding before preview generation), appends to `WorkspaceQueueContext`, and triggers navigation when invoked from the Homepage hero.
- **Compressor & Bulk Processor**: Dispatches compression jobs per item using `browser-image-compression` (in Web Worker mode) or format-targeted encoders (PNG quantization / WebP / GIF), computes true savings (`originalSize - result.size`), renders an interactive draggable Before/After split viewer, and enables single-file or JSZip multi-file download.
- **Converter**: Pre-populates target format from route context (e.g., `/tools/jpg-to-webp` locks/defaults target to `WebP`), exposes quality slider and alpha-matte fill selector when target lacks transparency, and reports explicit capability status for AVIF/TIFF/GIF/BMP/ICO.
- **Resizer & Cropper**: Resizer synchronizes aspect-ratio math between width, height, percentage scale, and social/web preset pills, executing high-accuracy downscaling via Pica; Cropper mounts `Cropper.js` over a clean canvas with live aspect ratio presets, rotation, flip toggles, and cropped blob export.
- **SEO & Metadata Manager**: Updates `document.title`, `<meta name="description">`, `<link rel="canonical">`, Open Graph / Twitter tags, and route-specific `<script type="application/ld+json">` (`WebApplication` + `FAQPage`) synchronously on every route transition, complemented by static `sitemap.xml` and `robots.txt` files.
