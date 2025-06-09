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
        const ratingValue = Number(value);
        
        // Handle half-star logic
        const isHalfStar = !isNaN(ratingValue) && 
          ratingValue < rating && 
          ratingValue > rating - 1;
        
        const isFullStar = (hoverRating || (isNaN(ratingValue) ? 0 : ratingValue)) >= rating;
        
        return (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${rating} out of ${max} stars`}
            title={`Rate ${rating} out of ${max} stars`}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={() => handleMouseLeave()}
            // Minimal styling to make the button itself invisible
            className={`p-0 m-0 bg-transparent border-none ${!readonly ? 'cursor-pointer' : ''} relative`}
          >
            {isHalfStar && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star
                  size={18}
                  className="text-tum-yellow fill-tum-yellow"
                />
              </div>
            )}
            <Star
              size={18}
              className={`
                ${isFullStar ? 'text-tum-yellow fill-tum-yellow' : 'text-gray-300'} 
                transition-colors
              `}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
