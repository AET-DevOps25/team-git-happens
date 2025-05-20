import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import { useAuthStore } from '@/services/AuthService';

// Mock useAuthStore
jest.mock('@/services/AuthService', () => ({
  useAuthStore: jest.fn(),
}));

// Mock sonner's toast as it might be indirectly used or if other components use it
jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
        info: jest.fn(),
    }
}));

describe('Home Page', () => {
  const mockNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        student: null,
      });
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
    });

    it('renders the main heading and logo', () => {
      expect(screen.getByAltText('Course Compass Logo')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Course Compass/i })).toBeInTheDocument();
    });

    it('renders the introductory paragraph', () => {
      expect(screen.getByText(/Your AI-powered guide to finding the perfect electives/i)).toBeInTheDocument();
    });

    it('renders "Browse Courses" and "Get Started" buttons', () => {
      expect(screen.getByRole('button', { name: /Browse Courses/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
    });

    it('renders feature cards', () => {
      expect(screen.getByText(/Explore Courses/i)).toBeInTheDocument();
      expect(screen.getByText(/Read & Share Reviews/i)).toBeInTheDocument();
      expect(screen.getByText(/Get AI Recommendations/i)).toBeInTheDocument();
    });

    it('renders the call to action section with "Sign In Now" button', () => {
      expect(screen.getByRole('heading', { name: /Ready to find your perfect electives?/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In Now/i })).toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        student: { id: 1, name: 'Test User', email: 'test@tum.de' },
      });
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
    });

    it('renders "Browse Courses" and "Get Recommendations" buttons', () => {
      expect(screen.getByRole('button', { name: /Browse Courses/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get Recommendations/i })).toBeInTheDocument();
    });

    it('renders the call to action section with "Get Personalized Recommendations" button', () => {
      expect(screen.getByRole('heading', { name: /Ready to find your perfect electives?/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get Personalized Recommendations/i })).toBeInTheDocument();
    });
  });
});