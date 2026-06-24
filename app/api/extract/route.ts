import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const HERMES_ENDPOINT = process.env.HERMES_ENDPOINT;
const HERMES_API_KEY = process.env.HERMES_API_KEY;

const SEVEN_AESTHETICS = [
  'Metal Heart',
  'GXSC',
  'Grunge',
  'Minimalist',
  'Corporate',
  'Futuristic',
  'Playful',
];

const OUTPUT_SCHEMA = `{
  "name": "string (PascalCase, e.g. PrimaryButton, FeatureCard)",
  "description": "string (1-2 sentences, appearance only, no functional language)",
  "aestheticCategory": "string (one of: ${SEVEN_AESTHETICS.join(', ')})",
  "type": "string (structural classification, e.g. Button, Card, Navbar, Hero, Input, Modal)",
  "function": "string (purpose classification, e.g. Conversion, Navigation, Information, Input, Display)",
  "designTokens": { "key": "value" }
}`;

export async function POST(req: NextRequest) {
  if (!HERMES_ENDPOINT || !HERMES_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Extraction service not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let url: string;
  try {
    const body = await req.json();
    url = body?.url;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Request body must be valid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!url || typeof url !== 'string') {
    return new Response(
      JSON.stringify({ error: 'url field is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const taskPayload = {
    model: 'openrouter/owl-alpha',
    messages: [
      {
        role: 'system',
        content: `You are a UI component extraction engine. Execute a three-phase extraction pipeline on the target URL.

PHASE 1 — LOOK: Navigate to the target URL using your browser tool. Wait for the full page to render. Extract the rendered DOM structure — every visible, distinct functional unit with a visual boundary.

PHASE 2 — DESCRIBE: For each identified component, determine:
- Name: PascalCase structural designation (e.g. PrimaryButton, FeatureCard, PricingTable)
- Component Type: Structural classification from the canonical set (Button, Card, Navbar, Hero, Input, Modal, Dropdown, Badge, Tooltip, Divider, Footer, Sidebar, Pricing-Table, Testimonial, Feature-Grid, Stat-Card, Avatar, Breadcrumb, Tabs, Accordion, Progress-Bar)
- Component Function: Purpose classification (Conversion, Navigation, Information, Input, Display, Social-Proof, Feedback)

PHASE 3 — ORGANIZE: For each component, extract the design tokens (computed CSS values: backgroundColor, color, fontSize, borderRadius, padding, border, boxShadow, fontFamily, gap, gradient — omit if absent). Then classify the aesthetic category by matching token evidence against these seven canonical definitions:

${SEVEN_AESTHETICS.map((a, i) => {
const definitions: Record<string, string> = {
'Metal Heart': 'Industrial, raw, exposed surface. Evidence: dark grays/blacks (#1A1A1A–#333333), sharp border-radius (0–4px), heavy box-shadows, monospace/slab-serif fonts, high contrast. Anti-patterns: pastels, large border-radius, delicate shadows.',
'GXSC': 'Styled but structured baseline. Evidence: neutral backgrounds (near-white #FAFAFA or dark #1E1E1E), consistent border-radius (8–12px), subtle 1px borders, clean sans-serif, minimal shadows. Anti-patterns: gradients, heavy textures, extreme contrast.',
'Grunge': 'Textured, degraded, anti-polished. Evidence: noise-gradient backgrounds, irregular border-radius, layered shadows, mixed typography, high visual contrast, visible imperfection. Anti-patterns: clean whitespace, consistent spacing, system fonts only.',
'Minimalist': 'Maximum reduction, typographic hierarchy carries weight. Evidence: white/near-white backgrounds (#FFFFFF–#F5F5F5), one accent color max, large padding (24px+), thin/zero borders, system fonts, zero shadows, extreme whitespace. Anti-patterns: multiple colors, decorative elements, heavy borders.',
'Corporate': 'Professional, trust-signaling, institution-coded. Evidence: blue primary (#0066FF range), white/light gray backgrounds, medium border-radius (6–8px), serif headings with sans-serif body, subtle shadows, grid layouts. Anti-patterns: dark backgrounds, saturated non-blue colors, playful typography.',
'Futuristic': 'Tech-forward, dark-native, gradient-heavy, translucent. Evidence: very dark backgrounds (#0A0A0F–#12121A), gradient accents (purple→blue, cyan→green), large border-radius (12–16px), backdrop-filter/blur, glow shadows, geometric sans-serif. Anti-patterns: white backgrounds, flat solid colors, small border-radius, serif typography.',
'Playful': 'Bright, rounded, friendly, approachable. Evidence: saturated/bright colors, very large border-radius (16–24px or pill-shaped 9999px), generous padding, rounded sans-serif fonts, soft shadows, pastel/light backgrounds. Anti-patterns: dark backgrounds, sharp corners, monospace fonts, minimal spacing.',
};
return `${i + 1}. ${a}: ${definitions[a] || ''}`;
}).join('\n')}

CLASSIFICATION RULE: Match token evidence to the closest aesthetic. If ambiguous (e.g., dark background with rounded corners — could be Futuristic or GXSC), classify as closest match and note ambiguity in the description.

OUTPUT FORMAT: Return a JSON array of component objects. No markdown wrapping. No explanatory text. Every component must have all six fields: name, description, aestheticCategory, type, function, designTokens.

Example output:
[
  {
    "name": "PrimaryButton",
    "description": "Rounded rectangular call-to-action button with gradient background and centered white text.",
    "aestheticCategory": "Futuristic",
    "type": "Button",
    "function": "Conversion",
    "designTokens": {
      "backgroundColor": "linear-gradient(135deg, #6366f1, #8b5cf6)",
      "color": "#ffffff",
      "borderRadius": "12px",
      "padding": "12px 32px",
      "fontSize": "16px",
      "fontFamily": "Inter, sans-serif"
    }
  }
]

IMPORTANT:
- Parse the RENDERED DOM (computed styles), not source HTML.
- Extract COMPUTED CSS values, not inline styles.
- Do NOT fabricate design tokens. If a value cannot be determined, omit the key.
- Do NOT include components smaller than 40px in any dimension (decorative dots, spacers, rules).
- Return ONLY the JSON array. No preamble, no code fences, no anti-pattern explanations.
- If the page cannot be rendered (auth wall, timeout, JS failure), return an empty array with a description explaining the failure in the first (and only) component's description field.`,
      },
      {
        role: 'user',
        content: `Extract all UI components from: ${url}

Return a JSON array conforming to this schema:
${OUTPUT_SCHEMA}

Execute the full three-phase pipeline: Look → Describe → Organize.`,
      },
    ],
    stream: true,
    max_tokens: 8192,
  };

  try {
    const upstream = await fetch(`${HERMES_ENDPOINT}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HERMES_API_KEY}`,
      },
      body: JSON.stringify(taskPayload),
      signal: AbortSignal.timeout(300000),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'Unknown upstream error');
      return new Response(
        JSON.stringify({ error: `Upstream error: ${upstream.status}`, details: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!upstream.body) {
      return new Response(
        JSON.stringify({ error: 'Upstream returned empty body' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Extraction failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
