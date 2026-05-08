import { type FormEvent, useEffect, useState } from "react"
import { AxiosError } from "axios"
import { UserCog, Shield } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { api } from "@/lib/api"
import type { UpdateManagedUserPayload, UserModalProps } from "@/features/admin/types"
import { ModalHeader } from "@/components/ui/ModalHeader"

type UserRoleOption = "STUDENT" | "STAFF" | "ADMIN"

export function EditProfileModal({ isOpen, onClose, onSaved, user }: UserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [studentId, setStudentId] = useState("")
  const [role, setRole] = useState<UserRoleOption>("STUDENT")

  useEffect(() => {
    if (!isOpen || !user) {
      return
    }

    setName(user.name)
    setEmail(user.email)
    setStudentId(user.studentId ?? "")
    setRole((user.role as UserRoleOption) || "STUDENT")
    setError(null)
    setIsSubmitting(false)
  }, [isOpen, user])

  if (!user) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload: UpdateManagedUserPayload = {
      name: name.trim(),
      email: email.trim(),
      studentId: studentId.trim() || null,
      role,
    }

    try {
      await api.patch(`/user/${user.id}`, payload)
      onSaved?.()
      onClose()
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { error?: string } | undefined)?.error
          : undefined
      setError(message ?? "Failed to update account profile.")
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl flex flex-col max-h-[90vh]">
      <ModalHeader
        title="Manage Profile"
        icon={<UserCog className="w-5 h-5 text-white" />}
        onClose={onClose}
      />

      <form id="edit-user-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <UserCog className="w-3.5 h-3.5 text-brand" />
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Account Identity</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-name" className="text-xs uppercase tracking-wider font-bold text-slate-500">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs uppercase tracking-wider font-bold text-slate-500">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-student-id" className="text-xs uppercase tracking-wider font-bold text-slate-500">Student ID</Label>
              <Input
                id="edit-student-id"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="No ID Linked"
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Shield className="w-3.5 h-3.5 text-brand" />
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Permissions</h4>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-role" className="text-xs uppercase tracking-wider font-bold text-slate-500">Global Role</Label>
            <Select
              id="edit-role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRoleOption)}
              className="h-11 bg-slate-50/50 border-slate-200 shadow-sm"
              required
            >
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </Select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Security Actions</p>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Password reset and suspend controls are excluded from this current delivery scope.
            </p>
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      </form>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-12 border-slate-200 font-bold uppercase tracking-widest text-xs"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-user-form"
          className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold rounded-xl uppercase tracking-widest text-xs"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Modal>
  )
}
