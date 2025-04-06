import api from "./api"
import { AuthResponse, LoginCredentials, RegisterData, User } from "../types"

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>("/auth/login", credentials)
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token)
      return { user: response.data.data, token: response.data.token }
    } else {
      throw new Error("Resposta de login inválida")
    }
  },

  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>("/auth/register", data)
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token)
      return { user: response.data.data, token: response.data.token }
    } else {
      throw new Error("Resposta de registro inválida")
    }
  },

  logout: async () => {
    await api.post("/auth/logout")
    localStorage.removeItem("token")
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get<{ status: string; data: User }>(
        "/auth/user"
      )

      if (response.data && response.data.status === "success") {
        return response.data.data
      } else {
        throw new Error("Falha ao obter dados do usuário")
      }
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error)
      localStorage.removeItem("token")
      throw error
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token")
  },
}
