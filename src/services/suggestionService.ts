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

export const suggestionService = {
  getAll: async (page = 1, perPage = 10, status?: string) => {
    const params: Record<string, any> = { page, per_page: perPage }

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
    const response = await api.post<{
      status: string
      message: string
      data: Suggestion
    }>("/suggestions", { url })
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/suggestions/${id}`)
  },

  updateStatus: async (
    id: number,
    status: "approved" | "rejected",
    motivo?: string
  ) => {
    const response = await api.post<{
      status: string
      message: string
      data: Suggestion
    }>(`/suggestions/${id}/status/${status}`, { motivo })
    return response.data
  },

  getVideoInfo: async (youtubeUrl: string) => {
    const response = await api.post<{ status: string; data: any }>(
      "/youtube/info",
      { youtube_url: youtubeUrl }
    )
    return response.data
  },
}
