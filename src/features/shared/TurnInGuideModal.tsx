import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Clock, Building, CheckCircle2, ArrowRight } from 'lucide-react';
import { CampusOfficeMap } from '@/components/ui/CampusOfficeMap';

interface TurnInGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TurnInGuideModal({ isOpen, onClose }: TurnInGuideModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-status-success" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Thanks for being honest!
          </h2>
          <p className="text-lg text-slate-500">
            Here is what to do next to return the found item.
          </p>
        </div>

        {/* 1-2-3 Steps */}
        <div className="space-y-5 mb-8">
          <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-900 shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-slate-900">Bring it to the ITSO</h3>
              <p className="text-slate-500 text-sm mt-1">Visit the ITSO Admin Office with the item.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-900 shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-slate-900">Hand it over</h3>
              <p className="text-slate-500 text-sm mt-1">Give it to the staff at the front desk and tell them you found it.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-status-success/5 border border-status-success/20">
            <div className="w-8 h-8 rounded-full bg-status-success/20 flex items-center justify-center font-bold text-status-success shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-slate-900">We take care of the rest</h3>
              <p className="text-slate-600 text-sm mt-1">We will log it into our database and try to find the owner!</p>
            </div>
          </div>
        </div>

        {/* The Map (CRITICAL component requested) */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 h-64 shadow-sm">
          <CampusOfficeMap />
        </div>

        {/* Office Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Building className="w-6 h-6 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">ITSO Admin Office</p>
              <p className="text-sm text-slate-500">Main Building, Room 101</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Office Hours</p>
              <p className="text-sm text-slate-500">Mon - Fri, 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button 
            onClick={onClose} 
            className="w-full sm:w-auto bg-brand hover:bg-navy text-white rounded-lg px-8 shadow-md"
          >
            Got it! <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
