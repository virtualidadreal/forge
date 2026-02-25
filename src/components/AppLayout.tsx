import { NavLink, Outlet } from 'react-router-dom';
import { useBrandDNAStore } from '../store/brandDNA.store';
import { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

const navItems = [
  { to: '/studio', label: 'Studio', icon: '\uD83C\uDFA8' },
  { to: '/generator', label: 'Generar', icon: '\u2728' },
  { to: '/results', label: 'Resultados', icon: '\uD83D\uDCCA' },
  { to: '/editor', label: 'Editor', icon: '\u270F\uFE0F' },
  { to: '/history', label: 'Historial', icon: '\uD83D\uDD52' },
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
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            FORGE
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto border-t border-border px-4 py-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="mb-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <span className="text-base leading-none">
              {isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
            </span>
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </button>

          {/* Active brand indicator */}
          {activeBrand ? (
            <div className="rounded-lg bg-secondary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Marca activa
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {activeBrand.brand_name}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Sin marca activa
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
