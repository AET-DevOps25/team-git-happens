
import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  max?: number;
}

const StarRating = ({ 
  value = 0, 
  onChange, 
  readonly = false,
  max = 5 
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };
  
  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };
  
  return (
    <div className="flex">
      {[...Array(max)].map((_, i) => {
        const rating = i + 1;
        const filled = (hoverRating || value) >= rating;
        
        return (
          <Star
            key={i}
            size={18}
            className={`
              ${filled ? 'text-tum-yellow fill-tum-yellow' : 'text-gray-300'} 
              ${!readonly ? 'cursor-pointer' : ''}
              transition-colors
            `}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={() => handleMouseLeave()}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
