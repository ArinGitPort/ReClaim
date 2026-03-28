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
    id: "u2",
    name: "Sarah Jenkins",
    studentId: "2021-100293",
    email: "sarah.j@university.edu",
    role: "STUDENT",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    id: "u3",
    name: "Mike Peterson",
    studentId: "2020-009281",
    email: "mike.p@university.edu",
    role: "STUDENT",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
  },
  {
    id: "u4",
    name: "Emily Chen",
    studentId: "2022-044212",
    email: "emily.c@university.edu",
    role: "STUDENT",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
  },
  {
    id: "u5",
    name: "Marcus Wright",
    studentId: "2019-001234",
    email: "marcus.w@university.edu",
    role: "STAFF",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
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
    image: "https://images.unsplash.com/photo-1602143307185-84487493375e?auto=format&fit=crop&q=80&w=400"
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
  },
  {
    id: "item5",
    code: "ITEM-005",
    title: "Sony WH-1000XM4",
    category: "Electronics",
    foundLocation: "Roof Deck Lounge",
    foundAtUtc: new Date(Date.now() - 950400000).toISOString(),
    description: "Black wireless noise-canceling headphones.",
    status: "EXPIRED",
    isHighValue: true,
    image: "https://images.unsplash.com/photo-1618366712214-8c0751893558?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "item6",
    code: "ITEM-006",
    title: "Mechanical Keyboard",
    category: "Electronics",
    foundLocation: "IT Computer Lab",
    foundAtUtc: new Date(Date.now() - 1209600000).toISOString(),
    description: "Keychron K2, brown switches.",
    status: "EXPIRED",
    isHighValue: true,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400"
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
  },
  {
    id: "cap3",
    imageUrl: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=400",
    aiPrediction: "Camera",
    confidence: 0.95,
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    status: "PENDING",
    suggestedLocation: "Engineering Quad"
  }
]
