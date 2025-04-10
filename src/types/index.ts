export interface Music {
  id: number
  title: string
  youtube_id: string
  views: number
  views_formatted: string
  likes?: number
  likes_formatted?: string
  thumbnail: string
  created_at: string
  updated_at?: string
}

export interface Suggestion {
  id: number
  user_id: number
  user?: {
    id: number
    name: string
    email: string
  }
  title: string
  youtube_id: string
  link: string
  status: "pending" | "approved" | "rejected"
  reason?: string
  music_id?: number
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface AuthResponse {
  status: string
  message: string
  data: User
  token: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}
