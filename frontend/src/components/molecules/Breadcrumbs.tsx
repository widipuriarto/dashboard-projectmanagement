import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { useNavigationGuard } from "@/context/NavigationGuardContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

const ROUTE_DEFINITIONS: Record<string, { label: string; parent?: { label: string; href: string } }> = {
  "/": {
    label: "Dashboard",
  },
  "/repository": {
    label: "Repository",
    parent: {
      label: "Dashboard",
      href: "/",
    },
  },
  "/settings": {
    label: "Settings",
    parent: {
      label: "Dashboard",
      href: "/",
    },
  },
};

export default function Breadcrumbs() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { confirmNavigation } = useNavigationGuard();
  const location = useLocation();
  const currentPath = location.pathname;

  const currentRoute = ROUTE_DEFINITIONS[currentPath] ?? {
    label: currentPath.replace("/", "").replace(/_/g, " "),
    parent: { label: "Dashboard", href: "/" },
  };

  const items: BreadcrumbItem[] = [];

  if (currentRoute.parent) {
    items.push({
      label: currentRoute.parent.label,
      href: currentRoute.parent.href,
      active: false,
    });
  }

  items.push({
    label: currentRoute.label,
    active: true,
  });

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Sidebar / Layout Dock Toggle Icon */}
      <button
        type="button"
        onClick={toggleSidebar}
        className={cn(
          "inline-flex items-center justify-center h-9 w-9 rounded-md text-slate-600 border border-transparent transition-all select-none cursor-pointer shrink-0",
          "hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200/80 hover:shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
          "active:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-telkom-navy"
        )}
        aria-label={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
      >
        <span
          className={cn(
            "material-symbols-outlined text-[20px] select-none leading-none transition-transform duration-300",
            isCollapsed && "scale-x-[-1]"
          )}
        >
          dock_to_right
        </span>
      </button>

      {/* Vertical Subtle Divider */}
      <div className="h-4 w-[1px] bg-slate-200 shrink-0" aria-hidden="true" />

      {/* Breadcrumb Navigation Trail */}
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex items-center gap-1.5 sm:gap-2 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const pillBaseClasses = "inline-flex items-center justify-center h-9 px-2.5 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all select-none leading-none";

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.active || !item.href ? (
                  <span
                    className={cn(
                      pillBaseClasses,
                      "text-slate-900 bg-slate-50 border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    )}
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href || "#"}
                    onClick={(e) => {
                      if (item.href && !confirmNavigation(item.href)) {
                        e.preventDefault();
                      }
                    }}
                    className={cn(
                      pillBaseClasses,
                      "text-slate-600 border border-transparent",
                      "hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200/80 hover:shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    )}
                  >
                    {item.label}
                  </Link>
                )}

                {!isLast && (
                  <span
                    className="material-symbols-outlined text-[9.5px] text-slate-400 select-none leading-none"
                    aria-hidden="true"
                  >
                    arrow_forward_ios
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

