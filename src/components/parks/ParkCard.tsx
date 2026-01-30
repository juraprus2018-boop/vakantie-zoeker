import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { Park } from "@/lib/api/parks";

interface ParkCardProps {
  park: Park;
  photoUrl?: string;
}

export const ParkCard = ({ park, photoUrl }: ParkCardProps) => {
  const displayRating = park.google_rating ? Number(park.google_rating).toFixed(1) : null;

  return (
    <Link to={`/park/${park.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={park.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {park.is_featured && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              Uitgelicht
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {park.name}
            </h3>
            {displayRating && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{displayRating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{park.city || park.province || "Nederland"}</span>
          </div>
          {park.park_type && (
            <Badge variant="outline" className="mt-2 capitalize">
              {park.park_type}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
