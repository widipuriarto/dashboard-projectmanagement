import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchInput() {
  return (
    <div className="relative w-full max-w-lg transition-all duration-200 focus-within:max-w-xl">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input 
        type="search" 
        placeholder="Search by Order ID, SID, or Project Name..." 
        className="w-full pl-9 h-10 bg-slate-100/60 border-transparent focus-visible:ring-telkom-navy focus-visible:bg-white rounded-lg shadow-sm"
      />
    </div>
  );
}