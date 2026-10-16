import type { LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { useNavigationGuard } from '@/context/NavigationGuardContext';

interface NavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isCollapsed?: boolean;
}

export default function NavItem({ label, href, icon: Icon, isCollapsed }: NavItemProps) {
  const { isMobile, isCollapsed: contextCollapsed, setIsCollapsed } = useSidebar();
  const { confirmNavigation } = useNavigationGuard();
  const location = useLocation();
  const isActive = href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const handleClick = (e: React.MouseEvent) => {
    const isAllowed = confirmNavigation(href);
    if (!isAllowed) {
      e.preventDefault();
      if (isMobile) {
        setIsCollapsed(true);
      }
      return;
    }

    if (isMobile) {
      if (contextCollapsed) {
        // On mobile: tapping a tab when collapsed opens the sidebar drawer
        e.preventDefault();
        setIsCollapsed(false);
      } else {
        // On mobile: selecting destination tab closes the sidebar drawer
        setIsCollapsed(true);
      }
    }
  };

  return (
    <NavLink
      to={href}
      onClick={handleClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        "relative flex items-center h-10 w-full rounded-lg text-sm transition-all duration-300 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-telkom-navy focus-visible:ring-offset-2 overflow-hidden px-3 gap-3 select-none",
        isActive
          ? "text-telkom-navy font-semibold bg-telkom-navy/5"
          : "text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/80"
      )}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-telkom-navy transition-all duration-300 ease-in-out"
        />
      )}
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors duration-200",
            isActive ? "text-telkom-navy" : "text-slate-500"
          )}
        />
      </div>
      <span
        className={cn(
          "whitespace-nowrap font-medium transition-all duration-300 ease-in-out",
          isCollapsed
            ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
            : "max-w-[160px] opacity-100 translate-x-0"
        )}
      >
        {label}
      </span>
    </NavLink>
  );
}