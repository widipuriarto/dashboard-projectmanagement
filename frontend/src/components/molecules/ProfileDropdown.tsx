import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";

function getDynamicGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return "Good morning,";
  if (hour >= 12 && hour < 17) return "Good afternoon,";
  if (hour >= 17 && hour < 21) return "Good evening,";
  return "Good evening,";
}

interface ProfileDropdownProps {
  greeting?: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
}

export default function ProfileDropdown({
  greeting,
  userName = "Project Manager",
  userRole = "Project Manager",
  userEmail = "pm.rso@telkom.co.id",
}: ProfileDropdownProps) {
  const displayGreeting = greeting ?? getDynamicGreeting();

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-telkom-navy focus-visible:ring-offset-2 rounded-lg cursor-pointer select-none">
          <div className="h-9 w-9 rounded-lg bg-telkom-navy text-white text-xs font-semibold flex items-center justify-center border border-slate-200/80 shadow-xs shrink-0">
            PM
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 mt-1 bg-white/95 backdrop-blur-md shadow-lg border-none rounded-xl">
        <DropdownMenuLabel className="font-normal px-3 py-2">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold leading-none text-telkom-navy truncate">{userName}</p>
              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">{userRole}</span>
            </div>
            <p className="text-xs leading-none text-slate-500">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-100" />
        
        <DropdownMenuItem className="cursor-pointer py-2 px-3 text-slate-600 focus:bg-slate-50 focus:text-telkom-navy">
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer py-2 px-3 text-slate-600 focus:bg-slate-50 focus:text-telkom-navy">
          <Settings className="mr-2 h-4 w-4" />
          <span>Preferences</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-100" />
        
        <DropdownMenuItem className="cursor-pointer py-2 px-3 text-telkom-red focus:bg-red-50 focus:text-telkom-red">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Static non-clickable text block */}
    <div className="hidden sm:flex flex-col text-left cursor-default select-none">
      <span className="text-xs text-slate-400 font-normal leading-tight">
        {displayGreeting}
      </span>
      <span className="text-sm font-bold text-slate-900 leading-tight">
        {userName}
      </span>
    </div>
  </div>
  );
}