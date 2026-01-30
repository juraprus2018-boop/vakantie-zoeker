import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { reviewsApi } from "@/lib/api/parks";

interface ReviewFormProps {
  parkId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ parkId, onSuccess }: ReviewFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authorName.trim()) {
      toast({ title: "Vul je naam in", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Selecteer een beoordeling", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewsApi.create({
        park_id: parkId,
        author_name: authorName.trim(),
        rating,
        review_text: reviewText.trim() || undefined,
      });

      toast({ title: "Bedankt voor je review!" });
      setRating(0);
      setAuthorName("");
      setReviewText("");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Fout bij plaatsen review",
        description: "Probeer het later opnieuw",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Beoordeling *</Label>
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="authorName">Je naam *</Label>
        <Input
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Voornaam"
          maxLength={100}
        />
      </div>

      <div>
        <Label htmlFor="reviewText">Je review (optioneel)</Label>
        <Textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Vertel over je ervaring..."
          rows={4}
          maxLength={1000}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Verzenden..." : "Review plaatsen"}
      </Button>
    </form>
  );
};
