import api from "./api"
import { Music, PaginatedResponse } from "../types"

export const musicService = {
  getAll: async (page = 1, perPage = 10) => {
    const response = await api.get<PaginatedResponse<Music>>("/musics", {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  getTop5: async () => {
    const response = await api.get<Music[]>("/musics", {
      params: { per_page: 5, sort_by: "plays", sort_direction: "desc" },
    })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<Music>(`/musics/${id}`)
    return response.data
  },

  create: async (
    music: Omit<Music, "id" | "plays" | "created_at" | "updated_at">
  ) => {
    const response = await api.post<Music>("/musics", music)
    return response.data
  },

  update: async (
    id: number,
    music: Partial<Omit<Music, "id" | "plays" | "created_at" | "updated_at">>
  ) => {
    const response = await api.put<Music>(`/musics/${id}`, music)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/musics/${id}`)
  },
}
