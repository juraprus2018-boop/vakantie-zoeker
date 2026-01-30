import { Layout } from "@/components/layout/Layout";
import { parksApi, Park } from "@/lib/api/parks";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Map = () => {
  const { data: parks = [], isLoading } = useQuery({
    queryKey: ["parks", "all"],
    queryFn: () => parksApi.getAll(),
  });

  // Group parks by province for the list view
  const parksByProvince = parks.reduce((acc, park) => {
    const province = park.province || "Overig";
    if (!acc[province]) acc[province] = [];
    acc[province].push(park);
    return acc;
  }, {} as Record<string, Park[]>);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kaart van Nederland</h1>
          <p className="text-muted-foreground">
            Bekijk alle vakantieparken per provincie
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse p-4 border rounded-lg">
                <div className="h-5 bg-muted rounded w-1/3 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : parks.length === 0 ? (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Nog geen parken beschikbaar</p>
            <p className="text-muted-foreground">
              Parken worden binnenkort toegevoegd
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(parksByProvince)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([province, provinceParks]) => (
                <div key={province} className="border rounded-lg p-4">
                  <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {province}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({provinceParks.length})
                    </span>
                  </h2>
                  <ul className="space-y-2">
                    {provinceParks.slice(0, 5).map((park) => (
                      <li key={park.id}>
                        <Link
                          to={`/park/${park.id}`}
                          className="text-sm hover:text-primary transition-colors flex items-center justify-between"
                        >
                          <span className="line-clamp-1">{park.name}</span>
                          {park.google_rating && (
                            <span className="text-muted-foreground shrink-0 ml-2">
                              ★ {Number(park.google_rating).toFixed(1)}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                    {provinceParks.length > 5 && (
                      <li>
                        <Link
                          to={`/zoeken?province=${encodeURIComponent(province)}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Bekijk alle {provinceParks.length} parken
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
          </div>
        )}

        {/* Map placeholder - in a real app you'd integrate Leaflet or Google Maps */}
        <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Interactieve kaart met markers voor alle parken
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            (Wordt later toegevoegd met Leaflet of Google Maps)
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Map;
