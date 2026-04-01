import { MapPin } from 'lucide-react';

export function CampusOfficeMap() {
  return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Abstract Map Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ backgroundImage: 'radial-gradient(#1E2F85 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />
      
      {/* Fake roads/buildings for aesthetic */}
      <div className="absolute inset-x-0 h-12 bg-white top-1/4 -rotate-6 border-y-2 border-slate-200"></div>
      <div className="absolute inset-y-0 w-16 bg-white left-1/3 rotate-12 border-x-2 border-slate-200"></div>
      
      {/* Fake neighboring building */}
      <div className="absolute top-1/6 left-1/4 w-24 h-24 border border-slate-300 bg-slate-200/50 rounded-lg"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-20 border border-slate-300 bg-slate-200/50 rounded-lg"></div>

      {/* Target Building Callout */}
      <div className="relative z-10 w-44 h-32 border-2 border-brand bg-white rounded-xl shadow-[0_10px_30px_-10px_rgba(38,61,168,0.4)] flex flex-col items-center justify-center transform -translate-y-4">
        <div className="absolute -bottom-4 w-4 h-4 border-b-2 border-r-2 border-brand bg-white rotate-45"></div>
        <MapPin className="w-8 h-8 text-status-error mb-1 animate-bounce" />
        <span className="text-sm font-bold text-navy">ITSO Office</span>
        <span className="text-[10px] text-slate-500 font-medium">Main Building, Rm 101</span>
      </div>

      {/* Map Control overlay (fake) */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-medium text-slate-600 shadow-sm border border-slate-200 flex items-center gap-2">
        <MapPin className="w-3 h-3 text-brand" />
        Campus View
      </div>
    </div>
  );
}
