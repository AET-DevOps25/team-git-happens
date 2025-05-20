import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock useAuthStore to prevent issues with zustand and localStorage in tests
jest.mock('@/services/AuthService', () => ({
  useAuthStore: jest.fn(() => ({
    login: jest.fn().mockResolvedValue(true),
    isAuthenticated: false,
    student: null,
  })),
}));

// Mock sonner's toast
jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
        info: jest.fn(),
    }
}));

describe('Login Page', () => {
  it('renders the login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Check for the logo
    expect(screen.getByAltText('Course Compass Logo')).toBeInTheDocument();
    
    // Check for the title
    expect(screen.getByText('Welcome to Course Compass')).toBeInTheDocument();
    
    // Check for email and password inputs
    expect(screen.getByLabelText('TUM Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    // Check for the sign-in button
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});