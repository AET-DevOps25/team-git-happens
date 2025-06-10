export interface Student {
  matriculationNumber: string; 
  name: string;
  email: string;
  password?: string;
//  enrolledCourses?: string[]; 
}

export interface Review {
  reviewId: number;
  studentMatrNr: string;
  courseId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
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

export interface ReviewDTO {
  reviewId: number;
  studentMatrNr: string;
  courseId: string; 
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface StudentDTO {
  matriculationNumber: string; 
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

