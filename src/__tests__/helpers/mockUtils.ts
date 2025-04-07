import { Music } from "../../types"

export const createMockMusic = (
  id: number,
  title: string,
  views: number,
  likes: number
): Music => ({
  id,
  title,
  youtube_id: `video-${id}`,
  views,
  views_formatted:
    views >= 1000 ? `${(views / 1000).toFixed(1)}K` : views.toString(),
  likes,
  likes_formatted: likes.toString(),
  thumbnail: `http://example.com/thumb${id}.jpg`,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
})
