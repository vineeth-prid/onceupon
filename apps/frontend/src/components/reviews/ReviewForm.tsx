import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { useAuth } from '../../context/AuthContext';

interface ReviewFormProps {
  bookId: string;
  onSuccess: () => void;
}

export function ReviewForm({ bookId, onSuccess }: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px' }}>
        <p className="font-body" style={{ color: '#6b7280', fontSize: '15px' }}>
          Please login to leave a review.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ bookId, rating, comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setComment('');
      setRating(5);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="liquid-glass" style={{ padding: '28px', borderRadius: '20px', background: '#fff' }}>
      <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '16px' }}>Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label className="font-body" style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
            Rating
          </label>
          <StarRating rating={rating} onRatingChange={setRating} interactive size={24} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label className="font-body" style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
            Your Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you think about this book..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              fontFamily: 'inherit',
              fontSize: '15px',
              resize: 'vertical',
            }}
          />
        </div>
        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-body"
          style={{
            background: '#111',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {isSubmitting ? 'Submitting...' : 'Post Review'}
        </button>
      </form>
    </div>
  );
}
