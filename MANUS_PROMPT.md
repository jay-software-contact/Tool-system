# the-System — Complete Technical Specification (v2)

## A platform for capturing, extracting, classifying, and organizing UI components from live websites, organized with visual aesthetics as the highest level of hierarchy.

---

## 1. CORE CONCEPTS

### 1.1 What the System Does

1. **Captures** — Takes any live webpage and identifies every visible UI component with a visual boundary
2. **Extracts** — For each component, extracts computed design tokens (colors, spacing, typography, shadows, etc.)
3. **Classifies** — Assigns each component to an aesthetic category, functional purpose, and structural type
4. **Organizes** — Stores everything in Appwrite with full relational metadata
5. **Browses** — Provides multiple views: by aesthetic (primary), by function, by type, by proximity
6. **Batches** — Processes hundreds of URLs with progress tracking, failure diagnosis, and retry
7. **Exports** — Generates reusable code from extracted components

### 1.2 Key Differences from Existing Tools (like Alloy)

Alloy is a **prototyping** tool — you capture your own product's UI to prototype variations. The-System is an **extraction and classification** tool — you capture *any* website to analyze and catalog its components.

| Dimension | Alloy | the-System |
|-----------|-------|------------|
| Input | Your own product | Any live URL |
| Goal | Prototype variations | Extract + classify + catalog |
| Output | Modified designs | Structured component data |
| Organization | By project | By aesthetic (highest hierarchy) |
| Storage | Proprietary | Appwrite (self-hosted) |
| Code export | React components | Design tokens + classification JSON |

### 1.3 Key Ideas to Borrow from Alloy (Adapted)

These concepts are useful and should be adapted for our extraction-focused system:

#### 1.3.1 Workspace Concept
- A **workspace** is the main container for captures, extractions, and team collaboration
- Admins manage members, permissions, and settings
- Each workspace has its own URL slug, data region, and member list
- **Adaptation**: Workspace = a collection of extraction jobs + captured components + team access

#### 1.3.2 Capture Methods
- **Browser Extension**: Most accurate. Captures authenticated pages, preserves exact rendering
- **Public Link**: Alternative for public pages. Less accurate for interactive content
- **GitHub Codebase Connectivity**: Connect a repo → automatic environment setup → capture from running app
- **Adaptation**: Our capture methods = URL input (public), browser extension (private/authenticated), GitHub repo (full codebase)

#### 1.3.3 Visual Editing for Refinement
- Select individual elements on a captured page → prompt targeted changes
- Editing toolbar: layout, spacing, corners, background, border, shadow, transparency
- **Adaptation**: In our context, visual editing means selecting a captured component → refining its classification, adjusting token extraction boundaries, or correcting misclassified aesthetics

#### 1.3.4 Iteration Pattern
- First prompt establishes foundation
- Subsequent prompts refine: "increase padding from 16px to 24px", "make border-radius 4px"
- Specific values > adjectives ("cleaner" → bad, "reduce padding to 12px" → good)
- **Adaptation**: Our iteration = first extraction → review → re-extract with adjusted parameters → merge results

#### 1.3.5 Prompting Tips (Applied to Extraction)
- Include: task + instruction + context + key elements + expected behaviors + constraints
- Poor: "Extract components from this page"
- Better: "Extract all navigation, form, and card components from this SaaS dashboard. Focus on interactive elements. Expect buttons, inputs, modals, dropdowns. Constrain to elements ≥40px in any dimension. Ignore decorative elements."

#### 1.3.6 Command Palette (Cmd+K / Ctrl+K)
- Fast navigation to any capture, extraction, or setting
- **Adaptation**: Quick search across all captured components by name, aesthetic, type, or source URL

#### 1.3.7 Workspace Administration
- Member roles: Admin (full access) vs Contributor (create/edit, no user management)
- Permissions matrix per resource type
- Plan-based limits on captures, extractions, exports

#### 1.3.8 Folder Organization
- Folders for organizing captures and extractions
- Support for 3-level nesting
- Right-click → Move to folder
- Deleting folder does not delete contents (moves to parent)
- **Adaptation**: Folder hierarchy = Aesthetic Category → Sub-category → Extraction Batch

#### 1.3.9 Import from Other Tools
- Import from Figma, Bolt, Lovable, v0, Onlook via browser extension or public link
- Supports capturing one page at a time
- **Adaptation**: Import component libraries as reference data for classification training

#### 1.3.10 Export
- Export prototypes as React components (JS/TS)
- Downloadable .zip with standard file structure
- Run locally with `bun install && bun run dev`
- **Adaptation**: Export extracted components as JSON, design token CSS files, or React component stubs

---

## 2. THE 7 AESTHETIC CATEGORIES (Detailed)

### 2.1 Metal Heart
** Philosophy**: Industrial honesty. No polish. Materials speak for themselves.
**Evidence Criteria**:
- Background: #1A1A1A–#333333 range
- Border-radius: 0–4px (sharp corners)
- Box-shadow: Heavy, dark (rgba(0,0,0,0.4+))
- Typography: Monospace or slab-serif fonts
- Contrast ratio: ≥7:1 (WCAG AAA)
- Border: 1px solid #333333 or heavier
**Anti-patterns**: Pastels, rounded corners >4px, light shadows, system fonts, gradients
**Token signatures**: `borderRadius: "2px"`, `boxShadow: "0 8px 24px rgba(0,0,0,0.5)"`, `fontFamily: "JetBrains Mono, monospace"`, `border: "2px solid #444"`
**Typical use cases**: Developer tools, terminal UIs, industrial dashboards, brutalist marketing sites

### 2.2 Structured Baseline (GXSC)
**哲学**: Disciplined consistency. Every element has a role. Every role has a rule.
**Evidence Criteria**:
- Background: #FAFAFA–#F5F5F5 (light) or #1E1E1E–#2D2D2D (dark)
- Border-radius: 8–12px (consistent across all elements)
- Border: 1px solid rgba(0,0,0,0.08) or rgba(255,255,255,0.08)
- Shadow: Minimal (0 1px 3px rgba(0,0,0,0.05))
- Typography: Clean sans-serif (Inter, SF Pro, system-ui)
- Spacing: Follows 4px or 8px grid
**Anti-patterns**: Gradients, heavy shadows, inconsistent radii (>2px variance), mixed font families
**Token signatures**: `borderRadius: "10px"`, `border: "1px solid rgba(0,0,0,0.08)"`, `padding: "16px"`, `gap: "8px"`
**Typical use cases**: SaaS apps, admin dashboards, documentation sites, B2B tools

### 2.3 Grunge
**哲学**: Deliberate imperfection. Noise as texture. Chaos as expression.
**Evidence Criteria**:
- Background: Noise patterns, distressed textures, mixed gradients
- Border-radius: Inconsistent (3px 8px 5px 7px)
- Shadow: Multiple heavy, overlapping
- Typography: Mixed families (serif + sans + display)
- Visual: High contrast, visible texture/grain
**Anti-patterns**: Clean whitespace, consistent spacing, uniform radius, system fonts only
**Token signatures**: `background: "url(noise.png), linear-gradient(...)"`, `borderRadius: "3px 8px 5px 7px"`, `boxShadow: "2px 2px 0 #000, 4px 4px 8px rgba(0,0,0,0.3)"`
**Typical use cases**: Music sites, fashion brands, creative portfolios, event pages

### 2.4 Minimalist
**哲学**: Maximum reduction. Every element must justify its existence.
**Evidence Criteria**:
- Background: #FFFFFF–#F5F5F5 (near-white)
- Color palette: Monochrome + ONE accent color
- Border: None or 1px solid #F0F0F0
- Shadow: None
- Padding: Large (24px+)
- Typography: System fonts, single weight
- Spacing: Generous whitespace
**Anti-patterns**: Multiple colors (>2 total), decorations, heavy borders, shadows, <16px padding
**Token signatures**: `background: "#FFFFFF"`, `border: "none"`, `boxShadow: "none"`, `padding: "32px"`, `color: "#111111"`
**Typical use cases**: Portfolio sites, luxury brands, minimalist marketing, art galleries

### 2.5 Corporate
**哲学**: Institutional trust. Professionalism as visual language.
**Evidence Criteria**:
- Primary color: Blue (#0066FF range, #0052CC, #003D99)
- Background: White (#FFFFFF) or light gray (#F8FAFC)
- Border-radius: 6–8px (moderate, professional)
- Typography: Serif headings + sans-serif body
- Shadow: Subtle blue-tinted (rgba(0,102,255,0.1))
- Layout: Grid-based, structured
**Anti-patterns**: Dark backgrounds, saturated non-blue colors, playful fonts, unpredictable layouts
**Token signatures**: `color: "#0066FF"`, `borderRadius: "6px"`, `fontFamilyHeading: "Georgia, serif"`, `fontFamilyBody: "Inter, sans-serif"`, `boxShadow: "0 2px 4px rgba(0,102,255,0.1)"`
**Typical use cases**: Enterprise SaaS, financial services, healthcare, government, insurance

### 2.6 Futuristic
**Philosophy**: Technology as spectacle. Dark-native. Glow.
**Evidence Criteria**:
- Background: Very dark (#0A0A0F–#12121A)
- Accent: Gradients (purple→blue, cyan→green, pink→orange)
- Border-radius: 12–16px (large)
- Shadow: Glow effects (0 0 20px rgba(124,58,237,0.3))
- Backdrop-filter: blur(8–20px)
- Typography: Geometric sans-serif, variable fonts
**Anti-patterns**: White backgrounds, flat colors, small radius, serif fonts, no glow
**Token signatures**: `background: "linear-gradient(135deg, #0A0A0F, #1a1a2e)"`, `borderRadius: "14px"`, `boxShadow: "0 0 30px rgba(124,58,237,0.3)"`, `backdropFilter: "blur(16px)"`
**Typical use cases**: Crypto/Web3, AI showcases, gaming, cyberpunk marketing, developer tooling

### 2.7 Playful
**Philosophy**: Joy through interaction. Color as communication. Roundness as friendliness.
**Evidence Criteria**:
- Colors: Saturated, bright, high chroma
- Border-radius: 16–24px or 9999px (pill)
- Padding: Generous (16–24px)
- Typography: Rounded sans-serif (DM Sans, Nunito, Poppins)
- Shadow: Soft, colored (rgba(245,158,11,0.15))
- Background: Pastel or light
**Anti-patterns**: Dark backgrounds, sharp corners, monospace, minimal spacing, desaturated colors
**Token signatures**: `borderRadius: "20px"`, `background: "#FFFBEB"`, `padding: "16px 24px"`, `boxShadow: "0 8px 24px rgba(245,158,11,0.15)"`, `fontFamily: "Poppins, sans-serif"`
**Typical use cases**: EdTech, consumer apps, children's products, food/beverage, lifestyle brands

---

## 3. COMPONENT TAXONOMY

### 3.1 Structural Types (21 types)

| Type | Description | Typical Tokens |
|------|-------------|----------------|
| Button | Clickable action trigger | color, backgroundColor, borderRadius, padding, fontSize |
| Card | Contained content group | backgroundColor, borderRadius, padding, boxShadow, border |
| Navbar | Primary navigation | backgroundColor, padding, gap, height, boxShadow |
| Hero | Full-width hero section | background (gradient/image), padding, minHeight, color |
| Input | Text/data entry field | border, borderRadius, padding, fontSize, backgroundColor, focusRing |
| Modal | Overlay dialog | backgroundColor, borderRadius, padding, boxShadow, backdropFilter |
| Dropdown | Selectable list overlay | backgroundColor, borderRadius, maxHeight, boxShadow, border |
| Badge | Status/label indicator | backgroundColor, borderRadius, padding, fontSize, color, fontWeight |
| Tooltip | Hover information popup | backgroundColor, borderRadius, padding, color, boxShadow, fontSize |
| Divider | Visual separator | border, backgroundColor, height/width |
| Footer | Page bottom section | backgroundColor, padding, color, border-top |
| Sidebar | Side navigation panel | backgroundColor, width, padding, border-right |
| Pricing Table | Plan comparison grid | border, borderRadius, padding, backgroundColor, color |
| Testimonial | User quote/card | backgroundColor, borderRadius, padding, boxShadow, fontStyle |
| Feature Grid | Feature highlight grid | gap, padding, gridTemplateColumns, borderRadius |
| Stat Card | Metric display card | fontSize (large), color, backgroundColor, borderRadius, padding |
| Avatar | User image/initials | borderRadius: "9999px", width, height, border |
| Breadcrumb | Path navigation trail | color, gap, fontSize, separator |
| Tabs | Tab bar navigation | backgroundColor, borderRadius, border-bottom, padding, color |
| Accordion | Expandable section group | border, borderRadius, padding, backgroundColor |
| Progress Bar | Completion/status bar | backgroundColor, height, borderRadius, color |

### 3.2 Functional Purposes (7 purposes)

| Purpose | Description | Key Indicators |
|---------|-------------|----------------|
| Conversion | Drives a primary CTA (signup, buy, submit) | Button with prominent color, above-fold position |
| Navigation | Helps user move through the app | Links, tabs, breadcrumbs, navbars, menus |
| Information | Communicates status or data | Stats, badges, tooltips, text blocks |
| Input | Collects data from the user | Form fields, dropdowns, file uploads, toggles |
| Display | Shows content for consumption | Cards, galleries, articles, media players |
| Social Proof | Demonstrates trust/validation | Testimonials, ratings, logos, counts |
| Feedback | Communicates system state | Progress bars, alerts, loading states, errors |

### 3.3 Component JSON Schema

```json
{
  "$id": "string (Appwrite document ID, auto-generated)",
  "name": "PrimaryButton | FeatureCard | DataTableCell",
  "description": "Rounded rectangular CTA button with gradient background and centered white text, 48px height",
  "aestheticCategory": "Futuristic | MetalHeart | Grunge | Minimalist | Corporate | Playful | StructuredBaseline",
  "type": "{\"name\":\"PrimaryButton\",\"role\":\"conversion\",\"variant\":\"gradient\",\"interactive\":\"hover,active,focus,disabled\"}",
  "function": "Conversion | Navigation | Information | Input | Display | SocialProof | Feedback",
  "designTokens": "{\"backgroundColor\":\"linear-gradient(135deg,#6366f1,#8b5cf6)\",\"color\":\"#ffffff\",\"borderRadius\":\"12px\",\"padding\":\"12px 32px\",\"fontSize\":\"16px\",\"fontFamily\":\"Inter,sans-serif\",\"fontWeight\":\"600\",\"boxShadow\":\"0 4px 12px rgba(99,102,241,0.4)\",\"hover\":{\"boxShadow\":\"0 8px 24px rgba(99,102,241,0.5)\"},\"focusRing\":\"0 0 0 3px rgba(99,102,241,0.3)\"}",
  "sourceUrl": "https://example.com/dashboard",
  "sourceContext": "Above-fold, below hero section, primary action",
  "viewport": "{\"width\":1440,\"height\":900,\"device\":\"desktop\"}",
  "bounds": "{\"x\":540,\"y\":420,\"width\":180,\"height\":48}",
  "confidence": 0.92,
  "createdAt": 1719200000,
  "status": "active | flagged | deprecated",
  "tags": ["#PrimaryButton", "#Futuristic", "#Conversion", "#GradientCTA"],
  "workspaceId": "ws_abc123",
  "batchId": "batch_xyz789"
}
```

---

## 4. INFORMATION ARCHITECTURE

### 4.1 Primary Hierarchy

```
Workspace
  └── Aesthetic Category (highest browse priority)
       └── Functional Purpose
            └── Structural Type
                 └── Component Instance
```

### 4.2 Browse/Filter Dimensions

| Dimension | Primary? | Filter Type | Example |
|-----------|----------|-------------|---------|
| **Aesthetic Category** | YES (primary) | Multi-select | "Show all Futuristic + Playful" |
| **Functional Purpose** | Secondary | Multi-select | "Show all Conversion components" |
| **Structural Type** | Tertiary | Multi-select | "Show all Buttons" |
| **Source URL** | Quaternary | Text search | "From github.com/*" |
| **Confidence Score** | Advanced | Range slider | "≥0.9 confidence" |
| **Date Captured** | Advanced | Date range | "Last 30 days" |
| **Token Profile** | Proximity | Token similarity | "Similar to this component" |

### 4.3 View Modes

| View | Description | Use Case |
|------|-------------|----------|
| **Grid** | Card grid with mini previews | Browsing, discovery |
| **List** | Compact rows with key metadata | Scanning, bulk operations |
| **Detail** | Full component page with all tokens | Analysis, export |
| **Compare** | Side-by-side of 2–4 components | Evaluating alternatives |
| **Aesthetic Map** | Visual cluster plot | Finding similar styles |
| **Source** | Full-page capture with overlays | Understanding context |

### 4.4 Organization Features

#### Folders (3-level nesting)
- Aesthetic → Sub-category → Batch
- Shared across workspace
- Deleting folder moves contents to parent (not deleted)

#### Collections (saved filters)
- "All Futuristic CTAs" — saved filter set
- "Low-confidence extractions" — needs review
- "Ready for export" — quality-approved components

#### Tags (flat + hierarchical)
- Aesthetic tags: #Futuristic, #Minimalist, etc.
- Type tags: #Button, #Card, #Navbar
- Token tags: #BorderRadius-Large, #Shadow-Heavy, #Gradient-Purple
- Custom tags: user-defined

---

## 5. WORKSPACE & ADMINISTRATION

### 5.1 Workspace Model

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Auto-generated (`ws_` prefix) |
| `name` | string | Unique within organization |
| `slug` | string | URL-safe identifier (alloy.app/{slug}) |
| `dataRegion` | string | Where data is stored (e.g., `iad1`, `fra1`) |
| `createdAt` | integer | Unix timestamp |
| `plan` | string | `free | pro | team | enterprise` |

### 5.2 Member Roles & Permissions

| Permission | Admin | Contributor | Viewer |
|------------|-------|-------------|--------|
| Create capture | ✅ | ✅ | ❌ |
| Delete capture | ✅ | Own only | ❌ |
| Create extraction job | ✅ | ✅ | ❌ |
| Delete extraction job | ✅ | Own only | ❌ |
| Share extractions | ✅ | ✅ | ❌ |
| Access settings | ✅ | ✅ | ❌ |
| Invite member | ✅ | ❌ | ❌ |
| Approve member | ✅ | ❌ | ❌ |
| Remove member | ✅ | ❌ | ❌ |
| Change member role | ✅ | ❌ | ❌ |
| View billing | ✅ (creator) | ❌ | ❌ |
| Change plan | ✅ (creator) | ❌ | ❌ |
| View all extractions | ✅ | Own + shared | Shared only |
| Export components | ✅ | ✅ | ❌ |
| Manage API keys | ✅ | ❌ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ |

### 5.3 Plan Limits

| Plan | Captures/Day | Extractions/Month | Exports/Month | Team Members | Codebase Connections |
|------|-------------|-------------------|---------------|--------------|---------------------|
| Free | 10 | 100 | 5 | 1 | 0 |
| Pro | 100 | 10,000 | 100 | 5 | 1 |
| Team | Unlimited | Unlimited | Unlimited | 50 | 10 |
| Enterprise | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |

---

## 6. PROMPTING SYSTEM

### 6.1 Extraction Prompts (LLM Instructions)

The system sends a structured prompt to the LLM for each URL:

```
You are a UI component extraction engine. Given a webpage, identify every visible, distinct functional unit with a visual boundary.

For EACH component, provide:
1. Name: PascalCase identifier based on function + type
2. Description: 1-2 sentences describing appearance (not function)
3. Aesthetic Category: Match token evidence against these 7 categories [detailed above]
4. Type: Structural classification from the 21 types
5. Function: Purpose classification from the 7 purposes
6. Design Tokens: Computed CSS values (omit if undetermined, never fabricate)
7. Confidence: 0.0–1.0 based on classification certainty
8. Source Context: Where on the page, nearby elements
9. Viewport: Device/size conditions

Rules:
- Parse RENDERED DOM (computed styles), not source HTML
- Extract COMPUTED CSS values, not inline styles
- Do NOT fabricate design tokens. If a value cannot be determined, omit the key
- Do NOT include components smaller than 40px in any dimension
- If aesthetic is ambiguous, classify as closest match and note ambiguity in description
- If the page cannot be rendered (auth wall, timeout), return empty with explanation
```

### 6.2 Prompting Best Practices

| Bad Practice | Good Practice |
|-------------|--------------|
| "Extract from this page" | "Extract all navigation, form, and card components from this dashboard. Focus on interactive elements ≥40px." |
| Vague aesthetic guess | Require evidence tokens for classification |
| Include decorative elements | Ignore elements <40px |
| Fabricate tokens | Omit unknown values |
| One massive extraction | Chunk by viewport section |

---

## 7. BATCH PROCESSING SYSTEM

### 7.1 Batch Job Lifecycle

```
CREATED → QUEUED → PROCESSING → [per URL: extracting → classifying → storing] → COMPLETED
                                                            ↓ (if failure)
                                                          FAILED → DIAGNOSED → [retryable → RETRY QUEUE | non-retryable → SKIPPED]
```

### 7.2 Per-URL Tracking

| Field | Description |
|-------|-------------|
| `url` | Target URL |
| `status` | pending/extracting/success/failed/retrying/skipped/diagnosed |
| `httpStatus` | HTTP response code |
| `componentCount` | Number of components extracted |
| `error` | Error message if failed |
| `errorCategory` | auth/timeout/network/js_rendering/empty/unknown |
| `retryable` | Boolean |
| `retryStrategy` | increased_timeout/retry_with_delay/dom_snapshot/relaxed_threshold/full_retry |
| `duration` | Processing time in ms |
| `capturedAt` | Timestamp |

### 7.3 Failure Diagnosis Matrix

| HTTP Code | Error | Category | Retryable | Strategy |
|-----------|-------|----------|-----------|----------|
| 401/403 | Auth required | auth | No | Skip, flag for manual |
| 408/504 | Timeout | timeout | Yes | increased_timeout (180s) |
| ENOTFOUND | DNS fail | network | Yes | retry_with_delay (30s) |
| ECONNREFUSED | Connection refused | network | Yes | retry_with_delay (30s) |
| Empty body | No content | empty | Yes | relaxed_threshold |
| JS-only render | No static content | js_rendering | Yes | dom_snapshot_fallback |
| Unknown error | Parse failure | unknown | Yes | full_retry (max 3) |

### 7.4 Batch Output

| File | Format | Contents |
|------|--------|----------|
| `batch{N}_results.json` | JSON | Full component data for all URLs |
| `batch{N}_progress.json` | JSON | Live progress (updated per-URL) |
| `batch{N}_failed.txt` | Plain text | Failed URLs only |
| `batch{N}_retry_queue.json` | JSON | Failed URLs with diagnosis + strategy |
| `batch{N}_report.md` | Markdown | Summary: stats, failures, timing |

---

## 8. APPWRITE SCHEMA (DETAILED)

### 8.1 Database: `core_db`

### 8.2 Collection: `extractions`
| Field | Type | Size/Options | Required | Indexed |
|-------|------|-------------|----------|---------|
| `name` | string | 256 chars | Yes | Yes |
| `description` | string | 65535 chars | Yes | No |
| `aestheticCategory` | string | Enum (7 values) | Yes | Yes (key) |
| `type` | string | JSON, 65535 chars | Yes | Yes (key) |
| `function` | string | Enum (7 values) | Yes | Yes (key) |
| `designTokens` | string | JSON, 65535 chars | Yes | No |
| `sourceUrl` | string | 512 chars | Yes | Yes (key) |
| `sourceContext` | string | 1024 chars | No | No |
| `viewport` | string | JSON, 4096 chars | No | No |
| `bounds` | string | JSON, 2048 chars | No | No |
| `confidence` | float | 0.0–1.0 | Yes | Yes (key) |
| `tags` | string[] | 512 chars each | No | Yes |
| `status` | string | Enum: active, flagged, deprecated | Yes | No |
| `workspaceId` | string | 64 chars | Yes | Yes (key) |
| `batchId` | string | 64 chars | No | Yes (key) |
| `createdAt` | integer | Unix timestamp | Yes | Yes (key) |

### 8.3 Collection: `workspaces`
| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `slug` | string | Yes |
| `dataRegion` | string | Yes |
| `plan` | string | Yes |
| `memberCount` | integer | No |
| `createdBy` | string | Yes |
| `createdAt` | integer | Yes |

### 8.4 Collection: `batch_jobs`
| Field | Type | Required |
|-------|------|----------|
| `status` | string | Yes |
| `totalUrls` | integer | Yes |
| `processed` | integer | Yes |
| `succeeded` | integer | Yes |
| `failed` | integer | Yes |
| `avgDurationMs` | integer | No |
| `startedAt` | integer | Yes |
| `completedAt` | integer | No |
| `workspaceId` | string | Yes |

### 8.5 Collection: `failed_extractions`
| Field | Type | Required |
|-------|------|----------|
| `url` | string | Yes |
| `error` | string | Yes |
| `errorCategory` | string | Yes |
| `retryable` | boolean | Yes |
| `retryStrategy` | string | No |
| `retryCount` | integer | Yes |
| `batchId` | string | Yes |
| `diagnosedAt` | integer | No |

### 8.6 Collection: `memberships`
| Field | Type | Required |
|-------|------|----------|
| `workspaceId` | string | Yes |
| `userId` | string | Yes |
| `role` | string | Yes |
| `invitedAt` | integer | Yes |
| `joinedAt` | integer | No |

---

## 9. API SPECIFICATION

### 9.1 `POST /api/extract`
**Input:**
```json
{ "url": "https://example.com", "options": { "minSize": 40, "viewport": {"width":1440,"height":900}, "waitUntil": "networkidle" } }
```
**Output (SSE):**
```
data: {"type":"progress","phase":"navigating","message":"Loading https://example.com"}

data: {"type":"progress","phase":"detecting","message":"Found 47 potential components"}

data: {"type":"component","data":{...component object...}}

data: {"type":"progress","phase":"storing","message":"Saving 23 components to Appwrite"}

data: {"type":"complete","total":23,"stored":23,"failed":0,"duration":8432}

data: [DONE]
```

### 9.2 `GET /api/extract`
**Query params:** `id` (get single extraction), `batchId` (get batch results), `sourceUrl` (filter by source)

### 9.3 `POST /api/components`
**Input:** Component object (without $id, auto-generated)
**Output:** Saved component with $id

### 9.4 `GET /api/components`
**Query params:** `aesthetic`, `type`, `function`, `sourceUrl`, `minConfidence`, `limit`, `offset`, `workspaceId`
**Output:** `{ components: [...], total: number }`

### 9.5 `POST /api/batch`
**Input:**
```json
{ "urls": ["https://a.com", "https://b.com"], "batchSize": 100, "options": { "minSize": 40 } }
```
**Output:** `{ jobId: "batch_...", status": "queued" }`

### 9.6 `GET /api/batch/:id`
**Output:**
```json
{ "jobId": "...", "status": "processing", "progress": { "total": 100, "processed": 43, "succeeded": 40, "failed": 3 }, "results": [...], "failed": [...] }
```

### 9.7 `GET /api/aesthetics`
**Output:** Array of aesthetic categories with component counts, evidence criteria, and example component IDs

### 9.8 `POST /api/export`
**Input:**
```json
{ "componentIds": [...], "format": "json|react|css-tokens|tailwind-config" }
```
**Output:** Downloadable file

---

## 10. TECHNICAL STACK

### 10.1 Core
- Next.js 15+ (App Router, React 19)
- TypeScript (strict)
- node-appwrite (CJS SDK)

### 10.2 Storage
- Appwrite Cloud (or self-hosted)
- Database: `core_db`
- 6 collections (extractions, workspaces, batch_jobs, failed_extractions, memberships, aesthetics)

### 10.3 Frontend
- React 19 with hooks
- No CSS framework (inline styles or CSS modules)
- Theme system: custom Context API, 7 presets
- No external dependencies

### 10.4 Environment Variables
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<project-id>
APPWRITE_API_KEY=<api-k...NEXT_PUBLIC_USE_APPWRITE=false
NEXT_PUBLIC_WORKSPACE_ID=ws_default
```

### 10.5 Build
```bash
npm install
npm run dev    # Development
npx next build # Production
```

---

## 11. SUCCESS CRITERIA

1. `npx next build` passes with zero errors
2. All routes render without runtime errors
3. Catalog shows mock components organized by aesthetic category
4. Filtering by aesthetic, type, function works correctly
5. Component detail shows full parsed data + design tokens
6. Theme switching changes active aesthetic across all components
7. Batch processing tracks progress and failures
8. API routes return correct responses with mock data
9. No external UI dependencies
10. No unreleased design tokens from existing systems
11. All code is original
12. Appwrite integration works when env vars are set
13. Mock mode works without Appwrite
14. Workspace/member system supports multi-team use
15. Failure diagnosis correctly categorizes and retries failures

---

## 12. WHAT THIS IS NOT

- This is NOT a prototyping tool (like Alloy)
- This is NOT a design system documentation tool (like Storybook)
- This is NOT a visual regression testing tool
- This is NOT a website builder
- This is NOT a screenshot/annotation tool

This IS:
- An extraction engine — input URLs, output structured component data
- A classification system — every component gets aesthetic + functional + structural classification
- A catalog — browse, filter, search, compare extracted components
- A batch processor — process hundreds of URLs with failure handling
- A dataset generator — produce structured training data for design AI
