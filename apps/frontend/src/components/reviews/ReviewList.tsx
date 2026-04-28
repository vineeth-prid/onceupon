import React from 'react';
import { StarRating } from './StarRating';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #111', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#f9fafb', borderRadius: '20px' }}>
        <p className="font-body" style={{ color: '#6b7280', fontSize: '16px' }}>
          No reviews yet. Be the first to review this book!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {reviews.map((review) => (
        <div
          key={review.id}
          className="liquid-glass"
          style={{
            padding: '24px',
            borderRadius: '20px',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {review.user.avatarUrl ? (
                  <img src={review.user.avatarUrl} alt={review.user.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span className="font-body" style={{ fontWeight: 600, color: '#6b7280' }}>
                    {review.user.firstName[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="font-body" style={{ fontWeight: 600, fontSize: '15px', color: '#111', margin: 0 }}>
                  {review.user.firstName} {review.user.lastName}
                </p>
                <p className="font-body" style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} size={16} />
          </div>
          {review.comment && (
            <p className="font-body" style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
