import * as React from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = "pm_rso1_sidebar_collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (window.innerWidth < 1024) return true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile((prev) => {
        if (!prev && mobile) {
          setIsCollapsed(true);
        }
        return mobile;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save sidebar state to localStorage", e);
      }
      return next;
    });
  }, []);

  const handleSetIsCollapsed = React.useCallback((val: boolean) => {
    setIsCollapsed(val);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    } catch (e) {
      console.error("Failed to save sidebar state to localStorage", e);
    }
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar shortcut: Ctrl+B or Cmd+B, or Ctrl+\
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "b" || e.key === "\\")) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setIsCollapsed: handleSetIsCollapsed,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

