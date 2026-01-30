import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/search/SearchBar";
import { ParkCard } from "@/components/parks/ParkCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ParkMap } from "@/components/map/ParkMap";
import { Button } from "@/components/ui/button";
import { parksApi, reviewsApi, Park } from "@/lib/api/parks";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Tent, Home, Sparkles, Trees, ArrowRight } from "lucide-react";
import { useParkPhotos } from "@/hooks/useParkPhotos";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getWebsiteSchema, getOrganizationSchema } from "@/components/seo/JsonLd";

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

  const { data: allParks = [], isLoading: allParksLoading } = useQuery({
    queryKey: ["parks", "all"],
    queryFn: () => parksApi.getAll(),
  });

  const { data: recentReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", "recent"],
    queryFn: () => reviewsApi.getRecent(4),
  });

  const featuredParkIds = featuredParks.map((p) => p.id);
  const { data: photosByPark = {} } = useParkPhotos(featuredParkIds);

  return (
    <Layout>
      <SEOHead
        title="Vakantie Parken NL | Ontdek de mooiste vakantieparken van Nederland"
        description="Vind en vergelijk de beste vakantieparken, campings, bungalowparken en glamping in Nederland. Bekijk reviews, foto's en boek direct."
        canonical="https://vakantieparken.nl"
      />
      <JsonLd data={getWebsiteSchema()} />
      <JsonLd data={getOrganizationSchema()} />
      
      {/* Hero Section with Background */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop')`,
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </div>

        {/* Content */}
        <div className="container relative z-10 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-lg">
              Ontdek de mooiste
              <span className="block text-white/90">vakantieparken van Nederland</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 drop-shadow">
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

      {/* Interactive Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Ontdek op de kaart</h2>
            <p className="text-muted-foreground mt-1">Bekijk alle vakantieparken in Nederland</p>
          </div>

          {allParksLoading ? (
            <div className="h-[500px] bg-muted rounded-lg animate-pulse" />
          ) : allParks.length > 0 ? (
            <div className="rounded-xl overflow-hidden shadow-lg border">
              <ParkMap parks={allParks} className="h-[500px]" />
            </div>
          ) : (
            <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nog geen parken beschikbaar</p>
              </div>
            </div>
          )}

          <div className="text-center mt-6">
            <Link to="/kaart">
              <Button variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" />
                Bekijk volledige kaart
              </Button>
            </Link>
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
                <ParkCard key={park.id} park={park} photoUrl={photosByPark[park.id]} />
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
