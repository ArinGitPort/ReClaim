import { type FormEvent, useEffect, useMemo, useState } from "react"
import { AxiosError } from "axios"
import { Clipboard, KeyRound, Shield, UserCheck, UserCog, UserX } from "lucide-react"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { api } from "@/lib/api"
import type { UpdateManagedUserPayload, UserModalProps } from "@/features/admin/types"
import { ModalHeader } from "@/components/ui/ModalHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"

type UserRoleOption = "STUDENT" | "STAFF" | "ADMIN"
type AccountStatus = "ACTIVE" | "DISABLED" | "SUSPENDED"

export function EditProfileModal({ isOpen, onClose, onSaved, user }: UserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [studentId, setStudentId] = useState("")
  const [role, setRole] = useState<UserRoleOption>("STUDENT")
  const [accountStatus, setAccountStatus] = useState<AccountStatus>("ACTIVE")
  const [passwordResetRequired, setPasswordResetRequired] = useState(false)
  const [disabledReason, setDisabledReason] = useState<string | null>(null)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<AccountStatus | null>(null)
  const [confirmRoleChange, setConfirmRoleChange] = useState(false)

  useEffect(() => {
    if (!isOpen || !user) {
      return
    }

    setName(user.name)
    setEmail(user.email)
    setStudentId(user.studentId ?? "")
    setRole((user.role as UserRoleOption) || "STUDENT")
    setAccountStatus((user.status as AccountStatus) || "ACTIVE")
    setPasswordResetRequired(Boolean(user.passwordResetRequired))
    setDisabledReason(user.disabledReason ?? null)
    setTemporaryPassword(null)
    setPendingStatus(null)
    setConfirmRoleChange(false)
    setError(null)
    setIsSubmitting(false)
    setSecurityLoading(false)
  }, [isOpen, user])

  const statusCopy = useMemo(() => {
    if (accountStatus === "ACTIVE") {
      return "Account can sign in and use the portal based on the assigned role."
    }

    return accountStatus === "SUSPENDED"
      ? "Account sign-in is blocked while staff review this user."
      : "Account sign-in is disabled until an administrator enables it again."
  }, [accountStatus])

  if (!user) return null

  const saveProfile = async () => {
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
      setConfirmRoleChange(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (role !== user.role) {
      setConfirmRoleChange(true)
      return
    }

    void saveProfile()
  }

  const handleStatusChange = async (status: AccountStatus) => {
    setSecurityLoading(true)
    setError(null)

    try {
      const reason =
        status === "SUSPENDED"
          ? "Suspended by administrator from the user directory"
          : status === "DISABLED"
            ? "Disabled by administrator from the user directory"
            : undefined

      const res = await api.patch(`/user/${user.id}/status`, { status, reason })
      const updatedUser = res.data.user as { status: AccountStatus; disabledReason?: string | null }
      setAccountStatus(updatedUser.status)
      setDisabledReason(updatedUser.disabledReason ?? null)
      setPendingStatus(null)
      onSaved?.()
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { error?: string } | undefined)?.error
          : undefined
      setError(message ?? "Failed to update account status.")
    } finally {
      setSecurityLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setSecurityLoading(true)
    setError(null)

    try {
      const res = await api.post(`/user/${user.id}/password-reset`, {})
      setTemporaryPassword(res.data.temporaryPassword)
      setPasswordResetRequired(true)
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { error?: string } | undefined)?.error
          : undefined
      setError(message ?? "Failed to reset password.")
    } finally {
      setSecurityLoading(false)
    }
  }

  const copyTemporaryPassword = async () => {
    if (!temporaryPassword) return
    await navigator.clipboard?.writeText(temporaryPassword)
  }

  const pendingStatusLabel = pendingStatus === "ACTIVE" ? "enable" : pendingStatus?.toLowerCase()

  return (
    <>
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

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Account Status</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={accountStatus} />
                    {passwordResetRequired && <StatusBadge status="PASSWORD_RESET_REQUIRED" />}
                  </div>
                  <p className="text-sm text-slate-600 font-medium mt-2">{statusCopy}</p>
                  {disabledReason && (
                    <p className="text-xs text-slate-500 font-semibold mt-2">Reason: {disabledReason}</p>
                  )}
                </div>
              </div>

              {temporaryPassword && (
                <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand">Temporary Password</p>
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <code className="flex-1 rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm font-bold text-slate-800">
                      {temporaryPassword}
                    </code>
                    <Button type="button" variant="outline" onClick={copyTemporaryPassword} className="h-10 border-brand/20 text-brand font-bold">
                      <Clipboard className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasswordReset}
                  disabled={securityLoading}
                  className="h-11 border-slate-200 bg-white text-slate-700 font-bold"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
                {accountStatus === "ACTIVE" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPendingStatus("SUSPENDED")}
                      disabled={securityLoading}
                      className="h-11 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Suspend
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPendingStatus("DISABLED")}
                      disabled={securityLoading}
                      className="h-11 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Disable
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setPendingStatus("ACTIVE")}
                    disabled={securityLoading}
                    className="sm:col-span-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Enable Account
                  </Button>
                )}
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
            disabled={isSubmitting || securityLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-user-form"
            className="flex-1 h-12 bg-brand hover:bg-brand-active text-white font-bold rounded-xl uppercase tracking-widest text-xs"
            disabled={isSubmitting || securityLoading}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmRoleChange}
        onClose={() => setConfirmRoleChange(false)}
        onConfirm={() => void saveProfile()}
        title="Change Role"
        message={`This will change ${user.name}'s access from ${user.role} to ${role}. Continue?`}
        confirmText="Yes, Change Role"
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={() => pendingStatus && void handleStatusChange(pendingStatus)}
        title={pendingStatus === "ACTIVE" ? "Enable Account" : `${pendingStatusLabel} Account`}
        message={
          pendingStatus === "ACTIVE"
            ? `${user.name} will be able to sign in again.`
            : `${user.name} will be blocked from signing in until an administrator enables the account.`
        }
        confirmText={pendingStatus === "ACTIVE" ? "Yes, Enable" : `Yes, ${pendingStatusLabel}`}
        isDestructive={pendingStatus !== "ACTIVE"}
        isLoading={securityLoading}
        confirmButtonClassName={pendingStatus === "ACTIVE" ? "bg-emerald-600 hover:bg-emerald-700" : undefined}
      />
    </>
  )
}
