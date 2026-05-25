import React, { useState, useCallback, createContext, useContext } from "react";

// ---- Sidebar Context ----

const SidebarContext = createContext({
  isOpen: true,
  toggle: () => {},
  close: () => {},
  open: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

// ---- Theme Colors (dark modern: amber/teal/orange) ----

const COLORS = {
  bg: "bg-gray-950",
  bgHover: "hover:bg-amber-500/10",
  bgActive: "bg-amber-500/15",
  text: "text-gray-300",
  textActive: "text-amber-400",
  textMuted: "text-gray-500",
  border: "border-gray-800",
  accent: "text-amber-400",
  accentBg: "bg-amber-500/20",
  separator: "bg-gray-800",
};

// ---- Nav Item Icons (inline SVG) ----

const Icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  tools: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  categories: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
};

// ---- Default Nav Items ----

export const defaultNavItems = [
  { id: "dashboard", label: "Dashboard", icon: Icons.dashboard, href: "/" },
  { id: "tools", label: "Tools", icon: Icons.tools, href: "/tools" },
  { id: "categories", label: "Categories", icon: Icons.categories, href: "/categories" },
  { id: "search", label: "Search", icon: Icons.search, href: "/search" },
  { id: "settings", label: "Settings", icon: Icons.settings, href: "/settings" },
];

// ---- SidebarNavItem ----

export function SidebarNavItem({ item, isActive, collapsed, onClick }) {
  return (
    <button
      onClick={() => onClick?.(item)}
      title={collapsed ? item.label : undefined}
      className={`
        group flex items-center w-full gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-200 ease-in-out
        ${isActive
          ? `${COLORS.bgActive} ${COLORS.textActive}`
          : `${COLORS.text} ${COLORS.bgHover} hover:${COLORS.textActive}`
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
    >
      <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? COLORS.textActive : `${COLORS.textMuted} group-hover:${COLORS.textActive}`}`}>
        {item.icon}
      </span>
      {!collapsed && (
        <span className="text-sm font-medium truncate">
          {item.label}
        </span>
      )}
    </button>
  );
}

// ---- SidebarSection ----

export function SidebarSection({ title, children, collapsed }) {
  return (
    <div className="mb-4">
      {!collapsed && title && (
        <div className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider ${COLORS.textMuted}`}>
          {title}
        </div>
      )}
      {collapsed && title && (
        <div className={`my-3 mx-2 h-px ${COLORS.separator}`} />
      )}
      <nav className="flex flex-col gap-0.5">
        {children}
      </nav>
    </div>
  );
}

// ---- Sidebar (Main Component) ----

export function Sidebar({
  navItems = defaultNavItems,
  activeItemId,
  onNavItemClick,
  defaultOpen = true,
  logo,
  footer,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  const contextValue = React.useMemo(
    () => ({ isOpen, toggle, close, open }),
    [isOpen, toggle, close, open]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={`
          flex flex-col h-full ${COLORS.bg} border-r ${COLORS.border}
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-16"}
          ${className}
        `}
      >
        {/* Header / Toggle */}
        <div className={`flex items-center h-14 px-3 border-b ${COLORS.border} ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              {logo || (
                <span className={`text-lg font-bold ${COLORS.textActive}`}>
                  OpenClaw
                </span>
              )}
            </div>
          )}
          <button
            onClick={toggle}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className={`
              p-1.5 rounded-md ${COLORS.textMuted} hover:${COLORS.textActive}
              hover:${COLORS.bgActive} transition-colors duration-150
            `}
          >
            {isOpen ? Icons.chevronLeft : Icons.menu}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
          <SidebarSection title={isOpen ? "Navigation" : null} collapsed={!isOpen}>
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={item.id === activeItemId}
                collapsed={!isOpen}
                onClick={onNavItemClick}
              />
            ))}
          </SidebarSection>
        </div>

        {/* Footer */}
        {footer && (
          <div className={`border-t ${COLORS.border} p-3`}>
            {footer}
          </div>
        )}
      </aside>
    </SidebarContext.Provider>
  );
}

// ---- Mobile Overlay Sidebar ----

export function MobileSidebar({ isOpen, onClose, navItems, activeItemId, onNavItemClick, logo }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-64 ${COLORS.bg} border-r ${COLORS.border}
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          navItems={navItems}
          activeItemId={activeItemId}
          onNavItemClick={onNavItemClick}
          defaultOpen={true}
          logo={logo}
        />
      </div>
    </>
  );
}

export default Sidebar;
