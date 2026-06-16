export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateClassResponse {
  id: number;
  name: string;
  slug: string;
}

export interface CreateSubjectResponse {
  id: number;
  name: string;
  slug: string;
}

export interface CreateChapterResponse {
  id: number;
  name: string;
  chapter_number: number;
}

export interface LoginResponse {
  token: string;
  email: string;
}

export interface AdminResponse {
  email: string;
}
