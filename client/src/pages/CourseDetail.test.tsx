import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'; // Import fireEvent
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import CourseDetail from './CourseDetail';
import { CourseService } from '../services/CourseService';
import { ReviewService } from '../services/ReviewService';
import { useAuthStore } from '../services/AuthService';
import { CourseDTO, ReviewDTO, Student } from '../types';
import { StudentService } from '../services/StudentService';

jest.mock('../services/CourseService');
jest.mock('../services/ReviewService');
jest.mock('../services/AuthService');
jest.mock('../services/StudentService'); // Added mock for StudentService

const mockGetCourseById = CourseService.getCourseById as jest.Mock;
const mockGetReviewsByCourseId = ReviewService.getReviewsByCourseId as jest.Mock;
const mockAddReview = ReviewService.addReview as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockGetStudentByMatriculationNumber = jest.requireMock('../services/StudentService').StudentService.getStudentByMatriculationNumber as jest.Mock; // Added mock for getStudentByMatriculationNumber

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

const mockCourse: CourseDTO = {
  id: 'test-course-1',
  title: 'Test Course Title',
  description: 'Test course description.',
  categories: [{ name: 'Testing' }],
  credits: 3,
  avgRating: 4.5,
};

const mockReviews: ReviewDTO[] = [
  {
    reviewId: 1,
    studentMatrNr: '12345678',
    courseId: 'test-course-1',
    rating: 5,
    reviewText: 'Great course!',
    createdAt: new Date().toISOString(),
  },
  {
    reviewId: 2,
    studentMatrNr: '87654321',
    courseId: 'test-course-1',
    rating: 4,
    reviewText: 'Very informative.',
    createdAt: new Date().toISOString(),
  },
];

const mockStudent: Student = {
  matriculationNumber: '00000001',
  name: 'Test Student',
  email: 'test@student.com',
};

const renderCourseDetail = (courseId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/courses/${courseId}`]}>
      <Routes>
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('CourseDetail Page', () => {
  beforeEach(() => {
    mockGetCourseById.mockReset();
    mockGetReviewsByCourseId.mockReset();
    mockAddReview.mockReset();
    mockUseAuthStore.mockReturnValue({ student: mockStudent, isAuthenticated: true });
    mockGetStudentByMatriculationNumber.mockResolvedValue(mockStudent); // Default mock implementation
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    mockGetCourseById.mockReturnValue(new Promise(() => {})); // Keep promise pending
    mockGetReviewsByCourseId.mockResolvedValue([]);
    await act(async () => {
      renderCourseDetail('test-course-1');
    });
    expect(screen.getByText('Loading course details...')).toBeInTheDocument();
  });

  it('displays course details and reviews when fetched successfully', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockGetReviewsByCourseId.mockResolvedValue(mockReviews);
    // Specific mock for this test if needed, otherwise default from beforeEach is used
    mockGetStudentByMatriculationNumber.mockImplementation(async (matrNr) => {
      if (matrNr === '12345678') return { ...mockStudent, name: 'Student One' };
      if (matrNr === '87654321') return { ...mockStudent, name: 'Student Two' };
      return mockStudent; // Default fallback
    });

    await act(async () => {
      renderCourseDetail('test-course-1');
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockCourse.title, level: 1 })).toBeInTheDocument();
      expect(screen.getByText(mockCourse.description)).toBeInTheDocument();
      expect(screen.getByText('Great course!')).toBeInTheDocument();
      expect(screen.getByText('Very informative.')).toBeInTheDocument();
    });
  });

  it('displays course not found message if course fetch fails (404 or undefined)', async () => {
    mockGetCourseById.mockResolvedValue(undefined);
    mockGetReviewsByCourseId.mockResolvedValue([]); 
    await act(async () => {
      renderCourseDetail('non-existent-course');
    });

    await waitFor(() => {
      expect(screen.getByText('Course not found')).toBeInTheDocument();
    });
  });

  it('allows authenticated user to submit a review', async () => {
    const mockStudent: Student = {
      matriculationNumber: '00000001',
      name: 'Max Mustermann',
      email: 'max.mustermann@example.com',
      // password is optional and not needed for this mock
    };

    const mockCourse: CourseDTO = {
      id: 'test-course-1',
      title: 'Test Course Title',
      description: 'Test course description.',
      categories: [{ name: 'Testing' }],
      credits: 5,
      avgRating: 4.5,
    };

    const mockReviews: ReviewDTO[] = [
      {
        reviewId: 1,
        studentMatrNr: '00000002',
        courseId: 'test-course-1',
        rating: 4,
        reviewText: 'Great course!',
        createdAt: new Date().toISOString(),
      },
    ];

    const mockNewReview: ReviewDTO = {
      reviewId: 3,
      studentMatrNr: mockStudent.matriculationNumber,
      courseId: mockCourse.id,
      rating: 5,
      reviewText: 'This is a new review!',
      createdAt: new Date().toISOString(),
    };

    const mockAddReview = jest.fn().mockResolvedValue(mockNewReview);
    ReviewService.addReview = mockAddReview;
    mockUseAuthStore.mockReturnValue({ student: { matriculationNumber: mockStudent.matriculationNumber, name: mockStudent.name, email: mockStudent.email }, isAuthenticated: true });
    CourseService.getCourseById = jest.fn().mockResolvedValue(mockCourse);
    ReviewService.getReviewsByCourseId = jest.fn().mockResolvedValue(mockReviews);

    render(
      <MemoryRouter initialEntries={[`/courses/${mockCourse.id}`]}>
        <Routes>
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(mockCourse.title);
    await screen.findByText(mockReviews[0].reviewText);

    const allButtons = screen.getAllByRole('button');
    const starButtons = allButtons.filter(button => 
      button.getAttribute('aria-label')?.startsWith('Rate ')
    );

    expect(starButtons.length).toBeGreaterThanOrEqual(5); // Ensure we have enough star buttons

    const reviewTextarea = screen.getByPlaceholderText(/Share your experience/i);
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });

    await act(async () => {
      await userEvent.type(reviewTextarea, 'This is a new review!');
      if (starButtons.length >= 5) {
        await userEvent.click(starButtons[4]);
      } else {
        console.error('Test setup error: Not enough star buttons found to click.');
      }
    });

    if (starButtons.length >= 5) {
      await waitFor(() => {
        const fifthStarSvg = starButtons[4].querySelector('svg');
        expect(fifthStarSvg).toHaveClass('fill-tum-yellow'); 
      });
    }

    await act(async () => {
      await userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockAddReview).toHaveBeenCalledWith({
        studentMatrNr: mockStudent.matriculationNumber,
        courseId: mockCourse.id,
        rating: 5, 
        reviewText: 'This is a new review!',
      });
    });
  });

  it('shows login prompt if unauthenticated user tries to submit review', async () => {
    mockUseAuthStore.mockReturnValue({ student: null, isAuthenticated: false });
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockGetReviewsByCourseId.mockResolvedValue([]);

    await act(async () => {
      renderCourseDetail('test-course-1');
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockCourse.title, level: 1 })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled(); 
    expect(screen.getByText((content, element) => {
      const hasText = (node: Element | null) => node?.textContent === 'Please login to submit a review';
      const elementHasText = hasText(element);
      const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child as Element));
      return elementHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });
});
