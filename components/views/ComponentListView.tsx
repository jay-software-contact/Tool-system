"use client";

import { useEffect, useState } from "react";
import DetailPanel from "../layout/DetailPanel";

interface AppwriteDoc {
  $id: string;
  name?: string;
  type?: string;
  style?: string;
  colors?: string;
  font?: string;
  description?: string;
  [key: string]: unknown;
}

export default function ComponentListView() {
  const [components, setComponents] = useState<AppwriteDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AppwriteDoc | null>(null);

  useEffect(() => {
    fetch("/api/components/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.components && Array.isArray(data.components)) {
          setComponents(data.components);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section>
        <h2 className="font-display text-xl font-bold text-primary mb-1">
          Components
        </h2>
        <p className="text-sm text-secondary mb-6">
          {loading
            ? "Loading..."
            : `${components.length} component${components.length !== 1 ? "s" : ""} in library`}
        </p>

        {loading ? (
          <p className="text-secondary text-sm">Loading components...</p>
        ) : components.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-shapes text-3xl text-white/10 mb-3" />
            <p className="text-secondary text-sm">
              No components added yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {components.map((comp) => {
              const colorArr: string[] =
                typeof comp.colors === "string"
                  ? JSON.parse(comp.colors)
                  : Array.isArray(comp.colors)
                    ? comp.colors
                    : ["#3B82F6", "#8B5CF6"];
              const gradient = `linear-gradient(135deg, ${colorArr[0]}, ${colorArr[1]})`;

              return (
                <button
                  key={comp.$id}
                  onClick={() => setSelected(comp)}
                  className="text-left bg-[#141820] rounded-[10px] overflow-hidden border border-white/5 hover:border-accent3/30 transition-colors group"
                >
                  <div
                    className="h-12 w-full"
                    style={{ background: gradient }}
                  />
                  <div className="p-4">
                    <h3 className="font-display text-sm font-bold text-primary mb-2">
                      {comp.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      {comp.type && (
                        <span className="px-2 py-0.5 text-[10px] rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {comp.type}
                        </span>
                      )}
                      {comp.style && (
                        <span className="px-2 py-0.5 text-[10px] rounded bg-white/5 text-secondary border border-white/10">
                          {comp.style}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {colorArr.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-sm border border-white/10"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      {comp.font && (
                        <span className="ml-2 text-[10px] text-secondary">
                          {comp.font}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <DetailPanel item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
