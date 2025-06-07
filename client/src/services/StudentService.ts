import { StudentDTO } from '@/types';

const API_BASE_URL = 'http://localhost:8086';

// Helper function for API calls (similar to CourseService)
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Ignore if response body is not JSON or empty
    }
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const StudentService = {
  /**
   * Fetches a student by their matriculation number.
   * @param matriculationNumber The matriculation number of the student.
   * @returns A Promise that resolves to StudentDTO or undefined if not found.
   */
  getStudentByMatriculationNumber: async (matriculationNumber: string): Promise<StudentDTO | undefined> => {
    try {
      // Corrected endpoint to match backend implementation
      return await fetchApi<StudentDTO>(`${API_BASE_URL}/auth/students/${matriculationNumber}`);
    } catch (error: any) {
      if (error.status === 404) {
        console.warn(`Student with matriculation number ${matriculationNumber} not found.`);
        return undefined;
      }
      console.error(`Error fetching student ${matriculationNumber}:`, error);
      throw error;
    }
  },
};
