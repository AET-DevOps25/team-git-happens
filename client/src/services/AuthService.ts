import { create } from 'zustand';
import { toast } from 'sonner';
import type { Student, StudentDTO } from '@/types';

interface RegisterPayload {
  matriculationNumber: string;
  name: string;
  email: string;
  password: string;
}

interface AuthState {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean; // Added loading state
  error: string | null; // Added error state
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => void;
  updateStudent: (student: Student) => void;
}


const API_BASE_URL = 'http://localhost:8086';

export const useAuthStore = create<AuthState>((set, get) => ({ // Added get
  student: localStorage.getItem('courseCompassUser')
    ? JSON.parse(localStorage.getItem('courseCompassUser') || '{}')
    : null,
  token: localStorage.getItem('courseCompassToken') || null,
  isAuthenticated: !!localStorage.getItem('courseCompassUser'),
  loading: false, // Initialize loading state
  error: null, // Initialize error state

  login: async (email: string, password: string) => {
    set({ loading: true, error: null }); // Set loading true, clear previous errors
    try {
      // Simple validation for TUM email
      if (!email.endsWith('@tum.de') && !email.endsWith('@mytum.de')) {
        toast.error('Please enter a valid TUM email address (@tum.de or @mytum.de)');
        set({ loading: false });
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorBody = await response.text(); // Error response might be text
        const errorMessage = `Login failed: ${errorBody || response.statusText}`;
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }

      // Expecting a JSON response with token and student data
      const loginResponse = await response.json();
      
      const token = loginResponse.token;
      const studentDataFromBackend = loginResponse.student;

      if (!token || !studentDataFromBackend) {
        const errorMessage = 'Login failed: Invalid response from server.';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }

      const studentForStore: Student = {
        matriculationNumber: studentDataFromBackend.matriculationNumber,
        name: studentDataFromBackend.name,
        email: studentDataFromBackend.email,
        // enrolledCourses: studentDataFromBackend.enrolledCourses || [] 
      };
      
      localStorage.setItem('courseCompassUser', JSON.stringify(studentForStore));
      localStorage.setItem('courseCompassToken', token);
      set({ student: studentForStore, token, isAuthenticated: true, loading: false, error: null });
      toast.success(`Welcome, ${studentForStore.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Login failed. Please check the console for details.';
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },
  
  register: async (payload: RegisterPayload) => {
    set({ loading: true, error: null }); // Set loading true, clear previous errors
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        // Use the error message from the backend if available
        const errorMessage = errorBody || `Registration failed: ${response.statusText}`;
        toast.error(errorMessage); // Display the actual error from backend
        set({ loading: false, error: errorMessage });
        return false;
      }

      // Successful registration (201) returns StudentDTO
      const registeredStudent: StudentDTO = await response.json(); 
      toast.success(`Registration successful for ${registeredStudent.name}! Please log in.`);
      set({ loading: false, error: null }); // Clear error on success
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      // Use a generic message or error.message if available
      const errorMessage = (error instanceof Error) ? error.message : 'Registration failed. An unexpected error occurred.';
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem('courseCompassUser');
    localStorage.removeItem('courseCompassToken');
    set({ student: null, token: null, isAuthenticated: false, loading: false, error: null }); // Reset all relevant state
    toast.info('You have been logged out');
  },
  
  updateStudent: (student: Student) => {
    set({ student });
  }
}));
