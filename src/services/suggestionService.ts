import api from "./api"
import { Suggestion } from "../types"

interface SuggestionResponse {
  status: string
  data: {
    data: Suggestion[]
    meta: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
    links: {
      first: string
      last: string
      next: string | null
      prev: string | null
    }
  }
  is_admin: boolean
}

export const validateYoutubeUrl = (url: string): boolean => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(
    url
  )
}

export const extractYoutubeId = (url: string): string | null => {
  const match = url.match(
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[4] : null
}

export const suggestionService = {
  getAll: async (
    page = 1,
    perPage = 15,
    status?: string,
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    const params: Record<string, any> = {
      page,
      per_page: perPage,
      sort_direction: sortDirection,
      sort_by: "created_at",
    }

    if (status && status !== "all") {
      params.status = status
    }

    const response = await api.get<SuggestionResponse>("/suggestions", {
      params,
    })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<{ status: string; data: Suggestion }>(
      `/suggestions/${id}`
    )
    return response.data
  },

  create: async (url: string) => {
    if (!validateYoutubeUrl(url)) {
      throw new Error(
        "URL do YouTube inválida. Utilize um link no formato correto"
      )
    }

    try {
      const response = await api.post<{
        status: string
        message: string
        data: Suggestion
      }>("/suggestions", { url })
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  },

  delete: async (id: number) => {
    await api.delete(`/suggestions/${id}`)
  },

  updateStatus: async (
    id: number,
    status: "approved" | "rejected",
    motivo?: string
  ) => {
    try {
      const response = await api.post<{
        status: string
        message: string
        data: Suggestion
      }>(`/suggestions/${id}/status/${status}`, { motivo })
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  },

  getVideoInfo: async (youtubeUrl: string) => {
    if (!validateYoutubeUrl(youtubeUrl)) {
      throw new Error(
        "URL do YouTube inválida. Utilize um link no formato correto"
      )
    }

    try {
      const response = await api.post<{ status: string; data: any }>(
        "/youtube/info",
        { youtube_url: youtubeUrl }
      )
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.response?.status === 404) {
        throw new Error(
          "API não encontrada. Verifique a configuração do servidor."
        )
      }
      throw new Error("Erro ao obter informações do vídeo")
    }
  },

  validateYoutubeUrl,
  extractYoutubeId,
}
