import { Review } from "../types";

const API_BASE_URL = (import.meta as any).env.VITE_REACT_APP_REVIEW_URL || 'http://localhost:8087';

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
          console.log(`No ratings available for course ${courseId} yet`);
          return undefined;
        }
        throw new Error(`Failed to fetch average rating for course ${courseId}`);
      }
      
      const rawData = await response.text();
      console.log(`Raw API response for course ${courseId}:`, rawData);
      
      try {
        const parsed = JSON.parse(rawData);
        console.log('Parsed as JSON:', parsed);
        return typeof parsed === 'number' ? parsed : parseFloat(parsed);
      } catch (jsonError) {
        console.log('Not JSON, trying as plain number string');
        const numValue = parseFloat(rawData);
        if (!isNaN(numValue)) {
          console.log('Successfully parsed as number:', numValue);
          return numValue;
        }
        console.error('Failed to parse response as number:', rawData);
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
