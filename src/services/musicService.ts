import api from "./api"
import { Music } from "../types"
import { validateYoutubeUrl, extractYoutubeId } from "./suggestionService"

interface PaginatedResponse<T> {
  status: string
  data: {
    data: T[]
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
      "id" | "views_formatted" | "likes_formatted" | "created_at" | "updated_at"
    >
  ) => {
    const response = await api.post<Music>("/musics", music)
    return response.data
  },

  createFromYoutubeUrl: async (youtubeUrl: string) => {
    if (!validateYoutubeUrl(youtubeUrl)) {
      throw new Error("URL do YouTube inválida")
    }

    const youtubeId = extractYoutubeId(youtubeUrl)
    if (!youtubeId) {
      throw new Error("URL do YouTube inválida")
    }

    try {
      const response = await api.post<{
        status: string
        message: string
        data: Music
      }>("/musics", { youtube_id: youtubeId })

      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.response?.data?.errors?.youtube_id) {
        throw new Error(error.response.data.errors.youtube_id[0])
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
    if (!validateYoutubeUrl(youtubeUrl)) {
      throw new Error("URL do YouTube inválida")
    }

    try {
      const response = await api.post<{
        status: string
        data: {
          titulo: string
          visualizacoes: number
          likes: number
          youtube_id: string
          thumb: string
        }
      }>("/youtube/info", { youtube_url: youtubeUrl })

      if (
        response.status !== 200 ||
        !response.data ||
        response.data.status === "error"
      ) {
        throw new Error("Erro ao obter informações do vídeo")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          "API não encontrada. Verifique a configuração do servidor."
        )
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else {
        throw new Error("Erro ao obter informações do vídeo do YouTube.")
      }
    }
  },
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
    throw error
  }
}
