import { useState, useEffect, useMemo } from "react"

export interface UsePaginationReturn {
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  visiblePages: number[]
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
}

export function usePagination(totalPages: number): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(targetPage)
  }

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const visiblePages = useMemo(() => {
    const maxVisiblePages = 5
    const pages: number[] = []

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5]
    }

    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ]
  }, [currentPage, totalPages])

  return {
    currentPage,
    hasNextPage,
    hasPrevPage,
    visiblePages,
    goToPage,
    nextPage,
    prevPage,
  }
}
