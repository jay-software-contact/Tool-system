# the-System

> **Tool management platform with aesthetic taxonomy, proximity clustering, and adaptation pathways.**

The-System is a Next.js 15 + Appwrite 14 platform that extracts, classifies, and adapts UI components and tools across domains. Its core purpose is to make tool information **usable and adaptable for other projects**.

## Core Philosophy

The project operates as a **tool engine**: it takes raw tools/platforms as input, extracts their aesthetic and structural properties, classifies them into clusters, and produces structured output that can be consumed by any downstream system.

**The theme system categorizes components as the highest level of hierarchy.** Components are organized by their visual/aesthetic domain first, then by function. This makes it easy to swap entire visual systems without touching component logic.

## Architecture

```
the-System/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (ThemeProvider + ViewShell)
│   ├── page.tsx            # Dashboard / home
│   ├── globals.css         # Global styles
│   ├── tools/              # Tool browsing & management
│   ├── pipelines/          # Multi-step pipeline chains
│   └── api/
│       └── submit-tool/    # Tool submission endpoint
├── components/
│   ├── ui/                 # Atomic visual elements (ThemeContext, Input, etc.)
│   ├── layout/             # Structural wrappers (ViewShell)
│   └── views/              # Domain-aware composite views (PipelineListView, ExtractionView)
├── themes/
│   └── tokens.ts           # Central design tokens (pure data, no React dependency)
├── lib/
│   ├── appwrite.ts         # Appwrite client, types, query helpers
│   └── engine.ts           # ToolEngine — the core extraction & classification system
├── setup_appwrite.py       # Backend setup script (creates tables, indexes, seeds)
└── package.json
```

## Theme System

The theme system is the organizational backbone. Key design decisions:

1. **Tokens are pure data** (`themes/tokens.ts`) — importable from any JS runtime
2. **ThemeContext maps semantics to values** — 4 presets: metal-heart, genx-soft-club, grunge, corporate
3. **Components consume tokens only** — zero hardcoded colors, zero domain logic

To add a new theme, add a preset to `themePresets` in `ThemeContext.tsx`.

## Tool Engine

The `ToolEngine` class (`lib/engine.ts`) is the project's reason for existing:

1. **Register** — accept raw tool data and classify it
2. **Compute clusters** — group tools by domain + type + aesthetic similarity
3. **Generate adaptation pathways** — show how to transform a tool from one context to another
4. **Export** — produce structured output for downstream projects

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend
Ensure `.env.local` has your Appwrite credentials:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

### 3. Run Setup Script
```bash
python setup_appwrite.py
```
This creates the `core_db` database with all 9 tables, indexes, seed rating schemas, and aesthetic taxonomy.

### 4. Develop
```bash
npm run dev
```

## Project Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0: Foundation | ✅ In Progress | Theme system, tokens, Appwrite setup |
| Phase 1: Tool Engine | ✅ Complete | Extraction, classification, adaptation |
| Phase 2: UI Components | ✅ Complete | Input, ExtractionView, PipelineListView |
| Phase 3: Pages | ✅ Complete | Home, Tools, Pipelines pages |
| Phase 4: Backend Wire-up | ⏳ Pending | Real Appwrite data, seed scripts |
| Phase 5: Pipeline Editor | ⏳ Pending | Visual node-based pipeline builder |
| Phase 6: Rating System | ⏳ Pending | Multi-dimensional rating UI |

## Design Principles

1. **Theme-first organization** — Components are categorized by aesthetic domain
2. **Sound but adjustable** — Core architecture is solid; implementations can be replaced
3. **Extractable output** — Everything produces structured data for other projects
4. **Zero hardcoded values** — All visuals come from tokens

## License

MIT
