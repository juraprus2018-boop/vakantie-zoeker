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

const Map = () => {
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);

  const { data: parks = [], isLoading } = useQuery({
    queryKey: ["parks", "all"],
    queryFn: () => parksApi.getAll(),
  });

  // Group parks by province for the sidebar
  const parksByProvince = parks.reduce((acc, park) => {
    const province = park.province || "Overig";
    if (!acc[province]) acc[province] = [];
    acc[province].push(park);
    return acc;
  }, {} as Record<string, Park[]>);

  return (
    <Layout>
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
                className="h-full w-full"
                onMarkerClick={(park) => setSelectedPark(park)}
              />
            )}

            {/* Selected Park Card - Mobile overlay */}
            {selectedPark && (
              <div className="absolute bottom-4 left-4 right-4 lg:hidden z-[1000]">
                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
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
                      <Link to={`/park/${selectedPark.id}`}>
                        <Button size="sm">Bekijk</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar - Province list */}
          <div className="w-full lg:w-80 bg-background border-t lg:border-t-0 lg:border-l overflow-y-auto max-h-64 lg:max-h-none">
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <h1 className="text-xl font-bold">Vakantieparken</h1>
              <p className="text-sm text-muted-foreground">
                {parks.length} parken in Nederland
              </p>
            </div>

            <div className="divide-y">
              {Object.entries(parksByProvince)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([province, provinceParks]) => (
                  <div key={province} className="p-4">
                    <h2 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {province}
                      <Badge variant="secondary" className="text-xs">
                        {provinceParks.length}
                      </Badge>
                    </h2>
                    <ul className="space-y-1">
                      {provinceParks.slice(0, 5).map((park) => (
                        <li key={park.id}>
                          <Link
                            to={`/park/${park.id}`}
                            className="text-sm hover:text-primary transition-colors flex items-center justify-between py-1"
                          >
                            <span className="truncate pr-2">{park.name}</span>
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
