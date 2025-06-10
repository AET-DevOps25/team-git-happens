import { CourseDTO, CategoryDTO } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useEffect, useState } from 'react';
import { ReviewService } from '@/services/ReviewService';

interface CourseCardProps {
  course: CourseDTO;
  showDetails?: boolean;
}

const CourseCard = ({ course, showDetails = true }: CourseCardProps) => {
  const [averageRating, setAverageRating] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        console.log(`Fetching average rating for course ${course.id}`);
        const rating = await ReviewService.getAverageRatingByCourseId(course.id);
        console.log(`Received rating for course ${course.id}:`, rating);
        setAverageRating(rating);
      } catch (error) {
        console.error(`Failed to fetch average rating for course ${course.id}:`, error);
      }
    };
    
    fetchAverageRating();
  }, [course.id]);
  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="h-full card-hover">
        <CardHeader>
          <p className="text-xs text-muted-foreground mb-1">ID: {course.id}</p> 
          <CardTitle className="flex justify-between items-start">
            <span>{course.title}</span>
            <Badge variant="outline" className="ml-2 whitespace-nowrap">
              {course.credits} Credits
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {course.categories.map((category: CategoryDTO) => (
              <Badge key={category.name} variant="secondary">{category.name}</Badge>
            ))}
          </div>
          
          {showDetails && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center">
            {/* Make sure we have a valid number for the star rating */}
            <StarRating value={averageRating !== undefined ? Number(averageRating) : 0} readonly />
            <span className="ml-2 text-sm">
              {averageRating !== undefined ? Number(averageRating).toFixed(1) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen size={16} className="mr-1" />
            View details
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;
