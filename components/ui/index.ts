/**
 * UI Component Index — Barrel export for all UI components.
 * 
 * UI components are pure visual elements: they consume ThemeTokens
 * and emit events. They contain zero domain logic.
 * 
 * Categorization (highest hierarchy):
 *   ui/         — Atomic visual elements (Input, Card, Badge, Chip, Toast)
 *   layout/     — Structural wrappers (ViewShell, Topbar)
 *   views/      — Domain-aware composite views (PipelineListView, ExtractionView)
 */

export { default as Input } from './Input';
export { default as ThemeProvider, useTheme } from './ThemeContext';
export type { ThemeTokens, ThemeContextValue } from './ThemeContext';
