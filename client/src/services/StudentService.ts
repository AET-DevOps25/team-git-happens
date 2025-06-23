import { StudentDTO } from '@/types';

const API_BASE_URL = 'http://localhost:8086';

// Define a simple Optional type to better handle null/undefined values
export interface Optional<T> {
  isPresent: () => boolean;
  get: () => T;
  orElse: (defaultValue: T) => T;
  map: <U>(fn: (value: T) => U) => Optional<U>;
  flatMap: <U>(fn: (value: T) => Optional<U>) => Optional<U>;
}

// Helper function to create an Optional from a value
export function of<T>(value: T | null | undefined): Optional<T> {
  const isPresent = () => value !== null && value !== undefined;
  
  return {
    isPresent,
    get: () => {
      if (!isPresent()) {
        throw new Error('Value is not present');
      }
      return value as T;
    },
    orElse: (defaultValue: T) => isPresent() ? value as T : defaultValue,
    map: <U>(fn: (value: T) => U) => isPresent() ? of(fn(value as T)) : empty<U>(),
    flatMap: <U>(fn: (value: T) => Optional<U>) => isPresent() ? fn(value as T) : empty<U>(),
  };
}

// Helper function to create an empty Optional
export function empty<T>(): Optional<T> {
  return {
    isPresent: () => false,
    get: () => { throw new Error('Value is not present'); },
    orElse: (defaultValue: T) => defaultValue,
    map: <U>(_: (value: T) => U) => empty<U>(),
    flatMap: <U>(_: (value: T) => Optional<U>) => empty<U>(),
  };
}

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
   * @returns A Promise that resolves to Optional<StudentDTO>.
   */
  getStudentByMatriculationNumber: async (matriculationNumber: string): Promise<Optional<StudentDTO>> => {
    try {
      // Corrected endpoint to match backend implementation
      const student = await fetchApi<StudentDTO>(`${API_BASE_URL}/auth/students/${matriculationNumber}`);
      return of(student);
    } catch (error: any) {
      if (error.status === 404) {
        console.warn(`Student with matriculation number ${matriculationNumber} not found.`);
        return empty<StudentDTO>();
      }
      console.error(`Error fetching student ${matriculationNumber}:`, error);
      throw error;
    }
  },
};
