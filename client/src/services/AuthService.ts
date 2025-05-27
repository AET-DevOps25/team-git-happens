import { create } from 'zustand';
import { toast } from 'sonner';
import type { Student, StudentDTO } from '@/types'; // Assuming StudentDTO might be used or similar for response

// Define the shape of the registration request payload
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
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>; // Add register function signature
  logout: () => void;
  updateStudent: (student: Student) => void;
}

const API_BASE_URL = 'http://localhost:8086'; 

export const useAuthStore = create<AuthState>((set) => ({
  student: localStorage.getItem('courseCompassUser') 
    ? JSON.parse(localStorage.getItem('courseCompassUser') || '{}') 
    : null,
  token: localStorage.getItem('courseCompassToken') || null,
  isAuthenticated: !!localStorage.getItem('courseCompassUser'),
  
  login: async (email: string, password: string) => {
    try {
      // Simple validation for TUM email
      if (!email.endsWith('@tum.de') && !email.endsWith('@mytum.de')) {
        toast.error('Please enter a valid TUM email address (@tum.de or @mytum.de)');
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
        toast.error(`Login failed: ${errorBody || response.statusText}`);
        return false;
      }

      // Expecting a JSON response with token and student data
      const loginResponse = await response.json();
      
      const token = loginResponse.token;
      const studentDataFromBackend = loginResponse.student;

      if (!token || !studentDataFromBackend) {
        toast.error('Login failed: Invalid response from server.');
        return false;
      }

      const studentForStore: Student = {
        matriculationNumber: studentDataFromBackend.matriculationNumber,
        name: studentDataFromBackend.name,
        email: studentDataFromBackend.email,
        enrolledCourses: studentDataFromBackend.enrolledCourses || [] 
      };
      
      localStorage.setItem('courseCompassUser', JSON.stringify(studentForStore));
      localStorage.setItem('courseCompassToken', token);
      set({ student: studentForStore, token, isAuthenticated: true });
      toast.success(`Welcome, ${studentForStore.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check the console for details.');
      return false;
    }
  },
  
  register: async (payload: RegisterPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Backend returns plain text for errors (400, 409, 500)
        const errorBody = await response.text(); 
        toast.error(`Registration failed: ${errorBody || response.statusText}`);
        return false;
      }

      // Successful registration (201) returns StudentDTO
      const registeredStudent: StudentDTO = await response.json(); 
      toast.success(`Registration successful for ${registeredStudent.name}! Please log in.`);
      return true; 

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. An unexpected error occurred. Please check the console.');
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem('courseCompassUser');
    localStorage.removeItem('courseCompassToken');
    set({ student: null, token: null, isAuthenticated: false });
    toast.info('You have been logged out');
  },
  
  updateStudent: (student: Student) => {
    set({ student });
  }
}));
