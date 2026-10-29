import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import Navbar from "@/components/organisms/Navbar";
import { SidebarProvider } from "@/context/SidebarContext";
import { NavigationGuardProvider } from "@/context/NavigationGuardContext";
import { ToastProvider } from "@/context/ToastContext";

export default function GlobalLayout() {
  return (
    <SidebarProvider>
      <NavigationGuardProvider>
        <ToastProvider>
          <div className="flex h-screen w-full bg-white font-sans text-slate-900 overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out">
              <Navbar />

              <div className="flex-1 pb-2 pr-2 md:pb-4 md:pr-4 bg-white overflow-hidden">
                <main className="h-full w-full overflow-y-auto bg-[#F6F7FB] border border-slate-300/80 rounded-lg md:rounded-xl p-3 sm:p-5 md:p-8 ">
                  <Outlet />
                </main>
              </div>
            </div>
          </div>
        </ToastProvider>
      </NavigationGuardProvider>
    </SidebarProvider>
  );
}
