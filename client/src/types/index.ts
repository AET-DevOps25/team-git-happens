
export interface Student {
  id: number;
  name: string;
  email: string;
  password?: string;
  enrolledCourses?: number[]; // IDs of enrolled courses
}

export interface UserPreferences {
  interests: string[];
  // difficultyPreference?: 'EASY' | 'MEDIUM' | 'HARD';
  creditPreference?: number;
  additionalInfo?: string;
}

// DTOs aligned with the backend model
export interface SubjectDTO {
  id: number;
  name: string;
  description: string;
  tags: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  credits: number;
  prerequisites?: number[]; 
  avgRating?: number;
}

export interface StudentDTO {
  id: number;
  name: string;
  email: string;
  enrolledCourses?: number[];
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

