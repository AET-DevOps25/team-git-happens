
import { create } from 'zustand';
import { toast } from 'sonner';
import type{ Student } from '@/types';

interface AuthState {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateStudent: (student: Student) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  student: localStorage.getItem('courseCompassUser') 
    ? JSON.parse(localStorage.getItem('courseCompassUser') || '{}') 
    : null,
  token: localStorage.getItem('courseCompassToken') || null,
  isAuthenticated: !!localStorage.getItem('courseCompassUser'),
  
  login: async (email: string, password: string) => {
    // In a real app, this would call the AuthenticationController endpoint:
    // POST /api/authenticate with {email, password}
    try {
      // Simple validation for TUM email
      if (!email.endsWith('@tum.de')) {
        toast.error('Please enter a valid TUM email address');
        return false;
      }
      
      // Simulate API call
      const student = {
        id: Math.floor(Math.random() * 10000),
        name: email.split('@')[0], // Extract name from email for demo
        email,
        enrolledCourses: [] // Initialize with empty enrollments
      };
      
      const token = "mock-jwt-token-" + Math.random().toString(36).substring(2);
      
      localStorage.setItem('courseCompassUser', JSON.stringify(student));
      localStorage.setItem('courseCompassToken', token);
      set({ student, token, isAuthenticated: true });
      toast.success(`Welcome, ${student.name}!`);
      return true;
    } catch (error) {
      toast.error('Login failed. Please try again.');
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
