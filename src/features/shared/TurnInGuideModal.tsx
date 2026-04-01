import { Modal } from '@/components/ui/Modal';
import { Building, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { CampusOfficeMap } from '@/components/ui/CampusOfficeMap';

interface TurnInGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TurnInGuideModal({ isOpen, onClose }: TurnInGuideModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl bg-white">
      <div className="p-8 sm:p-10">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            Thanks for being honest!
          </h2>
          <p className="text-lg text-slate-500">
            Here is what to do next to return the found item.
          </p>
        </div>

        {/* 1-2-3 Steps */}
        <div className="space-y-6 mb-10 px-2 sm:px-6">
          <div className="flex items-start gap-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-800 shrink-0">1</div>
            <div className="pt-1.5">
              <h3 className="font-semibold text-slate-900 text-lg leading-none">Bring it to the ITSO</h3>
              <p className="text-slate-500 text-sm mt-2">Visit the ITSO Admin Office with the item.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-800 shrink-0">2</div>
            <div className="pt-1.5">
              <h3 className="font-semibold text-slate-900 text-lg leading-none">Hand it over</h3>
              <p className="text-slate-500 text-sm mt-2">Give it to the staff at the front desk and tell them you found it.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 shrink-0">3</div>
            <div className="pt-1.5">
              <h3 className="font-semibold text-slate-900 text-lg leading-none">We take care of the rest</h3>
              <p className="text-slate-600 text-sm mt-2">We will log it into our database and try to find the owner!</p>
            </div>
          </div>
        </div>

        {/* The Map */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 h-56 shadow-sm relative w-full">
          <CampusOfficeMap />
        </div>

        {/* Office Details Card */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-100/80 rounded-xl shrink-0">
              <Building className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-base">ITSO Admin Office</p>
              <p className="text-slate-500 text-sm mt-0.5">Main Building, Room 101</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-amber-100/80 rounded-xl shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-base">Office Hours</p>
              <p className="text-slate-500 text-sm mt-0.5">Mon - Fri, 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button 
            onClick={onClose} 
            className="flex items-center justify-center gap-2 bg-[#2539A9] hover:bg-navy text-white font-medium rounded-lg px-8 py-3 transition-colors shadow-sm"
          >
            Got it! <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
