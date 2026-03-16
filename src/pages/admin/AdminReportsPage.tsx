import { useState } from "react"
import { 
  FileText, 
  FileSearch,
  Link2, 
  User, 
  ShieldAlert,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { MatchLinkingModal } from "@/features/admin/MatchLinkingModal"

// Mock Data
const MOCK_REPORTS = [
  { id: "REP-9021", student: "Juan Dela Cruz", item: "ASUS Laptop", category: "Electronics", date: "2024-03-16", status: "Under Review" },
  { id: "REP-9020", student: "Maria Clara", item: "Red Backpack", category: "Bags", date: "2024-03-15", status: "Submitted" },
  { id: "REP-9019", student: "Jose Rizal", item: "National U ID Card", category: "Wallets/IDs", date: "2024-03-15", status: "Active Search" },
  { id: "REP-9018", student: "Emilio Aguinaldo", item: "Silver Watch", category: "Electronics", date: "2024-03-14", status: "Submitted" },
]

export function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showLinker, setShowLinker] = useState(false)

  return (
    <div className="space-y-8">
      {showLinker && selectedReport && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-xl border border-white/20">
            <MatchLinkingModal 
              reportId={selectedReport} 
              itemTitle={MOCK_REPORTS.find(r => r.id === selectedReport)?.item || "Item"}
              onClose={() => setShowLinker(false)} 
            />
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Missing Items</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Monitor and verify incoming student lost reports against system records.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-4 space-y-4">
          {/* Filter Section - Synced Design */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative group">
              <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
              <input 
                type="text"
                placeholder="Search reports..."
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all shadow-inner"
              />
            </div>
            <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
              {["All", "Electronics", "Bags", "Wallets/IDs"].map(cat => (
                <button
                  key={cat}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm",
                    cat === "All" 
                      ? "bg-brand text-white border-brand shadow-brand/20" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 active:scale-95"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            {MOCK_REPORTS.map((report) => (
              <div 
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={cn(
                  "p-5 bg-white rounded-2xl border transition-all cursor-pointer group shadow-sm relative overflow-hidden",
                  selectedReport === report.id 
                    ? "border-brand ring-2 ring-brand/10 scale-[1.01] shadow-sm" 
                    : "border-slate-100 hover:border-brand/20 hover:shadow-sm"
                )}
              >
                {selectedReport === report.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand" />}
                
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {report.id}
                  </span>
                  <StatusBadge status={report.status} />
                </div>
                <h4 className="font-bold text-slate-800 text-[15px] mb-1 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                  {report.item}
                </h4>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-4 shrink-0">
                  <User className="w-3 h-3 text-slate-300 shrink-0" />
                  {report.student}
                </div>
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-brand/60 bg-brand/5 -mx-5 -mb-5 px-5 py-2.5 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {report.date}
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-brand/10">{report.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Workspace Area */}
        <div className="xl:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[700px] flex flex-col relative">
          {selectedReport ? (
            <div className="flex flex-col h-full">
              {/* Workspace Utility Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase underline underline-offset-4 decoration-brand/20 decoration-2">Report Workspace</h2>
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Reference:</span>
                      <span className="text-brand font-extrabold tracking-tight">{selectedReport}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px] h-10 px-4 rounded-lg">
                    <MessageSquare className="w-4 h-4 mr-2 text-brand" /> Send Inquiry
                  </Button>
                  <Button 
                    onClick={() => setShowLinker(true)}
                    size="sm" 
                    className="bg-brand hover:bg-brand-active text-white font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-lg transition-all active:scale-95"
                  >
                    <Link2 className="w-4 h-4 mr-2" /> Match Inventory
                  </Button>
                </div>
              </div>

              {/* Workspace Content */}
              <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Left: Metadata Section */}
                  <div className="space-y-10">
                    <DetailSection title="Reported Identity">
                      <div className="space-y-6">
                        <DetailItem label="Official Name / Description" value="ASUS ROG Zephyrus G14" />
                        <div className="grid grid-cols-2 gap-4">
                           <DetailItem label="Category" value="Electronics" />
                           <DetailItem label="Primary Color" value="Eclipse Gray" />
                        </div>
                        <DetailItem label="Brand / Model" value="ASUS ROG (2023 Model)" />
                        <div className="h-px bg-slate-100 w-full" />
                        <DetailItem label="Last Known Location" value="Main Library - Common Area" />
                        <DetailItem label="Estimated Time Window" value="Morning (6AM - 12PM)" />
                        <DetailItem label="Date of Loss" value="March 16, 2024" />
                      </div>
                    </DetailSection>

                    <div className="p-6 bg-brand/5 rounded-2xl border border-brand/10 space-y-3">
                       <h5 className="flex items-center gap-2 text-[10px] font-bold text-brand/60 uppercase tracking-widest font-mono px-3 py-1 bg-brand/5 rounded-lg w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Conditional Proof Data
                       </h5>
                       <div className="grid grid-cols-1 gap-4">
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Device/Bluetooth Name</div>
                           <div className="text-sm font-bold text-slate-800">Mika's Workstation 2024</div>
                         </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Marks / Stickers</div>
                           <div className="text-sm font-bold text-slate-800">National U sticker on the lid, small scratch on top left.</div>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Right: Security & Decisions */}
                  <div className="space-y-10">
                    <DetailSection title="Privacy Guarded Data" icon={<ShieldAlert className="w-4 h-4 text-rose-500" />}>
                      <div className="space-y-4">
                        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed relative group transition-all hover:bg-white hover:border-brand/20">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-mono">Student Private Note</label>
                          <div className="blur-md select-none text-sm text-slate-300 pointer-events-none transition-all duration-700 group-hover:blur-sm">
                            The lock screen password is my birthday 04/21/2000 and there is a circular sticker of a cat...
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] opacity-100 group-hover:bg-white/10 transition-all rounded-2xl">
                            <Button size="sm" className="bg-brand text-white hover:bg-brand-active text-[10px] font-bold tracking-widest h-9 px-6 rounded-lg uppercase shadow-sm">
                              <Eye className="w-3.5 h-3.5 mr-2" /> Reveal Private Note
                            </Button>
                          </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-inner">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Reference Attachment</label>
                          <div className="w-full aspect-video bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 border-dashed">
                             <HelpCircle className="w-8 h-8 text-slate-200 mb-2" />
                             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">No media attached to report</span>
                          </div>
                        </div>
                      </div>
                    </DetailSection>

                    {/* Footer Decision Unit */}
                    <div className="pt-8 border-t border-slate-100 flex gap-4">
                      <Button variant="outline" className="flex-1 h-12 bg-white border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all">
                        <XCircle className="w-4 h-4 mr-2" /> Reject Report
                      </Button>
                      <Button className="flex-2 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Verify & Authorize
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-pulse">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-6">
                <FileText className="w-12 h-12 text-slate-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Accessing Queue...</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Select a report from the list to begin system verification.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailSection({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 pb-3 bg-brand/5 -mx-3 px-3 py-1 rounded-lg w-fit">
        {icon || <div className="w-1.5 h-1.5 rounded-full bg-brand" />}
        <h5 className="text-[11px] font-extrabold text-brand uppercase tracking-[0.2em]">{title}</h5>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="group/item">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none transition-colors">{label}</div>
      <div className="text-[15px] font-bold text-slate-800 tracking-tight transition-all">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const getStyles = () => {
    switch(status) {
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'Active Search': return 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all",
      getStyles()
    )}>
      {status}
    </span>
  )
}
