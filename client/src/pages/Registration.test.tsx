import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Registration from './Registration';
import { BrowserRouter as Router } from 'react-router-dom';
import { toast } from 'sonner';

// Mock the useAuthStore
const mockRegister = jest.fn();
jest.mock('@/services/AuthService', () => ({
  useAuthStore: () => ({ register: mockRegister }), 
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));


describe('Registration Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockRegister.mockClear();
    mockNavigate.mockClear();
    (toast.error as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();
  });

  const renderComponent = () => {
    render(
      <Router>
        <Registration />
      </Router>
    );
  };

  it('should render all form fields and the submit button', () => {
    renderComponent();
    expect(screen.getByLabelText(/matriculation number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument(); // Exact match for "Password"
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should display an error message if passwords do not match', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/matriculation number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@tum.de' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should display an error message if any field is empty', async () => {
    renderComponent();
    // Click submit without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('All fields are required');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should display an error for invalid TUM email', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/matriculation number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please use a valid TUM email (@tum.de or @mytum.de)');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should display an error for invalid matriculation number (not 8 digits)', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/matriculation number/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@mytum.de' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Matriculation number must be exactly 8 digits.');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

   it('should display an error for invalid matriculation number (contains non-digits)', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/matriculation number/i), { target: { value: '1234567a' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@mytum.de' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Matriculation number must be exactly 8 digits.');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should display an error if password is less than 8 characters', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/matriculation number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@tum.de' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Password must be at least 8 characters long.');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should call register and navigate on successful submission', async () => {
    mockRegister.mockResolvedValue(true); // Simulate successful registration
    renderComponent();

    fireEvent.change(screen.getByLabelText(/matriculation number/i), { target: { value: '01234567' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Valid User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'valid@tum.de' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'validPassword123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'validPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        matriculationNumber: '01234567',
        name: 'Valid User',
        email: 'valid@tum.de',
        password: 'validPassword123',
      });
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should display loading state when submitting', async () => {
    // Simulate a delay for registration
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    renderComponent();

    fireEvent.change(screen.getByLabelText(/matriculation number/i), { target: { value: '01234567' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Valid User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'valid@tum.de' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'validPassword123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'validPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    // Check for loading state
    expect(screen.getByRole('button', { name: /creating account.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating account.../i })).toBeDisabled();

    // Wait for navigation to confirm submission process completed
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should not navigate if registration fails (register returns false)', async () => {
    mockRegister.mockResolvedValue(false); // Simulate failed registration from the store
    renderComponent();

    fireEvent.change(screen.getByLabelText(/matriculation number/i), { target: { value: '01234567' } });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@tum.de' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
     });

  it('should have a link to the login page', () => {
    renderComponent();
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });
});

