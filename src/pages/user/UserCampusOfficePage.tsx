import { MapPin, Phone, Mail, Clock, ShieldAlert, FileText } from "lucide-react"
import { CampusOfficeMap } from "@/components/ui/CampusOfficeMap"

export function UserCampusOfficePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            Location Guide
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus Admin Office</h1>
          <p className="text-slate-500 max-w-xl text-sm md:text-base leading-relaxed">
            Need to drop off a found item or pick up something you lost? Find our location and operating hours below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact & Location Info */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand" />
              Office Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Location</h3>
                  <p className="text-slate-500 text-sm mt-0.5">Main Building, Room 101<br/>Student Services Wing</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Operating Hours</h3>
                  <p className="text-slate-500 text-sm mt-0.5">Mon - Fri: 8:00 AM - 5:00 PM<br/>Sat - Sun: Closed</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Contact Number</h3>
                  <p className="text-slate-500 text-sm mt-0.5">(123) 456-7890 ext. 101</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Email Support</h3>
                  <p className="text-brand text-sm mt-0.5 hover:underline cursor-pointer">lostandfound@campus.edu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reminders */}
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
            <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Important Reminders
            </h2>
            <ul className="text-sm text-amber-800/80 space-y-2 list-disc list-inside">
              <li>Bring your Student ID for verification.</li>
              <li>Have your claim reference code ready.</li>
              <li>Unclaimed items are archived after 30 days.</li>
              <li>High-value items require secondary ID.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-2 flex flex-col min-h-[500px] h-full">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex-1 relative flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm z-20 shrink-0">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand" />
                Campus Map
              </h2>
            </div>
            
            <div className="flex-1 relative z-10 w-full h-full bg-slate-100">
              {/* Insert the map component right here */}
              <CampusOfficeMap />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
