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

export const getMusics = async (
  page = 1,
  perPage = 10,
  sortDirection = "desc",
  excludeIds: number[] = []
) => {
  try {
    const response = await api.get<{
      status: string
      data: Music[]
      meta: any
    }>(
      `/musics?page=${page}&per_page=${perPage}&sort_by=views&sort_direction=${sortDirection}&exclude_ids=${excludeIds.join(
        ","
      )}`
    )
    return response.data
  } catch (error) {
    console.error("Error fetching musics:", error)
    throw error
  }
}

export const getTopMusics = async (limit = 5) => {
  try {
    const response = await api.get<{ status: string; data: Music[] }>(
      `/musics?per_page=${limit}&sort_by=views&sort_direction=desc`
    )
    return response.data
  } catch (error) {
    console.error("Error fetching top musics:", error)
    throw error
  }
}

export const suggestMusic = async (data: {
  title: string
  youtube_url: string
  user_id: number
}) => {
  try {
    const response = await api.post("/suggestions", data)
    return response.data
  } catch (error) {
    console.error("Error suggesting music:", error)
    throw error
  }
}
