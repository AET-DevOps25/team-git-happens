import { CourseDTO, UserPreferences } from "../types";
import { CourseService } from "./CourseService";

export interface RecommendedCourse {
  course: CourseDTO;
  reason: string;
}


const API_BASE = '/api/recommend';

const RECOMMENDATION_API_URL = `${API_BASE}/api/recommendation`;

// Helper function for API calls
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    console.log(`Fetching from ${url}...`);
    const response = await fetch(url, options);
    
    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        // Try to parse error message from backend
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Ignore if response body is not JSON or empty
        console.log('Could not parse error response body', e);
      }
      const error = new Error(errorMessage) as Error & { status: number };
      error.status = response.status;
      throw error;
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    throw error; // Re-throw to let caller handle
  }
}

export const RecommendationService = {
  getRecommendationsFromPreferences: async (preferences: UserPreferences): Promise<RecommendedCourse[]> => {
    try {
      // Prepare payload for the recommendation API
      const payload = {
        credits: preferences.creditPreference || 0,
        categories: preferences.interests || [],
        description: preferences.additionalInfo || ""
      };

      // Call the recommendation API
      const response = await fetchApi<{answer: string}>(RECOMMENDATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Parse the JSON string received from the API inside the 'answer' field
      let recommendations: { course: string, reason: string }[] = [];
      try {
        // Extract the JSON string from the 'answer' field and parse it
        const jsonStart = response.answer.indexOf('[');
        const jsonEnd = response.answer.lastIndexOf(']') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = response.answer.substring(jsonStart, jsonEnd);
          recommendations = JSON.parse(jsonStr);
          console.log('Parsed recommendations:', recommendations);
        } else {
          console.error('Could not find JSON array in response:', response.answer);
        }
      } catch (error) {
        console.error('Failed to parse recommendation response:', error, response);
        return [];
      }

      // Fetch all courses to match course IDs with actual course objects
      const courses = await CourseService.getAllCourses();
      
      // Map the recommendations to the correct format
      return recommendations.map(rec => {
        // Attempt different matching strategies for course titles
        // 1. First try exact match (case insensitive)
        let course = courses.find(c => 
          c.title.toLowerCase() === rec.course.toLowerCase()
        );
        
        // 2. If no exact match, try fuzzy matching (one contains the other)
        if (!course) {
          course = courses.find(c => 
            c.title.toLowerCase().includes(rec.course.toLowerCase()) ||
            rec.course.toLowerCase().includes(c.title.toLowerCase())
          );
        }
        
        // 3. If still no match, try matching on key words (split and check overlap)
        if (!course) {
          // Split both titles into words and check for word overlap
          const recWords = rec.course.toLowerCase().split(/\s+/).filter(w => w.length > 3); // ignore small words
          
          // Find the course with the most word matches
          let bestMatch = null;
          let maxMatchCount = 0;
          
          for (const c of courses) {
            const courseWords = c.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const matchCount = recWords.filter(word => courseWords.some(cWord => cWord.includes(word) || word.includes(cWord))).length;
            
            if (matchCount > maxMatchCount && matchCount >= 2) { // At least 2 significant words should match
              maxMatchCount = matchCount;
              bestMatch = c;
            }
          }
          
          if (bestMatch) {
            course = bestMatch;
          }
        }
        
        if (course) {
          console.log('Found course match:', course.title, 'for', rec.course);
        } else {
          console.error('Could not find course matching:', rec.course);
        }
        
        return {
          course: course || {
            id: 'unknown',
            title: rec.course,
            description: 'Course details not available',
            credits: 0,
            categories: [],
            avgRating: 0
          } as CourseDTO,
          reason: rec.reason
        };
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  },
  
  getRecommendationsFromUserReviews: async (): Promise<RecommendedCourse[]> => {
    // In a real app, this would call:
    // POST /api/recommendations with email in body
    return new Promise((resolve) => {
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
