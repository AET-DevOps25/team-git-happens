import { Review } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import StarRating from './StarRating';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { CourseService } from '@/services/CourseService';
import { useAuthStore } from '@/services/AuthService';
import { StudentService } from '@/services/StudentService';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const formattedDate = format(new Date(review.createdAt), 'MMM d, yyyy');
  const [courseName, setCourseName] = useState<string | undefined>(undefined);
  const [studentDisplayName, setStudentDisplayName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentUser = useAuthStore((state) => state.student);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch course name
        if (review.courseId) {
          const course = await CourseService.getCourseById(review.courseId);
          setCourseName(course?.title);
        }

        // Determine student display name
        if (currentUser && review.studentMatrNr === currentUser.matriculationNumber) {
          setStudentDisplayName(currentUser.name);
        } else if (review.studentMatrNr) {
          // Fetch other student's name using StudentService
          const student = await StudentService.getStudentByMatriculationNumber(review.studentMatrNr);
          setStudentDisplayName(student?.name || review.studentMatrNr); // Fallback to matrNr if name not found
        } else {
          setStudentDisplayName("Unknown Student"); // Fallback if no matriculation number
        }
      } catch (error) {
        console.error("Failed to fetch review details:", error);
        setCourseName("Error loading course name");
        setStudentDisplayName(review.studentMatrNr || "Unknown Student");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [review.courseId, review.studentMatrNr, currentUser]);

  if (isLoading) {
    return (
      <Card className="mb-4 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{studentDisplayName || 'Student'}</div>
            {courseName && (
              <div className="text-sm text-muted-foreground">
                {courseName}
              </div>
            )}
          </div>
          <StarRating value={review.rating} readonly />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{review.reviewText}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="text-xs text-muted-foreground flex items-center">
          <CalendarIcon size={12} className="mr-1" />
          {formattedDate}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReviewCard;
