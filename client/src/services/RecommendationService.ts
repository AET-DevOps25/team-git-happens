import { CourseDTO, UserPreferences } from "../types";
import { CourseService } from "./CourseService";

export interface RecommendedCourse {
  course: CourseDTO;
  reason: string;
}

export const RecommendationService = {
  getRecommendationsFromPreferences: async (preferences: UserPreferences): Promise<RecommendedCourse[]> => {
    // In a real app, this would call the RecommendationController endpoint:
    // POST /api/recommendations with preferences in body
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const courses = await CourseService.getAllCourses();
        
        // Enhanced logic to simulate recommendations based on all preferences
        const filteredCourses = courses.filter(course => {
          // Match based on interests/categories
          const hasMatchingCategory = preferences.interests.some(interest => 
            course.categories.some(category => category.name.toLowerCase().includes(interest.toLowerCase()))
          );
          
          // Match based on credit preference if specified
          const matchesCredits = preferences.creditPreference
            ? course.credits === preferences.creditPreference
            : true;
            
          return hasMatchingCategory && matchesCredits;
        });
        
        // Create recommendation objects with enhanced reasons
        const recommendations = filteredCourses.slice(0, 3).map(course => {
          const reasons = [];
          
          // Add category match reason
          const matchingCategories = preferences.interests.filter(interest =>
            course.categories.some(category => category.name.toLowerCase().includes(interest.toLowerCase()))
          );
          if (matchingCategories.length > 0) {
            reasons.push(`matches your interest in ${matchingCategories.join(', ')}`);
          }
          
          // Add credit preference reason
          if (preferences.creditPreference && course.credits === preferences.creditPreference) {
            reasons.push(`offers ${course.credits} credits as you requested`);
          }
          
          // Add rating reason
          if (course.avgRating && course.avgRating >= 4) {
            reasons.push(`has excellent ratings (${course.avgRating}/5 stars)`);
          }
          
          const reasonText = reasons.length > 0 
            ? `This course ${reasons.join(', ')}.`
            : `This course aligns with your preferences and has a ${course.avgRating || 'good'} rating.`;
          
          return {
            course,
            reason: reasonText
          };
        });
        
        resolve(recommendations);
      }, 1000);
    });
  },
  
  getRecommendationsFromUserReviews: async (email: string): Promise<RecommendedCourse[]> => {
    // In a real app, this would call:
    // POST /api/recommendations with {email} in body
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const courses = await CourseService.getAllCourses();
        
        // Pick 2-3 random courses as recommendations
        const recommendations = courses
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(course => ({
            course,
            reason: `Based on your previous reviews and course history, we think you'll enjoy this course on ${course.title}.`
          }));
        
        resolve(recommendations);
      }, 1000);
    });
  }
};
