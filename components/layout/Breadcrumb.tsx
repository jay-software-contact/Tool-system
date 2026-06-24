import React from "react";
import { useTheme } from "../ui/ThemeContext";

// ---- Types ----

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// ---- Component ----

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const { tokens } = useTheme();

  const listStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    margin: 0,
    padding: 0,
    listStyle: "none",
    fontSize: "0.6875rem",
    color: tokens.textMuted,
  };

  const linkStyle: React.CSSProperties = {
    color: tokens.textMuted,
    textDecoration: "none",
    transition: "color 150ms ease",
  };

  const activeStyle: React.CSSProperties = {
    color: tokens.text,
    fontWeight: 500,
  };

  return (
    <ol style={listStyle} className={className} aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            {idx > 0 && (
              <span aria-hidden="true" style={{ color: tokens.textDisabled }}>
                /
              </span>
            )}
            {item.href && !isLast ? (
              <a href={item.href} style={linkStyle}>
                {item.label}
              </a>
            ) : (
              <span style={isLast ? activeStyle : undefined}>{item.label}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default Breadcrumb;
