import { Star } from "lucide-react";
import { Review } from "@/lib/api/parks";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

interface ReviewCardProps {
  review: Review & { park_name?: string };
  showParkName?: boolean;
}

export const ReviewCard = ({ review, showParkName = false }: ReviewCardProps) => {
  return (
    <div className="border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        <span className="font-medium">{review.author_name}</span>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(review.created_at), {
            addSuffix: true,
            locale: nl,
          })}
        </span>
      </div>
      {showParkName && review.park_name && (
        <p className="text-sm text-muted-foreground mb-1">{review.park_name}</p>
      )}
      {review.review_text && (
        <p className="text-sm">{review.review_text}</p>
      )}
    </div>
  );
};
