import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  musicService,
  getMusics,
  getTopMusics,
  suggestMusic,
} from "../../services/musicService"
import api from "../../services/api"

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("Music Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getMusics", () => {
    it("retorna músicas com paginação", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: [
            { id: 1, title: "Música 1" },
            { id: 2, title: "Música 2" },
          ],
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 10,
            total: 15,
          },
        },
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await getMusics(1, 10, "desc", [3, 4])

      expect(api.get).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/musics\?page=1&per_page=10&sort_by=views&sort_direction=desc&exclude_ids=3,4/
        )
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe("getTopMusics", () => {
    it("retorna as top músicas", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: [
            { id: 1, title: "Top Música 1" },
            { id: 2, title: "Top Música 2" },
          ],
        },
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await getTopMusics(5)

      expect(api.get).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/musics\?per_page=5&sort_by=views&sort_direction=desc/
        )
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe("suggestMusic", () => {
    it("envia uma sugestão de música", async () => {
      const mockData = {
        title: "Nova Música",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        user_id: 1,
      }

      const mockResponse = {
        data: {
          status: "success",
          message: "Sugestão criada com sucesso",
        },
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await suggestMusic(mockData)

      expect(api.post).toHaveBeenCalledWith("/suggestions", mockData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe("musicService.getYoutubeVideoInfo", () => {
    it("obtém informações de um vídeo do YouTube", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: {
            titulo: "Vídeo de Teste",
            visualizacoes: 1000,
            likes: 100,
            youtube_id: "dQw4w9WgXcQ",
            thumb: "http://example.com/thumb.jpg",
          },
        },
        status: 200,
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await musicService.getYoutubeVideoInfo(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      )

      expect(api.post).toHaveBeenCalledWith("/youtube/info", {
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      })
      expect(result).toEqual(mockResponse.data)
    })

    it("lança erro quando a URL é inválida", async () => {
      await expect(
        musicService.getYoutubeVideoInfo("invalid-url")
      ).rejects.toThrow("URL do YouTube inválida")
    })
  })

  describe("musicService.createFromYoutubeUrl", () => {
    it("cria uma música a partir de uma URL do YouTube", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Música criada com sucesso",
          data: { id: 1, title: "Nova Música" },
        },
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await musicService.createFromYoutubeUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      )

      expect(api.post).toHaveBeenCalledWith("/musics", {
        youtube_id: "dQw4w9WgXcQ",
      })
      expect(result).toEqual(mockResponse.data)
    })
  })
})
