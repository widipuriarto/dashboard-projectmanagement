import * as React from "react";
import { useNavigate } from "react-router-dom";

export type DiscardAction = () => void;

export interface NavigationGuard {
  isDirty: boolean;
  requestDiscard: (proceed: DiscardAction) => void;
}

interface NavigationGuardContextType {
  registerGuard: (guard: NavigationGuard) => () => void;
  confirmNavigation: (target: string | DiscardAction) => boolean;
}

const NavigationGuardContext = React.createContext<NavigationGuardContextType | undefined>(undefined);

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const guardRef = React.useRef<NavigationGuard | null>(null);

  const registerGuard = React.useCallback((guard: NavigationGuard) => {
    guardRef.current = guard;
    return () => {
      if (guardRef.current === guard) {
        guardRef.current = null;
      }
    };
  }, []);

  const confirmNavigation = React.useCallback(
    (target: string | DiscardAction): boolean => {
      const activeGuard = guardRef.current;
      if (activeGuard && activeGuard.isDirty) {
        activeGuard.requestDiscard(() => {
          if (typeof target === "string") {
            navigate(target);
          } else if (typeof target === "function") {
            target();
          }
        });
        return false;
      }
      return true;
    },
    [navigate]
  );

  return (
    <NavigationGuardContext.Provider value={{ registerGuard, confirmNavigation }}>
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  const context = React.useContext(NavigationGuardContext);
  if (!context) {
    throw new Error("useNavigationGuard must be used within a NavigationGuardProvider");
  }
  return context;
}

