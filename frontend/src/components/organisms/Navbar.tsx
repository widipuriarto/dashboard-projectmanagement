import Breadcrumbs from "@/components/molecules/Breadcrumbs";
import ProfileDropdown from "@/components/molecules/ProfileDropdown";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 md:h-[90px] w-full items-center justify-between bg-white px-3 sm:px-6 md:px-8 transition-all duration-300">
      <Breadcrumbs />

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          type="button"
          className="relative flex items-center justify-center h-9 w-9 rounded-md bg-[#F6F7FB] border border-slate-300/80 text-slate-600 transition-all hover:bg-slate-100 hover:border-slate-400/80 hover:text-slate-950 active:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-telkom-navy cursor-pointer"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px] select-none leading-none">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-telkom-red ring-2 ring-white shadow-xs"></span>
        </button>
        
        <ProfileDropdown />
      </div>
    </header>
  );
}