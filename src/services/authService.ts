import api from "./api"
import { AuthResponse, LoginCredentials, RegisterData, User } from "../types"

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials)
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token)
        return { user: response.data.data, token: response.data.token }
      } else {
        throw new Error("Resposta de login inválida")
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        throw new Error("Email ou senha incorretos")
      }
      throw error
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data)
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token)
        return { user: response.data.data, token: response.data.token }
      } else {
        throw new Error("Resposta de registro inválida")
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {}

        if (errors.email?.includes("taken")) {
          throw new Error("Este email já está em uso")
        } else if (errors.password) {
          throw new Error("A senha não atende aos requisitos")
        }
      }
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      localStorage.removeItem("token")
    }
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
