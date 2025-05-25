export interface Student {
  id: number;
  name: string;
  email: string;
  password?: string;
  enrolledCourses?: number[]; // IDs of enrolled courses
}

export interface Course {
  id: number;
  name: string;
  description: string;
  tags: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  credits: number;
  avgRating?: number;
}

export interface UserPreferences {
  interests: string[];
  // difficultyPreference?: 'EASY' | 'MEDIUM' | 'HARD';
  creditPreference?: number;
  additionalInfo?: string;
}

export interface CategoryDTO {
  name: string;
}

export interface CourseDTO {
  id: string;
  title: string;
  description: string;
  categories: CategoryDTO[];
  credits: number;
  avgRating?: number;
}

export interface StudentDTO {
  id: number;
  name: string;
  email: string;
  enrolledCourses?: string[];
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  student: StudentDTO;
  token: string;
}

