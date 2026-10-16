import type { LucideIcon } from 'lucide-react';
import NavItem from '@/components/atoms/NavItem';
import { cn } from '@/lib/utils';

export interface NavLinkData {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroupProps {
  title?: string;
  links: NavLinkData[];
  isCollapsed?: boolean;
}

export default function NavGroup({ title, links, isCollapsed }: NavGroupProps) {
  return (
    <div className="flex flex-col gap-1 mb-6 w-full">
      {title && (
        <div className="relative flex items-center h-6 px-3 mb-1 overflow-hidden transition-all duration-300 ease-in-out">
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap transition-all duration-300 ease-in-out select-none",
              isCollapsed
                ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                : "max-w-[160px] opacity-100 translate-x-0"
            )}
          >
            {title}
          </span>
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-6 h-px bg-slate-200 rounded-full transition-all duration-300 ease-in-out",
              isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
            )}
          />
        </div>
      )}
      
      <div className="flex flex-col gap-2 w-full">
        {links.map((link) => (
          <NavItem 
            key={link.href} 
            label={link.label} 
            href={link.href} 
            icon={link.icon} 
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
}