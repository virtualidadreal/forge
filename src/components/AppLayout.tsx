import { NavLink, Outlet } from 'react-router-dom';
import { useBrandDNAStore } from '../store/brandDNA.store';
import { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Navigation items with SVG icon paths
// ---------------------------------------------------------------------------

const navItems = [
  { to: '/studio', label: 'Studio', iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { to: '/generator', label: 'Generar', iconPath: 'M12 5v14M5 12h14' },
  { to: '/results', label: 'Resultados', iconPath: 'M4 6h16M4 10h16M4 14h10M4 18h6' },
  { to: '/editor', label: 'Editor', iconPath: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
  { to: '/history', label: 'Historial', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppLayout() {
  const getActiveBrand = useBrandDNAStore((s) => s.getActiveBrand);
  const activeBrand = getActiveBrand();

  // -- Dark mode toggle -----------------------------------------------------
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark',
  );

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  // -- Render ---------------------------------------------------------------
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-border/50 bg-sidebar">
        {/* Logo */}
        <div className="px-8 pt-10 pb-8">
          <h1 className="font-serif text-2xl italic">
            FORGE
          </h1>
        </div>

        {/* Separator */}
        <div className="section-divider mx-6 mb-6" />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1.5 px-5">
          {navItems.map(({ to, label, iconPath }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-xl px-4 py-3 text-[13px] transition-all duration-300 ${
                  isActive
                    ? 'bg-secondary text-foreground font-medium'
                    : 'text-muted-foreground font-light hover:bg-secondary/50 hover:text-foreground'
                }`
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 opacity-60"
              >
                <path d={iconPath} />
              </svg>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto border-t border-border px-7 py-8">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="mb-5 flex w-full items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs text-muted-foreground transition-all duration-300 hover:bg-secondary hover:text-foreground"
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            )}
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </button>

          {/* Active brand indicator */}
          {activeBrand ? (
            <div className="rounded-xl bg-secondary px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Marca activa
              </p>
              <p className="mt-1 truncate text-sm font-medium text-foreground">
                {activeBrand.brand_name}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border px-5 py-4">
              <p className="text-xs font-light text-muted-foreground">
                Sin marca activa
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
