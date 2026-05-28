'use client';

import { useEffect, useState } from 'react';
import DetailPanel from '../layout/DetailPanel';

interface ToolDoc {
  $id: string;
  name: string;
  slug?: string;
  category: string;
  description?: string;
  ratings?: string; // JSON blob
  iconUrl?: string;
  icon?: string;
  status?: string;
}

function ratingColor(rating: number) {
  if (rating >= 4.5) return 'text-green-400';
  if (rating >= 3.5) return 'text-teal-400';
  return 'text-amber-400';
}

function parseRatings(ratingsStr?: string) {
  if (!ratingsStr) return { ease: 3, custom: 3, perf: 3, cost: 3 };
  try {
    const r = JSON.parse(ratingsStr);
    return {
      ease: r.ease ?? 3,
      custom: r.custom ?? 3,
      perf: r.perf ?? 3,
      cost: r.cost ?? 3,
    };
  } catch {
    return { ease: 3, custom: 3, perf: 3, cost: 3 };
  }
}

export default function ToolListView() {
  const [tools, setTools] = useState<ToolDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolDoc | null>(null);

  useEffect(() => {
    fetch('/api/tools/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.tools && Array.isArray(data.tools)) {
          setTools(data.tools);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="font-display text-xl font-bold text-primary mb-1">
          Tools
        </h2>
        <p className="text-sm text-secondary">Loading...</p>
      </section>
    );
  }

  if (error || tools.length === 0) {
    return (
      <section>
        <h2 className="font-display text-xl font-bold text-primary mb-1">
          Tools
        </h2>
        <p className="text-sm text-secondary mb-6">
          Error loading tools. The database may not be seeded yet.
        </p>
      </section>
    );
  }

  return (
    <>
      <section>
        <h2 className="font-display text-xl font-bold text-primary mb-1">
          Tools
        </h2>
        <p className="text-sm text-secondary mb-6">
          {tools.length} tools in catalog
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const ratings = parseRatings(tool.ratings);
            const avgRating =
              (ratings.ease + ratings.custom + ratings.perf + ratings.cost) / 4;

            return (
              <button
                key={tool.$id}
                onClick={() => setSelectedTool(tool)}
                className="text-left bg-[#141820] rounded-[10px] p-4 border border-white/5 hover:border-accent1/30 transition-colors group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
                    <i
                      className={`fas ${tool.iconUrl || tool.icon || 'fa-puzzle-piece'} text-amber-400 text-sm`}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-primary">
                      {tool.name}
                    </h3>
                    <span className="text-[11px] text-secondary">
                      {tool.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary">Rating</span>
                  <span
                    className={`font-display text-lg font-bold ${ratingColor(avgRating)}`}
                  >
                    {avgRating.toFixed(1)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <DetailPanel item={selectedTool} onClose={() => setSelectedTool(null)} />
    </>
  );
}
