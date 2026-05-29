"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "fa-chart-pie" },
  { label: "Tools", href: "/tools", icon: "fa-puzzle-piece" },
  { label: "Aesthetics Catalog", href: "/aesthetics", icon: "fa-palette" },
  { label: "Extraction", href: "/extraction", icon: "fa-magnifying-glass-chart" },
  { label: "Architecture", href: "/architecture", icon: "fa-diagram-project" },
  { label: "Settings", href: "/settings", icon: "fa-gear" },
  { label: "Chat", href: "/chat", icon: "fa-comment-dots" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] bg-deep flex flex-col"
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <span className="font-display text-2xl font-bold text-accent1 tracking-tight">
          System
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-accent1 bg-accent1/10"
                      : "text-secondary hover:text-primary hover:bg-white/5"
                  }`}
                >
                  <i className={`fas ${item.icon} text-xs w-4 text-center`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
