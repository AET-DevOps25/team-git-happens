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

  getAverageRatingByCourseId: async (courseId: string): Promise<number | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/average-rating`);
      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`Failed to fetch average rating for course ${courseId}`);
      }
      
      const rawData = await response.text();
      
      try {
        const parsed = JSON.parse(rawData);
        return typeof parsed === 'number' ? parsed : parseFloat(parsed);
      } catch {
        const numValue = parseFloat(rawData);
        if (!isNaN(numValue)) {
          return numValue;
        }
        return undefined;
      }
    } catch (error) {
      console.error(`Error fetching average rating for course ${courseId}:`, error);
      return undefined;
    }
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
