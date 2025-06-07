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
          <button
            key={i}
            type="button" // Important for buttons within forms
            aria-label={`Rate ${rating} out of ${max} stars`}
            title={`Rate ${rating} out of ${max} stars`}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={() => handleMouseLeave()}
            // Minimal styling to make the button itself invisible
            className={`p-0 m-0 bg-transparent border-none ${!readonly ? 'cursor-pointer' : ''}`}
          >
            <Star
              // Removed onClick, onMouseEnter, onMouseLeave from Star itself
              size={18}
              className={`
                ${filled ? 'text-tum-yellow fill-tum-yellow' : 'text-gray-300'} 
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
