import { Review } from "../types";

const API_BASE_URL = 'http://localhost:8087';

export const ReviewService = {
  getReviewsByCourseId: async (courseId: string): Promise<Review[]> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews for course ${courseId}`);
    }
    return response.json();
  },

  getReviewsByStudentMatrNr: async (studentMatrNr: string): Promise<Review[]> => {
    const response = await fetch(`${API_BASE_URL}/students/${studentMatrNr}/reviews`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews for student ${studentMatrNr}`);
    }
    return response.json();
  },

  addReview: async (reviewData: Omit<Review, 'reviewId' | 'createdAt'>): Promise<Review> => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to add review: ${response.status} ${errorBody || response.statusText}`);
    }
    return response.json();
  }
};
