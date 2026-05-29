'use client';

import { useEffect, useCallback } from 'react';

interface Component {
  name: string;
  type: string;
  style: string;
  colors: string[];
  font: string;
}

type DetailItem = Component | Record<string, any> | null;

interface DetailPanelProps {
  item: DetailItem;
  onClose: () => void;
}

const RATING_LABELS: Record<string, string> = {
  ease: 'Ease of Use',
  custom: 'Customization',
  perf: 'Performance',
  cost: 'Cost Efficiency',
};

function ratingColor(value: number) {
  if (value >= 5) return 'bg-green-500';
  if (value >= 4) return 'bg-teal-500';
  if (value >= 3) return 'bg-amber-500';
  return 'bg-red-500';
}

function parseRatings(ratings: any) {
  if (!ratings) return { ease: 3, custom: 3, perf: 3, cost: 3 };
  if (typeof ratings === 'string') {
    try {
      const r = JSON.parse(ratings);
      return { ease: r.ease ?? 3, custom: r.custom ?? 3, perf: r.perf ?? 3, cost: r.cost ?? 3 };
    } catch {
      return { ease: 3, custom: 3, perf: 3, cost: 3 };
    }
  }
  return {
    ease: ratings.ease ?? 3,
    custom: ratings.custom ?? 3,
    perf: ratings.perf ?? 3,
    cost: ratings.cost ?? 3,
  };
}

export default function DetailPanel({ item, onClose }: DetailPanelProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const isComponent = item && 'colors' in item;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          item ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-[440px] bg-[#141820] border-l border-[#1E2330] z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          item ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {item && isComponent && <ComponentPanel component={item as Component} onClose={onClose} />}
        {item && !isComponent && <ToolPanel tool={item as any} onClose={onClose} />}
      </div>
    </>
  );
}

function ToolPanel({ tool, onClose }: { tool: Record<string, any>; onClose: () => void }) {
  const ratings = parseRatings(tool.ratings);
  const bestCases: string[] = tool.bestCases || [];
  const worstCases: string[] = tool.worstCases || [];
  const proximity: string[] = tool.proximity || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <i className={`fas ${tool.iconUrl || tool.icon || 'fa-puzzle-piece'} text-amber-400 text-lg`} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-primary">
              {tool.name}
            </h2>
            <span className="text-xs text-secondary">{tool.category}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary transition-colors p-1"
        >
          <i className="fas fa-times" />
        </button>
      </div>

      {/* Description */}
      {tool.description && (
        <p className="text-sm text-secondary leading-relaxed mb-6">
          {tool.description}
        </p>
      )}

      {/* Ratings */}
      <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-3">
        Ratings
      </h3>
      <div className="space-y-3 mb-6">
        {Object.entries(ratings).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-secondary w-28 shrink-0">
              {RATING_LABELS[key] || key}
            </span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${ratingColor(value as number)}`}
                style={{ width: `${((value as number) / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-primary font-display w-6 text-right">
              {value as number}
            </span>
          </div>
        ))}
      </div>

      {/* Best Cases */}
      {bestCases.length > 0 && (
        <>
          <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Best For
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {bestCases.map((c: string) => (
              <span
                key={c}
                className="px-2.5 py-1 text-xs rounded bg-green-500/10 text-green-400 border border-green-500/20"
              >
                {c}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Worst Cases */}
      {worstCases.length > 0 && (
        <>
          <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Avoid When
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {worstCases.map((c: string) => (
              <span
                key={c}
                className="px-2.5 py-1 text-xs rounded bg-red-500/10 text-red-400 border border-red-500/20"
              >
                {c}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Differentiation */}
      {tool.differentiation && (
        <>
          <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Differentiation
          </h3>
          <p className="text-sm text-secondary leading-relaxed mb-6">
            {tool.differentiation}
          </p>
        </>
      )}

      {/* Proximity Tags */}
      {proximity.length > 0 && (
        <>
          <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Nearby Tools
          </h3>
          <div className="flex flex-wrap gap-2">
            {proximity.map((p: string) => (
              <span
                key={p}
                className="px-2.5 py-1 text-xs rounded bg-white/5 text-secondary border border-white/10"
              >
                {p}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ComponentPanel({ component, onClose }: { component: Component; onClose: () => void }) {
  const gradient = `linear-gradient(135deg, ${component.colors[0]}, ${component.colors[1]})`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display text-lg font-bold text-primary">
            {component.name}
          </h2>
          <span className="text-xs text-secondary">{component.font}</span>
        </div>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary transition-colors p-1"
        >
          <i className="fas fa-times" />
        </button>
      </div>

      {/* Gradient swatch */}
      <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-2">
        Preview
      </h3>
      <div
        className="h-24 w-full rounded-lg mb-6 border border-white/10"
        style={{ background: gradient }}
      />

      {/* Type + Style badges */}
      <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-2">
        Classification
      </h3>
      <div className="flex items-center gap-2 mb-6">
        <span className="px-2.5 py-1 text-xs rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
          {component.type}
        </span>
        <span className="px-2.5 py-1 text-xs rounded bg-white/5 text-secondary border border-white/10">
          {component.style}
        </span>
      </div>

      {/* Color palette */}
      <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-2">
        Color Palette
      </h3>
      <div className="flex items-center gap-3 mb-6">
        {component.colors.map((color, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-lg border border-white/10"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-secondary font-mono">{color}</span>
          </div>
        ))}
      </div>

      {/* Typography */}
      <h3 className="font-display text-xs font-semibold text-primary uppercase tracking-wider mb-2">
        Typography
      </h3>
      <div className="flex items-center gap-2 mb-6">
        <span className="px-2.5 py-1 text-xs rounded bg-accent2/10 text-accent2 border border-accent2/20">
          {component.font}
        </span>
      </div>
    </div>
  );
}
