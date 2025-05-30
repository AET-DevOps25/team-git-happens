import { CourseDTO, Review, ReviewDTO, StudentDTO } from "../types";
import { useAuthStore } from "./AuthService";
import { CourseService } from "./CourseService";

// Mock data
const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    studentMatrNr: "10100001", 
    courseId: "IN2390",
    studentName: "Maria Schmidt",
    courseName: "Advanced Deep Learning for Computer Vision: Visual Computing",
    rating: 5,
    reviewText: "Excellent course! Professor explains concepts very clearly and the assignments were challenging but doable.",
    createdAt: "2023-10-15T14:30:00Z"
  },
  {
    id: 2,
    studentMatrNr: "10200002", 
    courseId: "IN2390", 
    studentName: "Thomas Müller",
    courseName: "Advanced Deep Learning for Computer Vision: Visual Computing", // Updated
    rating: 4,
    reviewText: "Very informative course. The content was well-structured, though some practical examples would have been helpful.",
    createdAt: "2023-09-20T09:45:00Z"
  },
  {
    id: 3,
    studentMatrNr: "10300003",
    courseId: "CIT3230002", 
    studentName: "Anna Weber",
    courseName: "Cloud Information Systems", 
    rating: 4,
    reviewText: "Challenging but rewarding. You'll need to put in extra hours to fully grasp the concepts.",
    createdAt: "2023-11-05T16:20:00Z"
  },
  {
    id: 4,
    studentMatrNr: "10400004", 
    courseId: "IN2298", 
    studentName: "Felix Bauer",
    courseName: "Advanced Deep Learning for Physics", 
    rating: 3,
    reviewText: "Content is good but the lectures were sometimes difficult to follow. More practical examples would have been nice.",
    createdAt: "2023-10-30T11:10:00Z"
  },
  {
    id: 5,
    studentMatrNr: "10500005", // Updated
    courseId: "IN2376", // Updated
    studentName: "Julia Fischer",
    courseName: "Advanced Robot Control and Learning", // Updated
    rating: 5,
    reviewText: "One of the best courses I've taken at TUM. The professor is extremely knowledgeable and the projects were both challenging and interesting.",
    createdAt: "2023-11-15T13:25:00Z"
  },
];

export const ReviewService = {
  getReviewsBySubject: async (subjectId: string): Promise<Review[]> => {
    // In a real app, this would call:
    // GET /api/reviews/subject/{subjectId}
    return new Promise((resolve) => {
      setTimeout(() => {
        const reviews = MOCK_REVIEWS.filter(r => r.courseId === subjectId);
        resolve(reviews);
      }, 300);
    });
  },

  getUserReviews: async (email: string): Promise<Review[]> => {
    // In a real app, this would call:
    // GET /api/reviews/user/{email}
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is just for mock purposes - would really use email to look up student
        // In a real app, the backend would handle this based on the authenticated user
        const student = useAuthStore.getState().student;
        if (student) {
          // Get reviews by student ID
          const studentReviews = MOCK_REVIEWS.filter(r => r.studentMatrNr === student.matriculationNumber);
          if (studentReviews.length === 0) {
            // If no reviews by ID, return some sample reviews for demo
            resolve(MOCK_REVIEWS.slice(0, 2));
          } else {
            resolve(studentReviews);
          }
        } else {
          resolve(MOCK_REVIEWS.slice(0, 2));
        }
      }, 300);
    });
  },

  getReviewsByCourseId: async (subjectId: string): Promise<Review[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const reviews = MOCK_REVIEWS.filter(r => r.courseId === subjectId);
    return reviews;
  },

  getReviewsByStudentMatrNr: async (studentMatrNr: string): Promise<Review[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const reviews = MOCK_REVIEWS.filter(r => r.studentMatrNr === studentMatrNr);
    return reviews;
  },

  addReview: async (reviewData: Omit<Review, 'id' | 'createdAt' | 'studentName' | 'courseName'>): Promise<Review> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const student = await getStudentById(reviewData.studentMatrNr); 
    const subject = await getCourseById(reviewData.courseId);

    if (!student || !subject) {
      throw new Error("Student or Subject not found");
    }

    const newReview: Review = {
      id: MOCK_REVIEWS.length + 1,
      ...reviewData,
      studentName: student.name,
      courseName: subject.title, 
      createdAt: new Date().toISOString(),
    };
    MOCK_REVIEWS.push(newReview);
    return newReview;
  }
};

// Helper function to get student by matriculation number (replace with actual API call if available)
const getStudentById = async (matriculationNumber: string): Promise<StudentDTO | null> => {
  // This is a mock implementation. In a real app, you'd fetch this from your student service.
  // For now, let's assume we have a mock student or return a generic one.
  // You might need to expand this based on your actual student data source.
  const mockStudent: StudentDTO = {
    matriculationNumber: matriculationNumber,
    name: "Mock Student", // Replace with actual name if available or needed for reviews
    email: "mock.student@example.com",
  };
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  // Check if a review exists for this student to get their name, otherwise use mock
  const existingReview = MOCK_REVIEWS.find(r => r.studentMatrNr === matriculationNumber);
  if (existingReview) {
    return { ...mockStudent, name: existingReview.studentName };
  }
  return mockStudent; 
};

// Helper function to get course by ID (replace with actual API call if available)
const getCourseById = async (courseId: string): Promise<CourseDTO | null> => {
  // This is a mock implementation. In a real app, you'd fetch this from your course service.
  // For now, let's assume we have a mock course or return a generic one.
  // You might need to expand this based on your actual course data source.
  const mockCourse: CourseDTO = {
    id: courseId,
    title: "Mock Course Title", // Replace with actual title if available or needed for reviews
    description: "Mock course description",
    credits: 3,
    categories: [],
  };
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
    // Check if a review exists for this course to get its name, otherwise use mock
  const existingReview = MOCK_REVIEWS.find(r => r.courseId === courseId);
  if (existingReview) {
    return { ...mockCourse, title: existingReview.courseName };
  }
  return mockCourse;
};
