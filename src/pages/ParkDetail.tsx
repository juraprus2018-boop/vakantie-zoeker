import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { parksApi } from "@/lib/api/parks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const ParkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: park, isLoading, error } = useQuery({
    queryKey: ["park", id],
    queryFn: () => parksApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4" />
            <div className="aspect-video bg-muted rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !park) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Park niet gevonden</h1>
          <p className="text-muted-foreground mb-6">
            Dit vakantiepark bestaat niet of is niet meer beschikbaar.
          </p>
          <Link to="/zoeken">
            <Button>Terug naar zoeken</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const displayRating = park.google_rating ? Number(park.google_rating).toFixed(1) : null;
  const photos = park.photos || [];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/zoeken" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Terug naar zoeken
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{park.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{park.city || park.province || "Nederland"}</span>
                </div>
                {displayRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{displayRating}</span>
                    {park.google_ratings_total && (
                      <span className="text-sm">({park.google_ratings_total} reviews)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {park.park_type && (
              <Badge variant="secondary" className="capitalize text-sm">
                {park.park_type}
              </Badge>
            )}
          </div>
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 ? (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden bg-muted">
            <img
              src={photos[currentPhotoIndex].photo_url}
              alt={park.name}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPhotoIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="aspect-video mb-8 rounded-lg bg-muted flex items-center justify-center">
            <MapPin className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {park.description && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Over dit park</h2>
                <p className="text-muted-foreground whitespace-pre-line">{park.description}</p>
              </section>
            )}

            {/* Facilities */}
            {park.facilities && park.facilities.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Faciliteiten</h2>
                <div className="flex flex-wrap gap-2">
                  {park.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Reviews
                {park.reviews.length > 0 && (
                  <span className="text-muted-foreground font-normal ml-2">
                    ({park.reviews.length})
                  </span>
                )}
              </h2>

              {park.reviews.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {park.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mb-8">
                  Nog geen reviews. Wees de eerste!
                </p>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plaats een review</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewForm
                    parkId={park.id}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["park", id] });
                    }}
                  />
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contactgegevens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {park.address && (
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="text-sm">{park.address}</span>
                  </div>
                )}
                {park.phone && (
                  <div className="flex gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                    <a href={`tel:${park.phone}`} className="text-sm hover:underline">
                      {park.phone}
                    </a>
                  </div>
                )}
                {park.website && (
                  <div className="flex gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                    <a
                      href={park.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Website bezoeken
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Opening Hours */}
            {park.opening_hours && Array.isArray(park.opening_hours) && park.opening_hours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Openingstijden
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {(park.opening_hours as string[]).map((hours, index) => (
                      <li key={index} className="text-muted-foreground">
                        {hours}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ParkDetail;
