import { render, screen, waitFor, act } from '@testing-library/react';
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
    // Clear any toast mocks if they were called, to prevent test interference
    if (jest.isMockFunction(jest.requireMock('sonner').toast.error)) {
      jest.requireMock('sonner').toast.error.mockClear();
    }
    if (jest.isMockFunction(jest.requireMock('sonner').toast.success)) {
      jest.requireMock('sonner').toast.success.mockClear();
    }
    if (jest.isMockFunction(jest.requireMock('sonner').toast.info)) {
      jest.requireMock('sonner').toast.info.mockClear();
    }
  });

  describe('when loading initially', () => {
    beforeEach(async () => {
      mockGetAllCourses.mockReturnValue(new Promise(() => {})); // Simulate pending promise
      // Wrap initial render in act if it causes state updates that are not awaited
      await act(async () => {
        renderCourseList();
      });
    });

    it('renders loading state', () => {
      expect(screen.getByText('Loading courses...')).toBeInTheDocument();
    });
  });

  describe('when courses are fetched successfully', () => {
    beforeEach(async () => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      await act(async () => {
        renderCourseList();
      });
      // waitFor already handles act wrapping for the assertions within it
      await waitFor(() => {
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
      await act(async () => {
        await userEvent.type(searchInput, 'Calculus');
      });

      await waitFor(() => {
        expect(screen.getByText('Calculus I')).toBeInTheDocument();
        expect(screen.queryByText('Introduction to Programming')).not.toBeInTheDocument();
      });
    });

    it('filters courses by category selection', async () => {
      const categoryBadge = screen.getByText((content, element) => content === 'Programming' && element.classList.contains('cursor-pointer'));
      
      await act(async () => {
        await userEvent.click(categoryBadge);
      });

      await waitFor(() => {
        expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
        expect(screen.getByText('Advanced Programming')).toBeInTheDocument();
        expect(screen.queryByText('Calculus I')).not.toBeInTheDocument();
      });
    });

    it('clears filters when "Clear Filters" button is clicked', async () => {
      const searchInput = screen.getByPlaceholderText('Search courses...');
      await act(async () => {
        await userEvent.type(searchInput, 'Calculus');
      });
      
      const categoryBadge = screen.getByText('Programming');
      await act(async () => {
        await userEvent.click(categoryBadge);
      });

      await waitFor(() => {
        expect(screen.queryByText('Calculus I')).not.toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await act(async () => {
        await userEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
        expect(screen.getByText('Calculus I')).toBeInTheDocument();
        expect(screen.getByText('Advanced Programming')).toBeInTheDocument();
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('when no courses are available', () => {
    beforeEach(async () => {
      mockGetAllCourses.mockResolvedValue([]);
      await act(async () => {
        renderCourseList();
      });
      await waitFor(() => {
        expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
      });
    });

    it('displays a message that no courses are found', () => {
      expect(screen.getByText('No courses match your search criteria.')).toBeInTheDocument();
    });
  });
});

