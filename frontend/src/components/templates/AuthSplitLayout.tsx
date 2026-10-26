import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import telkomLogo from "@/assets/logo-telkom.png";
import signImg from "@/assets/sign.jpg";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "pm_rso1_sidebar_collapsed";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  isTransitioning: boolean;
}

export function AuthSplitLayout({ children, isTransitioning }: AuthSplitLayoutProps) {
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });

  const [sidebarWidth, setSidebarWidth] = React.useState<number>(() => {
    if (typeof window === "undefined") return 240;
    if (window.innerWidth < 1024) return 64;
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return saved === "true" ? 72 : 240;
    } catch {
      return 240;
    }
  });

  React.useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setSidebarWidth(64);
      } else {
        try {
          const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
          setSidebarWidth(saved === "true" ? 72 : 240);
        } catch {
          setSidebarWidth(240);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-screen w-full bg-white flex overflow-hidden font-sans select-none">
      {/* Left Column: Form Panel with vertical centering and top logo */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between items-center px-6 sm:px-12 md:px-16 lg:px-20 z-10 py-6 sm:py-8 overflow-y-auto">
        {/* Top Slot: Telkom Logo shifted 5px to the right for optical balance */}
        <motion.div
          animate={{
            opacity: isTransitioning ? 0 : 1,
            x: isTransitioning ? -30 : 0,
            filter: isTransitioning ? "blur(3px)" : "blur(0px)",
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[390px] pt-4 sm:pt-6 flex justify-center shrink-0"
        >
          <img
            src={telkomLogo}
            alt="Telkom Indonesia"
            className="h-16 sm:h-20 w-auto object-contain select-none drop-shadow-xs translate-x-[5px]"
          />
        </motion.div>

        {/* Middle Slot: Exactly centered vertically in viewport */}
        <div className="w-full max-w-[390px] flex flex-col justify-center my-auto py-2">
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, filter: "blur(3px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Slot: Counter-balance so middle form is exactly centered vertically */}
        <div
          className="w-full max-w-[390px] pb-4 sm:pb-6 flex justify-center invisible pointer-events-none shrink-0"
          aria-hidden="true"
        >
          <div className="h-16 sm:h-20" />
        </div>
      </div>

      {/* Right Column: Visual Artwork Canvas (Matches exact 16px margin and 12px radius of main layout, border-free) */}
      <motion.div
        initial={false}
        animate={
          isTransitioning
            ? {
                top: isDesktop ? 90 : 64,
                right: isDesktop ? 16 : 8,
                bottom: isDesktop ? 16 : 8,
                left: isDesktop ? sidebarWidth : 64,
                borderRadius: 12,
                opacity: 1,
              }
            : isDesktop
            ? {
                top: 16,
                right: 16,
                bottom: 16,
                left: "calc(50% + 8px)",
                borderRadius: 12,
                opacity: 1,
              }
            : {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                borderRadius: 0,
                opacity: 0,
                pointerEvents: "none",
              }
        }
        transition={
          isTransitioning
            ? {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }
            : {
                duration: 0,
              }
        }
        style={{
          position: "absolute",
          top: isDesktop ? 16 : 0,
          right: isDesktop ? 16 : 0,
          bottom: isDesktop ? 16 : 0,
          left: isDesktop ? "calc(50% + 8px)" : 0,
          borderRadius: isDesktop ? 12 : 0,
        }}
        className={cn(
          "bg-slate-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden z-20",
          !isDesktop && !isTransitioning && "pointer-events-none"
        )}
      >
        {/* Container for Artwork, Bottom Gradient Overlay & Title/Unit Typography */}
        <motion.div
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full h-full flex flex-col justify-end p-8 sm:p-10 select-none"
        >
          {/* Artwork Image filling the entire card */}
          <img
            src={signImg}
            alt="Visual Artwork"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Elevated Light Blue Gradient Overlay covering the lower portion of the image */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-slate-200 from-20% via-slate-200/80 via-60% to-transparent pointer-events-none" />

          {/* Bottom Branding & Title Typography */}
          <div className="relative z-10 space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Project Management System
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              Regional Solutions & Operations 1 • Telkom Regional 3
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

