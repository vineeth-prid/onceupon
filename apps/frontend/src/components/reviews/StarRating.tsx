import React from 'react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}

export function StarRating({
  rating,
  max = 5,
  size = 20,
  onRatingChange,
  interactive = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = (hoverRating || rating) >= starValue;

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={isFilled ? '#FBBF24' : '#E5E7EB'}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              transition: 'fill 0.2s',
            }}
            onClick={() => interactive && onRatingChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}
