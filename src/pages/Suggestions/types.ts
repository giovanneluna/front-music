import { Suggestion } from "../../types"

export interface SuggestionsListProps {
  suggestions: Suggestion[]
  onDelete: (id: number) => Promise<void>
  onStatusChange: (
    id: number,
    status: "approved" | "rejected",
    motivo?: string
  ) => Promise<void>
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isAdmin: boolean
}

export interface SuggestionFormProps {
  open: boolean
  onClose: () => void
}
