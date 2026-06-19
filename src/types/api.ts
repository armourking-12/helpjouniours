/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
}

/** Paginated API response */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** Search filters */
export interface SearchFilters {
  query?: string;
  type?: string;
  university?: string;
  course?: string;
  semester?: number;
  subject?: string;
  year?: number;
  sortBy?: "newest" | "oldest" | "popular" | "downloads";
}
