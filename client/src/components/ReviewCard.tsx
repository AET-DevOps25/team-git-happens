
import { Review } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import StarRating from './StarRating';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  showSubject?: boolean;
}

const ReviewCard = ({ review, showSubject = false }: ReviewCardProps) => {
  const formattedDate = format(new Date(review.createdAt), 'MMM d, yyyy');

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{review.studentName}</div>
            {showSubject && review.courseName && (
              <div className="text-sm text-muted-foreground">
                {review.courseName}
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
