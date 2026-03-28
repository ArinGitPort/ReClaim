import { ReportLostForm } from "@/features/reports/ReportLostForm"
import { Info, ShieldAlert } from "lucide-react"

export function ReportLostPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
<div className="flex-1 overflow-y-auto">
        <div className="max-w-400 mx-auto flex flex-col lg:flex-row gap-8 px-4 py-6 sm:p-8 pb-24">
          
          {/* Main Form Area */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-3xl">
              <ReportLostForm />
            </div>
          </div>

          {/* Sidebar Instructions / Tips */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                <Info className="w-4 h-4 text-brand" />
                Reporting Tips
              </h4>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <p>Provide specific details like <span className="font-semibold text-slate-900">serial numbers</span> or unique stickers.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <p>Describe what's <span className="font-semibold text-slate-900">inside</span> bags or wallets for faster verification.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <p>Don't worry about being vague on the <span className="font-semibold text-slate-900">time</span>—approximate is fine.</p>
                </li>
              </ul>
            </div>

            <div className="bg-brand/5 p-6 rounded-2xl border border-brand/10">
              <h4 className="flex items-center gap-2 font-bold text-brand mb-3">
                <ShieldAlert className="w-4 h-4" />
                Blind Verification
              </h4>
              <p className="text-xs text-brand/80 leading-relaxed">
                Your "Proof Identifiers" and "Private Notes" are <span className="font-bold">strictly hidden</span> from the public. Only campus administrators use this data to confirm your ownership.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}

