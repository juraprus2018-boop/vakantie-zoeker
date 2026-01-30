import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/search/SearchBar";
import { ParkCard } from "@/components/parks/ParkCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parksApi, reviewsApi, Park, Review } from "@/lib/api/parks";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Tent, Home, Sparkles, Trees, ArrowRight } from "lucide-react";

const parkTypes = [
  { id: "camping", label: "Campings", icon: Tent },
  { id: "bungalowpark", label: "Bungalowparken", icon: Home },
  { id: "glamping", label: "Glamping", icon: Sparkles },
  { id: "vakantiepark", label: "Vakantieparken", icon: Trees },
];

const Index = () => {
  const { data: featuredParks = [], isLoading: parksLoading } = useQuery({
    queryKey: ["parks", "featured"],
    queryFn: () => parksApi.getFeatured(),
  });

  const { data: recentReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", "recent"],
    queryFn: () => reviewsApi.getRecent(4),
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Ontdek de mooiste
              <span className="text-primary block">vakantieparken van Nederland</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Van gezellige campings tot luxe bungalowparken - vind jouw perfecte vakantiebestemming
            </p>
            <SearchBar className="max-w-xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {parkTypes.map(({ id, label, icon: Icon }) => (
              <Link key={id} to={`/zoeken?type=${id}`}>
                <Button variant="outline" size="lg" className="gap-2">
                  <Icon className="h-5 w-5" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Parks */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Uitgelichte parken</h2>
              <p className="text-muted-foreground mt-1">Populaire bestemmingen in Nederland</p>
            </div>
            <Link to="/zoeken">
              <Button variant="ghost" className="gap-1">
                Bekijk alles <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {parksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredParks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredParks.map((park) => (
                <ParkCard key={park.id} park={park} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nog geen parken beschikbaar</p>
              <p className="text-sm text-muted-foreground mt-1">Parken worden binnenkort toegevoegd</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Recente reviews</h2>
            <p className="text-muted-foreground text-center mb-8">Wat anderen vinden van hun vakantie</p>

            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-4 bg-background rounded-lg">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            ) : recentReviews.length > 0 ? (
              <div className="bg-background rounded-lg p-6 space-y-4">
                {recentReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} showParkName />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-background rounded-lg">
                <p className="text-muted-foreground">Nog geen reviews beschikbaar</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Klaar voor je volgende avontuur?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Verken alle vakantieparken op de kaart en vind de perfecte locatie voor jouw vakantie
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/zoeken">
                <Button size="lg">Alle parken bekijken</Button>
              </Link>
              <Link to="/kaart">
                <Button size="lg" variant="outline" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Bekijk op kaart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
