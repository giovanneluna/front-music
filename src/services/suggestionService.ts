import api from "./api"
import { Suggestion, PaginatedResponse } from "../types"

export const suggestionService = {
  getAll: async (page = 1, perPage = 10) => {
    const response = await api.get<PaginatedResponse<Suggestion>>(
      "/suggestions",
      {
        params: { page, per_page: perPage },
      }
    )
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<Suggestion>(`/suggestions/${id}`)
    return response.data
  },

  create: async (
    suggestion: Omit<
      Suggestion,
      "id" | "user_id" | "status" | "created_at" | "updated_at"
    >
  ) => {
    const response = await api.post<Suggestion>("/suggestions", suggestion)
    return response.data
  },

  update: async (
    id: number,
    suggestion: Partial<
      Omit<
        Suggestion,
        "id" | "user_id" | "status" | "created_at" | "updated_at"
      >
    >
  ) => {
    const response = await api.put<Suggestion>(`/suggestions/${id}`, suggestion)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/suggestions/${id}`)
  },

  updateStatus: async (id: number, status: "approved" | "rejected") => {
    const response = await api.post<Suggestion>(
      `/suggestions/${id}/status/${status}`
    )
    return response.data
  },
}
