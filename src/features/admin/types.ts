export type ActiveModalState = "add" | "edit" | "pending" | "missing" | "history" | null;

export type UserDirUser = {
  id: string
  name: string
  email: string
  studentId: string | null
  role: string
  status: string
  passwordResetRequired: boolean
  lastLoginAt?: string | null
  disabledAt?: string | null
  disabledReason?: string | null
  createdAt: string
  _count: {
    claims: number
    reports?: number
    handovers?: number
  }
  metrics?: {
    pendingClaims: number
    activeReports: number
    returnedItems: number
    activeClaims: number
  }
}

export type UserDirectoryDetails = {
  id: string
  name: string
  email: string
  studentId: string | null
  role: string
  status: string
  passwordResetRequired: boolean
  lastLoginAt?: string | null
  disabledAt?: string | null
  disabledReason?: string | null
  createdAt: string
  claims: Array<{
    id: string
    claimCode: string
    status: string
    createdAt: string
    reviewerNote?: string | null
    foundItem: {
      id: string
      code: string
      title: string
      category: string
      foundLocation: string
      status: string
    }
  }>
  reports: Array<{
    id: string
    reportCode: string
    title: string
    category: string
    location: string
    status: string
    createdAt: string
  }>
  handovers: Array<{
    id: string
    releasedAtUtc: string
    pickupTokenPresented: string
    note?: string | null
    foundItem: {
      id: string
      code: string
      title: string
      category: string
      status: string
    }
  }>
  auditLogs: Array<{
    id: string
    action: string
    targetType: string
    targetId: string
    description?: string | null
    createdAt: string
    actorUser: {
      id: string
      name: string
      role: string
    }
  }>
}

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDirUser | null;
  onSaved?: () => void;
}

export type CreateManagedUserPayload = {
  name: string;
  email: string;
  studentId?: string;
  password: string;
  role: "STUDENT" | "STAFF" | "ADMIN";
};

export type UpdateManagedUserPayload = {
  name?: string;
  email?: string;
  studentId?: string | null;
  role?: "STUDENT" | "STAFF" | "ADMIN";
};
