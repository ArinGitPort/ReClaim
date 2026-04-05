export type ActiveModalState = "edit" | "pending" | "missing" | "history" | null;

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
}
