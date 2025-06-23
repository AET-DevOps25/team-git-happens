import { CourseDTO, StudentDTO } from "../types";
import { useAuthStore } from "./AuthService";

const API_BASE_URL = (import.meta as any).env.VITE_REACT_APP_COURSE_URL || 'http://localhost:8085';

// Helper function for API calls
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    try {
      // Try to parse error message from backend
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Ignore if response body is not JSON or empty
    }
    const error = new Error(errorMessage) as any; // Cast to any to add status
    error.status = response.status; // Attach status to error object for specific handling
    throw error;
  }
  if (response.status === 204) { // Handle No Content response
    return undefined as T; // Or an appropriate empty value for T
  }
  return response.json() as Promise<T>;
}

export const CourseService = {
  getAllCourses: async (): Promise<CourseDTO[]> => {
    return fetchApi<CourseDTO[]>(`${API_BASE_URL}/courses`);
  },

  getCourseById: async (id: string): Promise<CourseDTO | undefined> => {
    try {
      return await fetchApi<CourseDTO>(`${API_BASE_URL}/courses/${id}`);
    } catch (error: any) {
      if (error.status === 404) {
        return undefined; // Return undefined if course not found (404)
      }
      throw error; // Re-throw other errors
    }
  },
  
  getCoursesByIds: async (ids: string[]): Promise<CourseDTO[]> => {
    if (ids.length === 0) {
      return [];
    }
    const params = new URLSearchParams();
    ids.forEach(id => params.append('ids', id));
    return fetchApi<CourseDTO[]>(`${API_BASE_URL}/courses?${params.toString()}`);
  },

  searchCourses: async (query: string, categoryId?: string): Promise<CourseDTO[]> => {
    const params = new URLSearchParams();
    if (query) {
      params.append('name', query); // Assuming backend search query param is 'name' for title/description
    }
    if (categoryId) {
      params.append('categoryId', categoryId); // Assuming backend filters by 'categoryId'
    }
    return fetchApi<CourseDTO[]>(`${API_BASE_URL}/courses/search?${params.toString()}`);
  },

  createCourse: async (courseData: Omit<CourseDTO, 'id'>): Promise<CourseDTO> => {
    return fetchApi<CourseDTO>(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
  },
  
  enrollInCourse: async (studentMatriculationNumber: string, courseId: string): Promise<string[]> => {
    const updatedEnrolledCourseIds = await fetchApi<string[]>( 
      `${API_BASE_URL}/students/${studentMatriculationNumber}/enroll`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      }
    );
    
    const student = useAuthStore.getState().student;
    if (student) {
      const updatedStudent = { 
        ...student,
        enrolledCourses: updatedEnrolledCourseIds // Already string[]
      };
      useAuthStore.getState().updateStudent(updatedStudent);
    }
    return updatedEnrolledCourseIds;
  },
  
  unenrollFromCourse: async (studentMatriculationNumber: string, courseId: string): Promise<string[]> => {
    const updatedEnrolledCourseIds = await fetchApi<string[]>( 
      `${API_BASE_URL}/students/${studentMatriculationNumber}/enroll/${courseId}`, 
      {
        method: 'DELETE',
      }
    );
    const student = useAuthStore.getState().student;
    if (student) {
      const updatedStudent = { 
        ...student,
        enrolledCourses: updatedEnrolledCourseIds 
      };
      useAuthStore.getState().updateStudent(updatedStudent);
    }
    return updatedEnrolledCourseIds;
  }, 
};
