import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { PhotoSlider } from "@/components/parks/PhotoSlider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parksApi } from "@/lib/api/parks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getParkSchema, getBreadcrumbSchema } from "@/components/seo/JsonLd";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ChevronLeft,
  ExternalLink,
  Calendar,
} from "lucide-react";

const ParkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: park, isLoading, error } = useQuery({
    queryKey: ["park", id],
    queryFn: () => parksApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-[50vh] bg-muted" />
          <div className="container py-8">
            <div className="h-8 bg-muted rounded w-1/3 mb-4" />
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

  const baseUrl = "https://vakantieparken.nl";

  return (
    <Layout>
      <SEOHead
        title={`${park.name} | Vakantiepark in ${park.city || park.province || "Nederland"}`}
        description={park.description || `Bekijk ${park.name} in ${park.city || "Nederland"}. Reviews, foto's, faciliteiten en meer informatie.`}
        canonical={`${baseUrl}/park/${park.id}`}
        ogImage={photos[0]?.photo_url}
        ogType="place"
      />
      <JsonLd data={getParkSchema({ ...park, photos })} />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "Zoeken", url: `${baseUrl}/zoeken` },
          { name: park.name, url: `${baseUrl}/park/${park.id}` },
        ])}
      />
      
      {/* Hero Banner with Photo Slider */}
      <div className="relative">
        <PhotoSlider photos={photos} parkName={park.name} />
      </div>

      {/* Park Info Section - below slider on mobile */}
      <div className="bg-gradient-to-b from-muted/50 to-background border-b">
        <div className="container py-6">
          <Link 
            to="/zoeken" 
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 text-sm transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Terug naar zoeken
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {park.park_type && (
                  <Badge variant="secondary" className="capitalize">
                    {park.park_type}
                  </Badge>
                )}
                {displayRating && (
                  <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{displayRating}</span>
                    {park.google_ratings_total && (
                      <span className="text-muted-foreground">({park.google_ratings_total})</span>
                    )}
                  </div>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {park.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{park.city || park.province || "Nederland"}</span>
              </div>
            </div>
            
            {park.website && (
              <a
                href={park.website}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button size="lg" className="gap-2 w-full md:w-auto">
                  <Calendar className="h-5 w-5" />
                  Boeken / Website
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {park.description && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Over dit park</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {park.description}
                </p>
              </section>
            )}

            {/* Facilities */}
            {park.facilities && park.facilities.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Faciliteiten</h2>
                <div className="flex flex-wrap gap-2">
                  {park.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline" className="py-2 px-4">
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
            {/* Book CTA Card */}
            {park.website && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Interesse in dit park?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bekijk beschikbaarheid en prijzen op de website van het park.
                  </p>
                  <a
                    href={park.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full gap-2">
                      <Globe className="h-4 w-4" />
                      Ga naar website
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

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

            {/* Google Rating */}
            {displayRating && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
                      <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{displayRating}</div>
                      <div className="text-sm text-muted-foreground">
                        {park.google_ratings_total} Google reviews
                      </div>
                    </div>
                  </div>
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
