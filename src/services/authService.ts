import api from "./api"
import { AuthResponse, LoginCredentials, RegisterData, User } from "../types"

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>("/auth/login", credentials)
    localStorage.setItem("token", response.data.token)
    return response.data
  },

  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>("/auth/register", data)
    localStorage.setItem("token", response.data.token)
    return response.data
  },

  logout: async () => {
    await api.post("/auth/logout")
    localStorage.removeItem("token")
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get<User>("/auth/user")
      return response.data
    } catch (error) {
      localStorage.removeItem("token")
      throw error
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token")
  },
}
