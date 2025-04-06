import api from "./api"
import { Music, PaginatedResponse } from "../types"

function extractYoutubeId(url: string): string | null {
  if (!url) return null

  url = url.trim()

  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&|\?|$)/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|$)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?|$)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:\?|$)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?|$)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      if (match[1].length === 11) {
        return match[1]
      }
    }
  }

  const simpleIdMatch = url.match(/[a-zA-Z0-9_-]{11}/)
  if (simpleIdMatch && simpleIdMatch[0]) {
    console.log("Extração de ID usando método alternativo:", simpleIdMatch[0])
    return simpleIdMatch[0]
  }

  return null
}

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
    music: Omit<
      Music,
      | "id"
      | "likes"
      | "views_formatted"
      | "likes_formatted"
      | "created_at"
      | "updated_at"
    >
  ) => {
    const response = await api.post<Music>("/musics", music)
    return response.data
  },

  createFromYoutubeUrl: async (youtubeUrl: string) => {
    const youtubeId = extractYoutubeId(youtubeUrl)
    if (!youtubeId) {
      throw new Error("URL do YouTube inválida")
    }

    console.log("Enviando ID do YouTube para API:", youtubeId)

    try {
      const response = await api.post<{
        status: string
        message: string
        data: Music
      }>("/musics", { youtube_id: youtubeId })

      console.log("Resposta da API:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Erro ao criar música a partir da URL do YouTube:", error)

      if (error.response) {
        console.error("Resposta de erro:", {
          status: error.response.status,
          data: error.response.data,
        })
      }

      throw error
    }
  },

  update: async (
    id: number,
    music: Partial<
      Omit<
        Music,
        | "id"
        | "views_formatted"
        | "likes_formatted"
        | "created_at"
        | "updated_at"
      >
    >
  ) => {
    const response = await api.put<{
      status: string
      message: string
      data: Music
    }>(`/musics/${id}`, music)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<{ status: string; message: string }>(
      `/musics/${id}`
    )
    return response.data
  },

  getYoutubeVideoInfo: async (youtubeUrl: string) => {
    const response = await api.post<{
      status: string
      data: {
        titulo: string
        visualizacoes: number
        youtube_id: string
        thumb: string
      }
    }>("/youtube/info", { youtube_url: youtubeUrl })

    return response.data
  },

  extractYoutubeId,
}

export const getMusics = async (
  page = 1,
  perPage = 10,
  sortDirection = "desc",
  excludeIds: number[] = []
) => {
  try {
    const timestamp = new Date().getTime()

    const response = await api.get<{
      status: string
      data: Music[]
      meta: any
    }>(
      `/musics?page=${page}&per_page=${perPage}&sort_by=views&sort_direction=${sortDirection}&exclude_ids=${excludeIds.join(
        ","
      )}&_t=${timestamp}`
    )
    return response.data
  } catch (error) {
    console.error("Error fetching musics:", error)
    throw error
  }
}

export const getTopMusics = async (limit = 5) => {
  try {
    const timestamp = new Date().getTime()

    const response = await api.get<{ status: string; data: Music[] }>(
      `/musics?per_page=${limit}&sort_by=views&sort_direction=desc&_t=${timestamp}`
    )
    return response.data
  } catch (error) {
    console.error("Error fetching top musics:", error)
    throw error
  }
}

export const suggestMusic = async (data: {
  title: string
  url: string
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
