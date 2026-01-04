// User types
export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: string
}

export interface AuthResponse {
  status: string
  message: string
  data: {
    user: User
    token: string
  }
}

// Project types
export interface Project {
  id: string
  name: string
  description: string | null
  color: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    email: string
    name: string | null
  }
  _count?: {
    tasks: number
    members: number
  }
  tasks?: Task[]
}

// Task types
export interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'DOING' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | null
  dueDate: string | null
  order: number
  projectId: string
  assigneeId: string | null
  creatorId: string
  createdAt: string
  updatedAt: string
  assignee?: User | null
  creator?: User
}

// API response types
export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

export interface ListResponse<T> {
  items: T[]
  total: number
}