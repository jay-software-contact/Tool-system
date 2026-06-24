"use client";

import React from "react";
import { useTheme } from "../ui/ThemeContext";

// ---- Types ----

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  items?: NavItem[];
  className?: string;
}

const defaultItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/catalog" },
  { label: "Batch", href: "/batch" },
  { label: "Taxonomy", href: "/taxonomy" },
];

// ---- Component ----

export function Navbar({ items = defaultItems, className = "" }: NavbarProps) {
  const { tokens, theme, setTheme, availableThemes } = useTheme();

  const navStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: tokens.components?.nav?.height || "3rem",
    paddingLeft: tokens.components?.nav?.paddingX || "1rem",
    paddingRight: tokens.components?.nav?.paddingX || "1rem",
    backgroundColor: tokens.bg,
    borderBottom: `1px solid ${tokens.border}`,
    flexShrink: 0,
  };

  const brandStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: tokens.accent,
    letterSpacing: "-0.02em",
  };

  const linkStyle = (active?: boolean): React.CSSProperties => ({
    fontSize: "0.75rem",
    fontWeight: active ? 600 : 400,
    color: active ? tokens.accent : tokens.textMuted,
    textDecoration: "none",
    padding: "0.25rem 0.5rem",
    borderRadius: tokens.radii?.sm || "4px",
    transition: "color 150ms ease",
  });

  return (
    <nav style={navStyle} className={className} role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <a href="/" style={brandStyle} aria-label="the-System home">
          the-System
        </a>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {items.map((item) => (
            <a key={item.href} href={item.href} style={linkStyle(item.active)}>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Theme switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            background: tokens.bgHover,
            border: `1px solid ${tokens.border}`,
            borderRadius: tokens.radii?.sm || "4px",
            color: tokens.text,
            fontSize: "0.6875rem",
            padding: "0.25rem 0.5rem",
            outline: "none",
            cursor: "pointer",
          }}
          aria-label="Switch theme"
        >
          {availableThemes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </nav>
  );
}

export default Navbar;
