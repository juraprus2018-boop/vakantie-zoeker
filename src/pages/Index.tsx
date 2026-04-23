import { Link } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/search/SearchBar";
import { ParkCard } from "@/components/parks/ParkCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ParkMap } from "@/components/map/ParkMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parksApi, reviewsApi, Park } from "@/lib/api/parks";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Tent, Home, Sparkles, Trees, ArrowRight, Star, ChevronRight } from "lucide-react";
import { useParkPhotos } from "@/hooks/useParkPhotos";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getWebsiteSchema, getOrganizationSchema, getFaqSchema } from "@/components/seo/JsonLd";

const parkTypes = [
  { id: "camping", label: "Campings", icon: Tent },
  { id: "bungalowpark", label: "Bungalowparken", icon: Home },
  { id: "glamping", label: "Glamping", icon: Sparkles },
  { id: "vakantiepark", label: "Vakantieparken", icon: Trees },
];

const provinces = [
  { slug: "drenthe", name: "Drenthe" },
  { slug: "flevoland", name: "Flevoland" },
  { slug: "friesland", name: "Friesland" },
  { slug: "gelderland", name: "Gelderland" },
  { slug: "groningen", name: "Groningen" },
  { slug: "limburg", name: "Limburg" },
  { slug: "noord-brabant", name: "Noord-Brabant" },
  { slug: "noord-holland", name: "Noord-Holland" },
  { slug: "overijssel", name: "Overijssel" },
  { slug: "utrecht", name: "Utrecht" },
  { slug: "zeeland", name: "Zeeland" },
  { slug: "zuid-holland", name: "Zuid-Holland" },
];

const homeFaqs = [
  {
    question: "Wat is Vakantielach?",
    answer: "Vakantielach is dé Nederlandse gids voor campings, vakantieparken, bungalowparken en glamping. Je vindt hier alle parken op één plek met foto's, beoordelingen en directe links naar de officiële websites.",
  },
  {
    question: "Hoe vind ik een camping in een specifieke plaats?",
    answer: "Gebruik de zoekbalk bovenaan en typ de plaatsnaam in (bijvoorbeeld 'Renesse' of 'Texel'), of bezoek een provincie- of plaats-pagina via het menu. Op de kaart kun je ook visueel zoeken.",
  },
  {
    question: "Is Vakantielach gratis te gebruiken?",
    answer: "Ja, Vakantielach is volledig gratis. We zijn een onafhankelijke gids en je boekt direct bij het park zelf via de officiële website.",
  },
  {
    question: "Kan ik zelf een review plaatsen?",
    answer: "Ja, op elke parkpagina kun je zonder account een review achterlaten. Reviews worden gemodereerd om kwaliteit te garanderen.",
  },
  {
    question: "Ben ik eigenaar van een park — kan ik mijn park toevoegen?",
    answer: "Ja, ga naar de pagina 'Voor eigenaren' om je park gratis aan te melden of om een bestaande vermelding te claimen.",
  },
];

const Index = () => {
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);

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
  const allParkIds = allParks.map((p) => p.id);
  const { data: photosByPark = {} } = useParkPhotos([...new Set([...featuredParkIds, ...allParkIds])]);

  return (
    <Layout>
      <SEOHead
        title="Vakantielach | Campings, vakantieparken & bungalowparken in Nederland"
        description="Vind de beste campings, vakantieparken, bungalowparken en glamping in Nederland. Zoek op plaats, provincie of parknaam — met foto's, reviews en directe links."
        canonical="https://vakantielach.nl/"
        ogImage="/og-image.jpg"
      />
      <JsonLd data={getWebsiteSchema()} />
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getFaqSchema(homeFaqs)} />
      
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
              Vind jouw perfecte
              <span className="block text-white/90">camping of vakantiepark</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 drop-shadow">
              Vakantielach toont alle campings, vakantieparken en bungalowparken van Nederland — zoek op plaats of parknaam
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
        <div className="container px-0 md:px-8">
          <div className="text-center mb-8 px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl font-bold">Ontdek op de kaart</h2>
            <p className="text-muted-foreground mt-1">Klik op een marker voor parkdetails</p>
          </div>

          {allParksLoading ? (
            <div className="h-[450px] md:h-[550px] bg-muted md:rounded-xl animate-pulse" />
          ) : allParks.length > 0 ? (
            <div className="relative md:rounded-xl overflow-hidden shadow-lg md:border">
              <ParkMap
                parks={allParks}
                photosByPark={photosByPark}
                className="h-[450px] md:h-[550px] w-full"
                onMarkerClick={(park) => setSelectedPark(park)}
              />

              {/* Selected Park Card - Mobile overlay (same as /kaart) */}
              {selectedPark && (
                <div className="absolute bottom-4 left-4 right-4 lg:hidden z-[1000]">
                  <Card className="shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {photosByPark[selectedPark.id] && (
                          <img
                            src={photosByPark[selectedPark.id]}
                            alt={selectedPark.name}
                            className="w-20 h-16 object-cover rounded-lg shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{selectedPark.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedPark.city || selectedPark.province}
                          </p>
                          {selectedPark.google_rating && (
                            <div className="flex items-center gap-1 mt-1 text-sm">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{Number(selectedPark.google_rating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Link to={`/park/${selectedPark.id}`} className="block mt-3">
                        <Button className="w-full">Bekijk park</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px] bg-muted md:rounded-xl flex items-center justify-center mx-4 md:mx-0">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nog geen parken beschikbaar</p>
              </div>
            </div>
          )}

          <div className="text-center mt-6 px-4 md:px-0">
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
