"use client";

import { useEffect, useState } from "react";
import DetailPanel from "../layout/DetailPanel";

interface AppwriteDoc {
  $id: string;
  name?: string;
  description?: string;
  tools?: string;
  color?: string;
  icon?: string;
  [key: string]: unknown;
}

export default function TemplateListView() {
  const [templates, setTemplates] = useState<AppwriteDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AppwriteDoc | null>(null);

  useEffect(() => {
    fetch("/api/templates/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section>
        <h2 className="font-display text-xl font-bold text-primary mb-1">
          Templates
        </h2>
        <p className="text-sm text-secondary mb-6">
          {loading
            ? "Loading..."
            : `${templates.length} template${templates.length !== 1 ? "s" : ""} available`}
        </p>

        {loading ? (
          <p className="text-secondary text-sm">Loading templates...</p>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-layer-group text-3xl text-white/10 mb-3" />
            <p className="text-secondary text-sm">
              No templates added yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((tmpl) => {
              const brandColor = tmpl.color || "#8B5CF6";
              const toolList: string[] =
                typeof tmpl.tools === "string"
                  ? JSON.parse(tmpl.tools)
                  : Array.isArray(tmpl.tools)
                    ? tmpl.tools
                    : [];

              return (
                <button
                  key={tmpl.$id}
                  onClick={() => setSelected(tmpl)}
                  className="text-left bg-[#141820] rounded-[10px] p-5 border border-white/5 hover:border-white/15 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${brandColor}20`,
                        border: `1px solid ${brandColor}40`,
                      }}
                    >
                      <i
                        className={`fas ${tmpl.icon || "fa-layer-group"}`}
                        style={{ color: brandColor }}
                      />
                    </div>
                    <h3 className="font-display text-sm font-bold text-primary">
                      {tmpl.name}
                    </h3>
                  </div>
                  {tmpl.description && (
                    <p className="text-xs text-secondary mb-3 leading-relaxed">
                      {tmpl.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {toolList.map((tool, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] rounded bg-white/5 text-secondary border border-white/10"
                      >
                        {tool}
                      </span>
                    ))}
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
