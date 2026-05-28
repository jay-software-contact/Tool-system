"use client";

import { useEffect, useState } from "react";

interface StatCard {
  icon: string;
  label: string;
  value: string;
  accent: string;
}

const STAT_TEMPLATE: Omit<StatCard, "value">[] = [
  {
    icon: "fa-puzzle-piece",
    label: "Tool Profiles",
    accent: "text-amber-400 border-l-amber-500",
  },
  {
    icon: "fa-shapes",
    label: "UI Components",
    accent: "text-teal-400 border-l-teal-500",
  },
  {
    icon: "fa-layer-group",
    label: "Templates",
    accent: "text-blue-400 border-l-blue-500",
  },
  {
    icon: "fa-robot",
    label: "Hermes Status",
    accent: "text-green-400 border-l-green-500",
  },
  {
    icon: "fa-network-wired",
    label: "Engine Nodes",
    accent: "text-green-400 border-l-green-500",
  },
  {
    icon: "fa-toolbox",
    label: "Toolsets Active",
    accent: "text-purple-400 border-l-purple-500",
  },
];

interface DashboardData {
  tools: number;
  components: number;
  templates: number;
  status: string;
}

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json && typeof json.tools === "number") {
          setData(json);
        }
      })
      .catch(() => {});
  }, []);

  const stats: StatCard[] = STAT_TEMPLATE.map((s) => {
    let value = "—";
    if (!data) {
      value = "—";
    } else if (s.label === "Tool Profiles") {
      value = String(data.tools);
    } else if (s.label === "UI Components") {
      value = String(data.components);
    } else if (s.label === "Templates") {
      value = String(data.templates);
    } else if (s.label === "Hermes Status") {
      value = data.status === "online" ? "Online" : "Offline";
    } else if (s.label === "Engine Nodes") {
      value = "5";
    } else if (s.label === "Toolsets Active") {
      value = data.tools > 0 ? String(data.tools) : "—";
    }
    return { ...s, value };
  });

  return (
    <section>
      <h2 className="font-display text-xl font-bold text-primary mb-1">
        Dashboard
      </h2>
      <p className="text-sm text-secondary mb-6">
        System overview and quick metrics
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-[#141820] rounded-[10px] p-5 border border-white/5 border-l-2 ${stat.accent.split(" ")[1]} transition-opacity ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <i
                className={`fas ${stat.icon} ${
                  stat.accent.split(" ")[0]
                } text-xs`}
              />
              <span className="text-[11px] text-secondary uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <div
              className={`font-display text-2xl font-bold ${
                stat.accent.split(" ")[0]
              }`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
