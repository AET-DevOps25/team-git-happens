import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Recommend from './Recommend';
import { CourseService } from '../services/CourseService';
import { RecommendationService } from '../services/RecommendationService';
import { CategoryDTO, CourseDTO } from '../types';
import { RecommendedCourse } from '../services/RecommendationService';
import { toast } from 'sonner';

// Mock services
jest.mock('../services/CourseService');
jest.mock('../services/RecommendationService');

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

const mockGetAllCategories = CourseService.getAllCategories as jest.Mock;
const mockGetRecommendationsFromPreferences = RecommendationService.getRecommendationsFromPreferences as jest.Mock;

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

const mockCategories: CategoryDTO[] = [
  { name: 'Machine Learning and Analytics' },
  { name: 'Databases and Information Systems' },
  { name: 'Computer Graphics and Vision' },
  { name: 'Algorithms' },
  { name: 'Robotics' },
];

const mockCourses: CourseDTO[] = [
  {
    id: 'course1',
    title: 'Advanced Natural Language Processing',
    description: 'Advanced NLP concepts and techniques.',
    credits: 6,
    categories: [{ name: 'Machine Learning and Analytics' }],
    avgRating: 4.5,
  },
  {
    id: 'course2',
    title: 'Query Optimization',
    description: 'Database query optimization techniques.',
    credits: 4,
    categories: [{ name: 'Databases and Information Systems' }],
    avgRating: 4.2,
  },
];

const mockRecommendations: RecommendedCourse[] = [
  {
    course: mockCourses[0],
    reason: 'This course covers advanced AI concepts and is highly relevant for machine learning and analytics.',
  },
  {
    course: mockCourses[1],
    reason: 'This course directly covers query optimization techniques which matches your description.',
  },
];

describe('Recommend Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderRecommendPage = () => {
    return render(
      <BrowserRouter>
        <Recommend />
      </BrowserRouter>
    );
  };

  describe('Initial Render', () => {
    beforeEach(async () => {
      mockGetAllCategories.mockResolvedValue(mockCategories);
      await act(async () => {
        renderRecommendPage();
      });
    });

    it('renders the main heading', () => {
      expect(screen.getByRole('heading', { name: /Get Course Recommendations/i })).toBeInTheDocument();
    });

    it('loads and displays categories', async () => {
      await waitFor(() => {
        expect(mockGetAllCategories).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        mockCategories.forEach(category => {
          expect(screen.getByLabelText(category.name)).toBeInTheDocument();
        });
      });
    });

    it('renders all form sections', async () => {
      await waitFor(() => {
        expect(screen.getByText(/What categories are you interested in/i)).toBeInTheDocument();
        expect(screen.getByText(/How many credits do you prefer/i)).toBeInTheDocument();
        expect(screen.getByText(/Tell us about yourself/i)).toBeInTheDocument();
      });
    });

    it('renders form inputs', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter number of credits/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/I'm a computer science student/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Get Recommendations/i })).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state for categories', () => {
      mockGetAllCategories.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderRecommendPage();

      expect(screen.getByText(/Loading categories.../i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    beforeEach(async () => {
      mockGetAllCategories.mockResolvedValue(mockCategories);
      await act(async () => {
        renderRecommendPage();
      });
      await waitFor(() => {
        expect(screen.getByLabelText(mockCategories[0].name)).toBeInTheDocument();
      });
    });

    it('shows error when no categories are selected', async () => {
      const user = userEvent.setup();
      const descriptionInput = screen.getByPlaceholderText(/I'm a computer science student/i);
      const submitButton = screen.getByRole('button', { name: /Get Recommendations/i });

      await user.type(descriptionInput, 'I want to learn about AI');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select at least one category');
      });
    });

    it('shows error when description is empty', async () => {
      const user = userEvent.setup();
      const categoryCheckbox = screen.getByLabelText(mockCategories[0].name);
      const submitButton = screen.getByRole('button', { name: /Get Recommendations/i });
      const descriptionInput = screen.getByPlaceholderText(/I'm a computer science student/i);

      // Select a category first
      await user.click(categoryCheckbox);
      expect(categoryCheckbox).toBeChecked();

      // Ensure description is empty
      expect(descriptionInput).toHaveValue('');

      // Check if button is enabled and form is accessible
      expect(submitButton).not.toBeDisabled();
      const form = submitButton.closest('form');
      expect(form).toBeInTheDocument();
      
      // Submit the form directly to trigger validation
      fireEvent.submit(form!);

      // Wait for the validation error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please provide a description');
      });

      // The API should not have been called since validation failed
      expect(mockGetRecommendationsFromPreferences).not.toHaveBeenCalled();
    });
  });

  describe('Form Interaction', () => {
    beforeEach(async () => {
      mockGetAllCategories.mockResolvedValue(mockCategories);
      await act(async () => {
        renderRecommendPage();
      });
      await waitFor(() => {
        expect(screen.getByLabelText(mockCategories[0].name)).toBeInTheDocument();
      });
    });

    it('allows selecting and deselecting categories', async () => {
      const user = userEvent.setup();
      const categoryCheckbox = screen.getByLabelText(mockCategories[0].name);

      // Initially unchecked
      expect(categoryCheckbox).not.toBeChecked();

      // Select category
      await user.click(categoryCheckbox);
      expect(categoryCheckbox).toBeChecked();

      // Deselect category
      await user.click(categoryCheckbox);
      expect(categoryCheckbox).not.toBeChecked();
    });

    it('allows entering credit preference', async () => {
      const user = userEvent.setup();
      const creditsInput = screen.getByPlaceholderText(/Enter number of credits/i);

      await user.type(creditsInput, '6');
      expect(creditsInput).toHaveValue(6);
    });

    it('allows entering description', async () => {
      const user = userEvent.setup();
      const descriptionInput = screen.getByPlaceholderText(/I'm a computer science student/i);

      await user.type(descriptionInput, 'I want to learn about machine learning');
      expect(descriptionInput).toHaveValue('I want to learn about machine learning');
    });
  });

  describe('Recommendations Flow', () => {
    beforeEach(async () => {
      mockGetAllCategories.mockResolvedValue(mockCategories);
      mockGetRecommendationsFromPreferences.mockResolvedValue(mockRecommendations);
      
      await act(async () => {
        renderRecommendPage();
      });
      await waitFor(() => {
        expect(screen.getByLabelText(mockCategories[0].name)).toBeInTheDocument();
      });
    });

    it('successfully submits form and shows recommendations', async () => {
      const user = userEvent.setup();
      const categoryCheckbox = screen.getByLabelText(mockCategories[0].name);
      const creditsInput = screen.getByPlaceholderText(/Enter number of credits/i);
      const descriptionInput = screen.getByPlaceholderText(/I'm a computer science student/i);
      const submitButton = screen.getByRole('button', { name: /Get Recommendations/i });

      // Fill out form
      await user.click(categoryCheckbox);
      await user.type(creditsInput, '6');
      await user.type(descriptionInput, 'I want to learn about machine learning');

      // Submit form
      await user.click(submitButton);

      // Check that service was called with correct parameters
      await waitFor(() => {
        expect(mockGetRecommendationsFromPreferences).toHaveBeenCalledWith({
          interests: [mockCategories[0].name],
          creditPreference: 6,
          additionalInfo: 'I want to learn about machine learning',
        });
      });

      // Check that recommendations are displayed
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Your Recommended Courses/i })).toBeInTheDocument();
        expect(screen.getByText(mockCourses[0].title)).toBeInTheDocument();
        expect(screen.getByText(mockCourses[1].title)).toBeInTheDocument();
      });

      // Check that reasons are displayed
      expect(screen.getByText(/This course covers advanced AI concepts/i)).toBeInTheDocument();
      expect(screen.getByText(/This course directly covers query optimization/i)).toBeInTheDocument();
    });

    it('shows loading state during recommendation fetch', async () => {
      const user = userEvent.setup();
      mockGetRecommendationsFromPreferences.mockImplementation(() => new Promise(() => {})); // Never resolves

      const categoryCheckbox = screen.getByLabelText(mockCategories[0].name);
      const descriptionInput = screen.getByPlaceholderText(/I'm a computer science student/i);
      const submitButton = screen.getByRole('button', { name: /Get Recommendations/i });

      await user.click(categoryCheckbox);
      await user.type(descriptionInput, 'I want to learn about AI');
      await user.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText(/Analyzing with AI.../i)).toBeInTheDocument();
      });
    });

    it('handles empty recommendations', async () => {
      const user = userEvent.setup();
      mockGetRecommendationsFromPreferences.mockResolvedValue([]);

      const categoryCheckbox = screen.getByLabelText(mockCategories[0].name);
      const descriptionInput = screen.getByPlaceholderText(/I'm a computer science student/i);
      const submitButton = screen.getByRole('button', { name: /Get Recommendations/i });

      await user.click(categoryCheckbox);
      await user.type(descriptionInput, 'I want to learn about something very specific');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('No courses match your preferences. Try selecting different options.');
      });

      await waitFor(() => {
        expect(screen.getByText(/No courses match your preferences/i)).toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      mockGetRecommendationsFromPreferences.mockRejectedValue(new Error('API Error'));

      const categoryCheckbox = screen.getByLabelText(mockCategories[0].name);
      const descriptionInput = screen.getByPlaceholderText(/I'm a computer science student/i);
      const submitButton = screen.getByRole('button', { name: /Get Recommendations/i });

      await user.click(categoryCheckbox);
      await user.type(descriptionInput, 'I want to learn about AI');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to generate recommendations');
      });
    });
  });

  describe('Results Page Interaction', () => {
    beforeEach(async () => {
      mockGetAllCategories.mockResolvedValue(mockCategories);
      mockGetRecommendationsFromPreferences.mockResolvedValue(mockRecommendations);
      
      await act(async () => {
        renderRecommendPage();
      });
      
      // Fill out and submit form to get to results page
      await waitFor(() => {
        expect(screen.getByLabelText(mockCategories[0].name)).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const categoryCheckbox = screen.getByLabelText(mockCategories[0].name);
      const descriptionInput = screen.getByPlaceholderText(/I'm a computer science student/i);
      const submitButton = screen.getByRole('button', { name: /Get Recommendations/i });

      await user.click(categoryCheckbox);
      await user.type(descriptionInput, 'I want to learn about AI');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Your Recommended Courses/i })).toBeInTheDocument();
      });
    });

    it('allows user to adjust preferences', async () => {
      const user = userEvent.setup();
      const adjustButton = screen.getByRole('button', { name: /Adjust Preferences/i });

      await user.click(adjustButton);

      // Should return to form view
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Get Course Recommendations/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Get Recommendations/i })).toBeInTheDocument();
      });

      // Form should be reset
      expect(screen.getByLabelText(mockCategories[0].name)).not.toBeChecked();
      expect(screen.getByPlaceholderText(/Enter number of credits/i)).toHaveValue(null);
      expect(screen.getByPlaceholderText(/I'm a computer science student/i)).toHaveValue('');
    });
  });

  describe('Error Handling', () => {
    it('handles category loading error', async () => {
      mockGetAllCategories.mockRejectedValue(new Error('Failed to load categories'));
      
      await act(async () => {
        renderRecommendPage();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load categories');
      });
    });
  });
});
