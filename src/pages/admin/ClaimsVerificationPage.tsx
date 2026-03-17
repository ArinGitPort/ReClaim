import { useState } from "react"
import { 
  Package,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Eye,
  FileSearch
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

// Mock Data for Triage
const CLAIMS_DATA = [
  {
    id: "CLM-4421",
    category: "Electronics",
    student: "Juan Dela Cruz",
    studentId: "2021-10294",
    timeAgo: "2 hours ago",
    isHighValue: true,
    item: "Apple MacBook Pro M2",
    physicalDetails: {
      color: "Space Gray",
      condition: "Good",
      storage: "Safe A-1",
      serialNumber: "FVFGG0M1Q6L4",
      wallpaper: "Standard macOS Monterey"
    },
    studentProof: {
      marks: "Small scratch on the bottom right corner near the screw.",
      serialNumber: "FVFGG0M1Q6L4",
      wallpaper: "Standard macOS Monterey",
      privateNote: "Found in a black laptop sleeve with a National U sticker."
    }
  },
  {
    id: "CLM-4425",
    category: "Jewelry",
    student: "Maria Santos",
    studentId: "2022-05123",
    timeAgo: "15 minutes ago",
    isHighValue: true,
    item: "Engagement Ring (Gold)",
    physicalDetails: {
      color: "Yellow Gold",
      condition: "Excellent",
      storage: "Vault-01",
      serialNumber: "N/A",
      wallpaper: "N/A"
    },
    studentProof: {
      marks: "Engraved with 'A & M 2023' on the inside band.",
      serialNumber: "N/A",
      wallpaper: "N/A",
      privateNote: "It has a 1-carat diamond in a six-prong setting."
    }
  },
  {
    id: "CLM-4410",
    category: "Accessories",
    student: "Roberto Reyes",
    studentId: "2021-09821",
    timeAgo: "5 hours ago",
    isHighValue: false,
    item: "Hydro Flask Water Bottle",
    physicalDetails: {
      color: "Pacific Blue",
      condition: "Battered",
      storage: "Bin B-12",
      serialNumber: "N/A",
      wallpaper: "N/A"
    },
    studentProof: {
      marks: "Many stickers of anime characters (One Piece) and a dent on the bottom.",
      serialNumber: "N/A",
      wallpaper: "N/A",
      privateNote: "It was filled with iced tea when I lost it."
    }
  }
]

export function ClaimsVerificationPage() {
  const [selectedClaimId, setSelectedClaimId] = useState(CLAIMS_DATA[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [status, setStatus] = useState<"review" | "denying" | "success">("review")
  const [denyReason, setDenyReason] = useState("")
  const [revealWallpaper, setRevealWallpaper] = useState(false)
  const [revealSerial, setRevealSerial] = useState(false)
  
  // Selection change states
  const [isDirty, setIsDirty] = useState(false)
  const [pendingSelection, setPendingSelection] = useState<string | null>(null)

  const selectedClaim = CLAIMS_DATA.find(c => c.id === selectedClaimId) || CLAIMS_DATA[0]

  const handleClaimSelect = (id: string) => {
    if (id === selectedClaimId) return
    if (isDirty) {
      setPendingSelection(id)
    } else {
      setSelectedClaimId(id)
      setRevealWallpaper(false)
      setRevealSerial(false)
      setDenyReason("")
      setStatus("review")
    }
  }

  const confirmSwitch = () => {
    if (pendingSelection) {
      setSelectedClaimId(pendingSelection)
      setPendingSelection(null)
      setIsDirty(false)
      setRevealWallpaper(false)
      setRevealSerial(false)
      setDenyReason("")
      setStatus("review")
    }
  }

  const filteredClaims = CLAIMS_DATA.filter(c => {
    const matchesSearch = c.student.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (status === "success") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 min-h-[600px]">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner relative">
          <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-10" />
          <CheckCircle2 className="w-12 h-12 text-emerald-600 relative z-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">Claim Processed</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">The verification for {selectedClaim.id} has been completed. The student will receive an official notification shortly.</p>
        </div>
        <Button className="h-12 px-10 bg-brand hover:bg-brand-active text-white font-bold rounded-xl" onClick={() => setStatus("review")}>
          Return to Queue
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header (Moved Outside for Alignment) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Claims Verification</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Final review workspace to validate ownership proof against physical inventory records. Cross-reference student-provided identifiers to authorize or deny item handovers.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            PRIORITY: {selectedClaim.isHighValue ? "URGENT" : "STANDARD"}
          </span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Unsaved Changes Prompt (Modal Style) */}
        {pendingSelection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPendingSelection(null)} />
            <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 fill-mode-both">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">Unsaved Changes</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">You are currently reviewing a claim. Switching will discard your progress on this item. Hold your current view or proceed?</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 font-bold rounded-xl border-slate-200" onClick={() => setPendingSelection(null)}>Stay Here</Button>
                <Button className="h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-xl" onClick={confirmSwitch}>Switch Claim</Button>
              </div>
            </div>
          </div>
        )}

        {/* LEFT PANEL: Claims Navigation (Fixed width) */}
        <div className="w-full xl:w-[380px] xl:sticky xl:top-[1.5rem] flex flex-col gap-4">
          {/* Filters - Design Synced */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative group">
              <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
              <input 
                type="text"
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all shadow-inner"
              />
            </div>
            <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
              {["All", "Electronics", "Jewelry", "Accessories"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm",
                    categoryFilter === cat 
                      ? "bg-brand text-white border-brand shadow-brand/20" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 active:scale-95"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable List */}
          <div className="bg-white/50 rounded-3xl border border-slate-200 p-2 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar flex flex-col gap-2">
            {filteredClaims.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No matching claims found</div>
            ) : (
              filteredClaims.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => handleClaimSelect(claim.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all border group relative overflow-hidden",
                    selectedClaimId === claim.id
                      ? "bg-white border-brand shadow-md"
                      : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm"
                  )}
                >
                  {claim.isHighValue && (
                     <div className={cn(
                       "absolute top-0 left-0 bottom-0 w-1",
                       selectedClaimId === claim.id ? "bg-brand" : "bg-rose-500"
                     )} />
                  )}
                  
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate group-hover:text-brand transition-colors">
                      {claim.category} • {claim.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-mono">
                      {claim.timeAgo}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 tracking-tight truncate mb-0.5">{claim.item}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <User className="w-3 h-3" />
                    {claim.student}
                  </div>

                  {claim.isHighValue && (
                    <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-rose-600 uppercase tracking-widest">
                      <AlertCircle className="w-3 h-3" /> Priority Review
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Verification Workspace (Fluid) */}
        <div className="flex-1 w-full space-y-6">
          {status === "denying" && (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 space-y-6 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-rose-900 uppercase tracking-tight">Deny Claim Request</h3>
                  <p className="text-rose-700/70 text-sm font-medium">A reason for denial is mandatory and will be sent to the student.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-rose-900 uppercase tracking-wider">Reason for Denial</label>
                <textarea 
                  value={denyReason}
                  onChange={(e) => {
                    setDenyReason(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="e.g. The serial number provided does not match our records..."
                  className="w-full min-h-[120px] bg-white border border-rose-200 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 transition-all outline-none shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="h-12 border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl" onClick={() => {
                  setStatus("review")
                  setIsDirty(false)
                }}>Cancel</Button>
                <Button 
                  className="h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-xs disabled:opacity-50 rounded-xl"
                  disabled={!denyReason.trim()}
                  onClick={() => {
                    setStatus("success")
                    setIsDirty(false)
                  }}
                >
                  Confirm Denial
                </Button>
              </div>
            </div>
          )}

          {/* Main Verification Grid */}
          <div className={cn(
            "grid grid-cols-1 xl:grid-cols-2 gap-px bg-slate-200 rounded-3xl overflow-hidden shadow-sm border border-slate-200 transition-all",
            status === "denying" && "opacity-40 grayscale pointer-events-none scale-[0.99]"
          )}>
            {/* System Record */}
            <div className="bg-white p-8 xl:p-12 space-y-10">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                 <div className="w-10 h-10 bg-brand/5 border border-brand/10 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-brand" />
                 </div>
                 <div>
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">System Record</h3>
                    <p className="text-xs font-semibold text-slate-400 font-mono leading-none mt-1">Found Item: {selectedClaim.item}</p>
                 </div>
              </div>

              <div className="space-y-8">
                <VerifiedField label="External Condition" value={selectedClaim.physicalDetails.condition} />
                <VerifiedField label="Location/Storage" value={selectedClaim.physicalDetails.storage} />
                
                <div className="space-y-4 pt-4">
                  <div className="text-[10px] font-bold text-brand uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Admin Private Data
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                     <AdminOnlyField label="Serial Number" value={selectedClaim.physicalDetails.serialNumber} />
                     <AdminOnlyField label="Lock Screen Wallpaper" value={selectedClaim.physicalDetails.wallpaper} />
                  </div>
                </div>
              </div>
            </div>

            {/* Student Proof Comparison */}
            <div className="bg-slate-50/50 p-8 xl:p-12 space-y-10 relative">
              <div className="flex items-center gap-4 pb-6 border-b border-brand/10">
                 <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <h3 className="text-sm font-extrabold text-brand uppercase tracking-widest">Student Submission</h3>
                    <p className="text-xs font-semibold text-brand/60 leading-none mt-1">{selectedClaim.student} ({selectedClaim.studentId})</p>
                 </div>
              </div>

              <div className="space-y-8">
                <SubmissionField 
                  label="Distinguishing Marks" 
                  value={selectedClaim.studentProof.marks} 
                  isMatch 
                />

                <div className="space-y-4 pt-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Matching</div>
                  <div className="grid grid-cols-1 gap-6">
                    <SubmissionField 
                      label="Claimed Serial" 
                      value={selectedClaim.studentProof.serialNumber} 
                      isRevealed={revealSerial}
                      onReveal={() => setRevealSerial(true)}
                      isMatch={selectedClaim.studentProof.serialNumber === selectedClaim.physicalDetails.serialNumber}
                    />
                    <SubmissionField 
                      label="Claimed Wallpaper" 
                      value={selectedClaim.studentProof.wallpaper} 
                      isRevealed={revealWallpaper}
                      onReveal={() => setRevealWallpaper(true)}
                      isMatch={selectedClaim.studentProof.wallpaper === selectedClaim.physicalDetails.wallpaper}
                    />
                  </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-brand/10 shadow-sm space-y-3">
                   <h5 className="text-[10px] font-bold text-brand/60 uppercase tracking-widest flex items-center gap-2 font-mono">
                     <AlertCircle className="w-3 h-3" /> Student Private Note
                   </h5>
                   <p className="text-sm text-slate-600 font-medium leading-relaxed border-l-2 border-brand/20 pl-4">
                     "{selectedClaim.studentProof.privateNote}"
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="bg-white p-6 md:px-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 group cursor-help">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-brand/5 group-hover:border-brand/20 group-hover:text-brand transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-[15px]">Manual Review Required</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-brand/5 text-brand border border-brand/10 rounded-full font-bold uppercase font-mono tracking-tighter shadow-sm">Pending Auth</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ensure student ID matches official records before approval.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none h-12 px-8 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-widest text-xs rounded-xl" onClick={() => setIsDirty(true)}>
                Inquiry Request
              </Button>
              <Button 
                onClick={() => setStatus("denying")}
                variant="outline" 
                className="flex-1 md:flex-none h-12 px-8 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold uppercase tracking-widest text-xs rounded-xl"
              >
                Deny Claim
              </Button>
              <Button 
                onClick={() => {
                  setStatus("success")
                  setIsDirty(false)
                }}
                className="flex-1 md:flex-none h-12 px-10 bg-brand hover:bg-brand-active text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all active:scale-95 shadow-sm"
              >
                Approve Claim <ArrowRight className="w-4 h-4 ml-2 text-white/50" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VerifiedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="group/field border-l-2 border-brand/5 pl-4 hover:border-brand/30 transition-colors">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none transition-colors">{label}</div>
      <div className="text-[15px] font-bold text-slate-800 tracking-tight">{value}</div>
    </div>
  )
}

function AdminOnlyField({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl group/field transition-all hover:bg-white hover:border-brand/20 hover:shadow-sm">
      <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1 font-mono">{label}</div>
      <div className="text-sm font-bold text-slate-700 font-mono tracking-tight">{value}</div>
    </div>
  )
}

function SubmissionField({ label, value, isRevealed = true, onReveal, isMatch }: { 
  label: string; 
  value: string; 
  isRevealed?: boolean; 
  onReveal?: () => void;
  isMatch?: boolean;
}) {
  return (
    <div className="group/field">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none transition-colors">{label}</div>
        {isMatch && isRevealed && (
          <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono uppercase shadow-sm">
            <CheckCircle2 className="w-2.5 h-2.5" /> Direct Match
          </span>
        )}
      </div>
      
      {!isRevealed ? (
        <div className="h-12 bg-slate-100 rounded-xl border border-slate-200 border-dashed flex items-center justify-center group/btn relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-200/50 backdrop-blur-sm group-hover/btn:backdrop-blur-none transition-all" />
          <Button 
            onClick={onReveal}
            size="sm" 
            variant="outline" 
            className="h-8 bg-white border-slate-300 text-[9px] font-bold tracking-widest rounded-lg px-4 uppercase shadow-sm relative z-10 transition-all hover:border-brand/40 hover:text-brand"
          >
            <Eye className="w-3 h-3 mr-1.5" /> Reveal Input
          </Button>
        </div>
      ) : (
        <div className={cn(
          "p-4 rounded-xl border transition-all text-[15px] font-extrabold tracking-tight shadow-sm",
          isMatch ? "bg-emerald-50/30 border-emerald-100 text-emerald-800" : "bg-white border-slate-200 text-slate-800"
        )}>
          {value}
        </div>
      )}
    </div>
  )
}
