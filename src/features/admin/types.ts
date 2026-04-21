export type ActiveModalState = "add" | "edit" | "pending" | "missing" | "history" | null;

export type UserDirUser = {
  id: string
  name: string
  email: string
  studentId: string | null
  role: string
  createdAt: string
  _count: { claims: number }
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
