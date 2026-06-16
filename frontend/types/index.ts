export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface Class {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  subject_count?: number;
  created_at: string;
}

export interface Subject {
  id: string;
  class_id: string;
  name: string;
  slug: string;
  icon: string | null;
  order_index: number;
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  chapter_number: number | null;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface Note {
  id: string;
  chapter_id: string;
  title: string;
  file_url: string;
  file_key: string;
  file_size_bytes: string | number;
  uploaded_at: string;
  updated_at: string;
}

export interface Admin {
  id: number;
  email: string;
  created_at: string;
}

export interface SearchResults {
  classes: Array<{ id: string; name: string; slug: string }>;
  subjects: Array<{ id: string; name: string; slug: string; icon?: string; class_slug: string; class_name: string }>;
  chapters: Array<{ 
    id: string; 
    name: string; 
    chapter_number?: number; 
    description?: string;
    subject_id: string; 
    subject_name: string; 
    class_slug: string 
  }>;
}
