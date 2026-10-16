import { LayoutDashboard, Database, Settings } from "lucide-react";
import NavGroup from "@/components/molecules/NavGroup";
import type { NavLinkData } from "@/components/molecules/NavGroup";
import telkomLogo from "@/assets/logo-telkom.png";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed, isMobile } = useSidebar();

  const mainLinks: NavLinkData[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Repository", href: "/repository", icon: Database },
  ];

  const systemLinks: NavLinkData[] = [{ label: "Settings", href: "/settings", icon: Settings }];

  return (
    <>
      {/* Mobile Backdrop Overlay when sidebar drawer is open */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Spacer (prevents main page from shifting when sidebar expands as overlay) */}
      <div className="hidden max-lg:block shrink-0 w-[64px] sm:w-[72px] h-screen pointer-events-none" />

      {/* Main Sidebar Element */}
      <aside
        className={cn(
          "top-0 h-screen flex flex-col bg-white transition-all duration-300 ease-in-out select-none",
          // Mobile: Collapsed sits in-flow, Expanded floats as fixed overlay
          isMobile
            ? isCollapsed
              ? "absolute lg:static top-0 left-0 z-30 w-[64px] sm:w-[72px] shrink-0"
              : "fixed inset-y-0 left-0 z-50 w-[240px] shadow-2xl"
            : "sticky top-0 z-40 shrink-0",
          !isMobile && (isCollapsed ? "w-[72px]" : "w-[240px]")
        )}
      >
        <div
          className={cn(
            "flex h-16 md:h-[90px] items-center justify-center w-full overflow-hidden transition-all duration-300 ease-in-out",
            isCollapsed ? "px-0" : "px-2 sm:px-3"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center min-w-0 transition-all duration-300 ease-in-out",
              isCollapsed ? "gap-0" : "gap-3"
            )}
          >
            <div
              className={cn(
                "flex h-12 md:h-14 shrink-0 items-center justify-center transition-transform duration-300 ease-in-out",
                isCollapsed && "translate-x-1.5 sm:translate-x-2"
              )}
            >
              <img
                src={telkomLogo}
                alt="Telkom Indonesia Logo"
                className="h-10 md:h-12 w-auto max-w-[54px] md:max-w-[58px] object-contain shrink-0 transition-all duration-300"
              />
            </div>
            <h1
              className={cn(
                "text-[15px] md:text-base font-bold tracking-tight text-slate-900 whitespace-nowrap transition-all duration-300 ease-in-out",
                isCollapsed
                  ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none overflow-hidden"
                  : "max-w-[170px] opacity-100 translate-x-0"
              )}
            >
              PM RSO I <span className="text-telkom-navy">TR 3</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-2.5 sm:px-3.5 py-2 pb-6 transition-all duration-300 ease-in-out [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <NavGroup title="Main" links={mainLinks} isCollapsed={isCollapsed} />
          <div className="mt-auto w-full">
            <NavGroup title="System" links={systemLinks} isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
