export interface User {
  id: string
  name: string
  studentId?: string | null
  email: string
  role: "STUDENT" | "STAFF" | "ADMIN"
  avatar?: string
}

export interface FoundItem {
  id: string
  code: string
  title: string
  category: string
  foundLocation: string
  foundAtUtc: string
  description?: string
  status: "AVAILABLE" | "CLAIMED" | "PENDING_VERIFICATION" | "EXPIRED"
  isHighValue: boolean
  image?: string
}

export interface CapturedItem {
  id: string
  imageUrl: string
  aiPrediction: string
  confidence: number
  timestamp: string
  status: "PENDING" | "REVIEWED" | "PUBLISHED"
  suggestedLocation?: string
}

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "John Doe",
    studentId: "2023-0001",
    email: "john.doe@university.edu",
    role: "STUDENT",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
  },
  {
    id: "admin1",
    name: "Admin Staff",
    email: "admin@reclaim.edu",
    role: "ADMIN",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  }
]

export const MOCK_CATEGORIES = [
  "Electronics",
  "Wallets/IDs",
  "Keys",
  "Stationery",
  "Books",
  "Clothing",
  "Others"
]

export const MOCK_ITEMS: FoundItem[] = [
  {
    id: "item1",
    code: "ITEM-001",
    title: "iPhone 13 Pro",
    category: "Electronics",
    foundLocation: "Library - 2nd Floor",
    foundAtUtc: new Date(Date.now() - 86400000).toISOString(),
    description: "Midnight Blue color, cracked screen protector.",
    status: "AVAILABLE",
    isHighValue: true,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "item2",
    code: "ITEM-002",
    title: "Leather Wallet",
    category: "Wallets/IDs",
    foundLocation: "Student Center Cafeteria",
    foundAtUtc: new Date(Date.now() - 172800000).toISOString(),
    description: "Brown leather, contains a student ID for 'Jane Smith'.",
    status: "AVAILABLE",
    isHighValue: true,
    image: "https://images.unsplash.com/photo-1627123118496-e3dec0d4a4d0?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "item3",
    code: "ITEM-003",
    title: "Hydro Flask Water Bottle",
    category: "Others",
    foundLocation: "Gymnasium",
    foundAtUtc: new Date(Date.now() - 43200000).toISOString(),
    description: "White 32oz bottle with stickers.",
    status: "AVAILABLE",
    isHighValue: false,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "item4",
    code: "ITEM-004",
    title: "Calculus Textbook",
    category: "Books",
    foundLocation: "Room 302 - Engineering Bldg",
    foundAtUtc: new Date(Date.now() - 259200000).toISOString(),
    description: "Stewart Calculus 9th Edition.",
    status: "AVAILABLE",
    isHighValue: false,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"
  }
]

export const MOCK_CAPTURED_ITEMS: CapturedItem[] = [
  {
    id: "cap1",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=400",
    aiPrediction: "Laptop",
    confidence: 0.92,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "PENDING",
    suggestedLocation: "Library - 1st Floor"
  },
  {
    id: "cap2",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
    aiPrediction: "Watch",
    confidence: 0.88,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: "PENDING",
    suggestedLocation: "Gym Lobby"
  }
]
