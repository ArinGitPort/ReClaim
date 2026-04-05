import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import type { UserModalProps } from "@/features/admin/types"

export function EditProfileModal({ isOpen, onClose, user }: UserModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl flex flex-col max-h-[90vh]">
       <div className="p-6 border-b border-slate-200 bg-white shrink-0 shadow-sm z-10 text-left">
          <h3 className="font-extrabold text-xl text-slate-900">Manage Profile</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Update account records and security protocols for this user.</p>
       </div>

       <div className="p-6 space-y-8 overflow-y-auto text-left">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Full Name</Label>
              <Input defaultValue={user.name} className="border-slate-200 rounded-md focus:ring-2 focus:ring-slate-400 font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Email Address</Label>
              <Input defaultValue={user.email} type="email" className="border-slate-200 rounded-md focus:ring-2 focus:ring-slate-400 font-medium" />
            </div>
            <div className="space-y-2">
               <Label className="text-sm font-medium text-slate-700">Global Role</Label>
               <Select defaultValue={user.role} className="w-full border-slate-200 rounded-md focus:ring-2 focus:ring-slate-400 font-medium h-10">
                 <option value="STUDENT">Student</option>
                 <option value="STAFF">Staff</option>
                 <option value="ADMIN">Administrator</option>
               </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Student ID</Label>
              <Input defaultValue={user.studentId || ""} placeholder="No ID Linked" className="border-slate-200 rounded-md focus:ring-2 focus:ring-slate-400 font-medium" />
            </div>
         </div>

         <div>
           <h4 className="text-sm font-semibold text-red-600 mb-3 uppercase tracking-wider">Danger Zone</h4>
           <div className="border border-red-200 rounded-md bg-white flex flex-col text-left">
             <div className="p-4 flex items-center justify-between border-b border-red-100">
               <div>
                 <div className="font-bold text-sm text-slate-800">Forced Password Reset</div>
                 <div className="text-xs text-slate-500 font-medium mt-0.5">Send an immediate password recovery link.</div>
               </div>
               <Button variant="outline" className="text-slate-700 border-slate-200 hover:bg-slate-50 h-9 font-bold text-xs shrink-0 ml-4 rounded-md">
                 Send Link
               </Button>
             </div>
             
             <div className="p-4 flex items-center justify-between">
               <div>
                 <div className="font-bold text-sm text-slate-800">Suspend Account Access</div>
                 <div className="text-xs text-slate-500 font-medium mt-0.5">Disables login and system matching.</div>
               </div>
               <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-9 text-xs shrink-0 ml-4 rounded-md border-none">
                 Suspend
               </Button>
             </div>
           </div>
         </div>
       </div>

       <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0 rounded-b-xl mt-auto">
          <Button onClick={onClose} variant="ghost" className="text-slate-700 font-bold rounded-md hover:bg-slate-200 h-10">
             Cancel
          </Button>
          <Button className="bg-brand hover:bg-brand-active text-white font-bold rounded-md h-10">
            Save Changes
          </Button>
       </div>
    </Modal>
  )
}
