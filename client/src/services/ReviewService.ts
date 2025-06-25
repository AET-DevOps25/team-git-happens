import { Review } from "../types";

export const ReviewService = {
  getReviewsByCourseId: async (courseId: string): Promise<Review[]> => {
    const response = await fetch(`/api/courses/${courseId}/reviews`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews for course ${courseId}`);
    }
    return response.json();
  },

  getReviewsByStudentMatrNr: async (studentMatrNr: string): Promise<Review[]> => {
    const response = await fetch(`/api/students/${studentMatrNr}/reviews`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews for student ${studentMatrNr}`);
    }
    return response.json();
  },

  getAverageRatingByCourseId: async (courseId: string): Promise<number | undefined> => {
    const response = await fetch(`/api/courses/${courseId}/average-rating`);
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
      throw new Error('Failed to parse average rating');
    }
  },

  addReview: async (reviewData: Omit<Review, 'reviewId' | 'createdAt'>): Promise<Review> => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add review: ${response.statusText}`);
    }
    
    return response.json();
  },
};
