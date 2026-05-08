import { type FormEvent, useEffect, useState } from "react"
import { AxiosError } from "axios"
import { Plus, UserPlus, Shield } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Label } from "@/components/ui/Label"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { api } from "@/lib/api"
import type { CreateManagedUserPayload } from "@/features/admin/types"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

type UserRoleOption = "STUDENT" | "STAFF" | "ADMIN"

export function AddUserModal({ isOpen, onClose, onSaved }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRoleOption>("STUDENT")

  const resetForm = () => {
    setName("")
    setEmail("")
    setStudentId("")
    setPassword("")
    setConfirmPassword("")
    setRole("STUDENT")
    setError(null)
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.")
      return
    }

    setIsSubmitting(true)

    const payload: CreateManagedUserPayload = {
      name: name.trim(),
      email: email.trim(),
      studentId: studentId.trim() || undefined,
      password,
      role,
    }

    try {
      await api.post("/user", payload)
      onSaved?.()
      onClose()
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { error?: string } | undefined)?.error
          : undefined
      setError(message ?? "Failed to create user account. Please check the form and try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl flex flex-col max-h-[90vh]">
      <ModalHeader
        title="Add User Account"
        icon={<Plus className="w-5 h-5 text-white" />}
        onClose={onClose}
      />

      <form id="add-user-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <UserPlus className="w-3.5 h-3.5 text-brand" />
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Identity Details</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="managed-name" className="text-xs uppercase tracking-wider font-bold text-slate-500">Full Name</Label>
              <Input
                id="managed-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                required
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="managed-email" className="text-xs uppercase tracking-wider font-bold text-slate-500">Email Address</Label>
              <Input
                id="managed-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@campus.edu"
                required
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="managed-student-id" className="text-xs uppercase tracking-wider font-bold text-slate-500">Student ID (Optional)</Label>
              <Input
                id="managed-student-id"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="2020-123456"
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Shield className="w-3.5 h-3.5 text-brand" />
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Access Controls</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="managed-role" className="text-xs uppercase tracking-wider font-bold text-slate-500">Role</Label>
              <Select
                id="managed-role"
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

            <div className="space-y-1.5">
              <Label htmlFor="managed-password" className="text-xs uppercase tracking-wider font-bold text-slate-500">Temporary Password</Label>
              <Input
                id="managed-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="managed-confirm-password" className="text-xs uppercase tracking-wider font-bold text-slate-500">Confirm Password</Label>
              <Input
                id="managed-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>
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
          form="add-user-form"
          className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold rounded-xl uppercase tracking-widest text-xs"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
      </div>
    </Modal>
  )
}
