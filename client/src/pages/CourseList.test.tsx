import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CourseList from '../pages/CourseList';
import { CourseService } from '../services/CourseService';
import { CategoryDTO, CourseDTO } from '../types';

// Mock CourseService
jest.mock('../services/CourseService');
const mockGetAllCourses = CourseService.getAllCourses as jest.Mock;

// Mock sonner toast (if it might be used by child components or for consistency)
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

const mockCategories: CategoryDTO[] = [
  { name: 'Programming' },
  { name: 'Math' },
];

const mockCourses: CourseDTO[] = [
  {
    id: 'crs1',
    title: 'Introduction to Programming',
    description: 'Learn the basics of programming.',
    credits: 3,
    categories: [mockCategories[0]],
    avgRating: 0,
  },
  {
    id: 'crs2',
    title: 'Calculus I',
    description: 'Fundamental concepts of calculus.',
    credits: 4,
    categories: [mockCategories[1]],
    avgRating: 0,
  },
  {
    id: 'crs3',
    title: 'Advanced Programming',
    description: 'Advanced topics in programming.',
    credits: 4,
    categories: [mockCategories[0]],
    avgRating: 0,
  },
];

const renderCourseList = () => {
  render(
    <BrowserRouter>
      <CourseList />
    </BrowserRouter>
  );
};

describe('CourseList Page', () => {
  beforeEach(() => {
    // Reset mocks before each test in the main describe block
    mockGetAllCourses.mockReset();
  });

  describe('when loading initially', () => {
    beforeEach(() => {
      mockGetAllCourses.mockReturnValue(new Promise(() => {})); // Simulate pending promise
      renderCourseList();
    });

    it('renders loading state', () => {
      expect(screen.getByText('Loading courses...')).toBeInTheDocument();
    });
  });

  describe('when courses are fetched successfully', () => {
    beforeEach(() => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      renderCourseList();
            return waitFor(() => {
        expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
      });
    });

    it('renders courses', () => {
      expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
      expect(screen.getByText('Calculus I')).toBeInTheDocument();
      expect(screen.getByText('Advanced Programming')).toBeInTheDocument();
      expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
    });

    it('filters courses by search query (title)', async () => {
      const searchInput = screen.getByPlaceholderText('Search courses...');
      await userEvent.type(searchInput, 'Calculus');

      await waitFor(() => {
        expect(screen.getByText('Calculus I')).toBeInTheDocument();
        expect(screen.queryByText('Introduction to Programming')).not.toBeInTheDocument();
      });
    });

    it('filters courses by category selection', async () => {
      const categoryBadge = screen.getByText((content, element) => content === 'Programming' && element.classList.contains('cursor-pointer'));
      await userEvent.click(categoryBadge);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
        expect(screen.getByText('Advanced Programming')).toBeInTheDocument();
        expect(screen.queryByText('Calculus I')).not.toBeInTheDocument();
      });
    });

    it('clears filters when "Clear Filters" button is clicked', async () => {
      const searchInput = screen.getByPlaceholderText('Search courses...');
      await userEvent.type(searchInput, 'Calculus');
      
      const categoryBadge = screen.getByText('Programming');
      await userEvent.click(categoryBadge);

      // Wait for filters to apply and something to disappear
      await waitFor(() => {
        expect(screen.queryByText('Calculus I')).not.toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
        expect(screen.getByText('Calculus I')).toBeInTheDocument();
        expect(screen.getByText('Advanced Programming')).toBeInTheDocument();
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('when no courses are available', () => {
    beforeEach(() => {
      mockGetAllCourses.mockResolvedValue([]);
      renderCourseList();
      // Wait for the component to process the empty array
      return waitFor(() => {
        expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
      });
    });

    it('displays a message that no courses are found', () => {
      expect(screen.getByText('No courses match your search criteria.')).toBeInTheDocument();
    });
  });
});

