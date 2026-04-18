import { Layout } from "@/components/layout/Layout";
import { ParkMap } from "@/components/map/ParkMap";
import { parksApi, Park } from "@/lib/api/parks";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useParkPhotos } from "@/hooks/useParkPhotos";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getBreadcrumbSchema } from "@/components/seo/JsonLd";

const Map = () => {
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);

  const { data: parks = [], isLoading } = useQuery({
    queryKey: ["parks", "all"],
    queryFn: () => parksApi.getAll(),
  });

  // Fetch photos for all parks
  const parkIds = parks.map((p) => p.id);
  const { data: photosByPark = {} } = useParkPhotos(parkIds);

  // Group parks by province for the sidebar
  const parksByProvince = parks.reduce((acc, park) => {
    const province = park.province || "Overig";
    if (!acc[province]) acc[province] = [];
    acc[province].push(park);
    return acc;
  }, {} as Record<string, Park[]>);

  const baseUrl = "https://vakantieparken.nl";

  return (
    <Layout>
      <SEOHead
        title="Vakantieparken op de kaart | Vakantie Parken NL"
        description={`Bekijk alle ${parks.length || ""} vakantieparken, campings en bungalowparken van Nederland op een interactieve kaart. Vind direct een park in jouw favoriete regio.`}
        canonical={`${baseUrl}/kaart`}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "Kaart", url: `${baseUrl}/kaart` },
        ])}
      />
      <div className="h-[calc(100vh-4rem)]">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Map */}
          <div className="flex-1 relative">
            {isLoading ? (
              <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Kaart laden...</p>
                </div>
              </div>
            ) : parks.length === 0 ? (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Nog geen parken beschikbaar</p>
                  <p className="text-muted-foreground">
                    Parken worden binnenkort toegevoegd
                  </p>
                </div>
              </div>
            ) : (
              <ParkMap
                parks={parks}
                photosByPark={photosByPark}
                className="h-full w-full"
                onMarkerClick={(park) => setSelectedPark(park)}
              />
            )}

            {/* Selected Park Card - Mobile overlay */}
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

          {/* Sidebar - Province list */}
          <div className="w-full lg:w-96 bg-background border-t lg:border-t-0 lg:border-l overflow-y-auto max-h-64 lg:max-h-none">
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <h1 className="text-2xl font-bold">Vakantieparken</h1>
              <p className="text-sm text-muted-foreground">
                {parks.length} parken in Nederland
              </p>
            </div>

            <div className="divide-y">
              {Object.entries(parksByProvince)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([province, provinceParks]) => (
                  <div key={province} className="p-4">
                    <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {province}
                      <Badge variant="secondary" className="text-xs">
                        {provinceParks.length}
                      </Badge>
                    </h2>
                    <ul className="space-y-2">
                      {provinceParks.slice(0, 5).map((park) => (
                        <li key={park.id}>
                          <Link
                            to={`/park/${park.id}`}
                            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            {photosByPark[park.id] ? (
                              <img 
                                src={photosByPark[park.id]} 
                                alt={park.name}
                                className="w-14 h-10 object-cover rounded-md shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-10 bg-muted rounded-md shrink-0 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors">
                                {park.name}
                              </span>
                              {park.city && (
                                <span className="text-xs text-muted-foreground block">
                                  {park.city}
                                </span>
                              )}
                            </div>
                            {park.google_rating && (
                              <span className="text-muted-foreground shrink-0 text-xs flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {Number(park.google_rating).toFixed(1)}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                      {provinceParks.length > 5 && (
                        <li>
                          <Link
                            to={`/zoeken?province=${encodeURIComponent(province)}`}
                            className="text-sm text-primary hover:underline flex items-center gap-1 py-1"
                          >
                            +{provinceParks.length - 5} meer
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Map;
