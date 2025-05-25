import { CourseDTO, CategoryDTO } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

interface CourseCardProps {
  course: CourseDTO;
  showDetails?: boolean;
}

const CourseCard = ({ course, showDetails = true }: CourseCardProps) => {
  return (
    <Link to={`/course/${course.id}`}>
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
            <StarRating value={course.avgRating || 0} readonly />
            <span className="ml-2 text-sm">({course.avgRating?.toFixed(1)})</span>
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
