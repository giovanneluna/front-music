import { describe, it, expect } from "vitest"
import { suggestionService } from "../../services/suggestionService"

describe("suggestionService", () => {
  describe("extractYoutubeId", () => {
    it("should extract YouTube ID from a valid URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      const result = suggestionService.extractYoutubeId(url)
      expect(result).toBe("dQw4w9WgXcQ")
    })

    it("should return null for invalid YouTube URL", () => {
      const url = "https://example.com"
      const result = suggestionService.extractYoutubeId(url)
      expect(result).toBeNull()
    })
  })
})
