import { Star } from 'lucide-react';

interface Props {
  rating: number;
  size?: number;
  className?: string;
}

export default function RatingStars({ rating, size = 14, className = '' }: Props) {
  const full = Math.round(rating);
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} नो रेटिंग`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= full ? 'fill-gold text-gold' : 'fill-sand text-sand'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
