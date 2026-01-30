import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/search/SearchBar";
import { ParkCard } from "@/components/parks/ParkCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { parksApi, Park } from "@/lib/api/parks";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Filter, X } from "lucide-react";

const parkTypes = [
  { value: "camping", label: "Camping" },
  { value: "bungalowpark", label: "Bungalowpark" },
  { value: "glamping", label: "Glamping" },
  { value: "vakantiepark", label: "Vakantiepark" },
  { value: "resort", label: "Resort" },
];

const provinces = [
  "Drenthe",
  "Flevoland",
  "Friesland",
  "Gelderland",
  "Groningen",
  "Limburg",
  "Noord-Brabant",
  "Noord-Holland",
  "Overijssel",
  "Utrecht",
  "Zeeland",
  "Zuid-Holland",
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || "";
  const provinceFilter = searchParams.get("province") || "";

  const { data: parks = [], isLoading } = useQuery({
    queryKey: ["parks", searchQuery, typeFilter, provinceFilter],
    queryFn: () =>
      parksApi.getAll({
        search: searchQuery || undefined,
        parkType: typeFilter || undefined,
        province: provinceFilter || undefined,
      }),
  });

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || typeFilter || provinceFilter;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Zoek vakantieparken</h1>
          <SearchBar onSearch={(q) => updateFilter("q", q)} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                Filters wissen
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="mb-2 block">Type park</Label>
                <Select value={typeFilter} onValueChange={(v) => updateFilter("type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle types</SelectItem>
                    {parkTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Provincie</Label>
                <Select value={provinceFilter} onValueChange={(v) => updateFilter("province", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle provincies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle provincies</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <Button variant="secondary" size="sm" onClick={() => updateFilter("q", "")}>
                Zoekterm: {searchQuery} <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            {typeFilter && (
              <Button variant="secondary" size="sm" onClick={() => updateFilter("type", "")}>
                Type: {parkTypes.find((t) => t.value === typeFilter)?.label} <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            {provinceFilter && (
              <Button variant="secondary" size="sm" onClick={() => updateFilter("province", "")}>
                Provincie: {provinceFilter} <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          {isLoading ? "Zoeken..." : `${parks.length} parken gevonden`}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : parks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parks.map((park) => (
              <ParkCard key={park.id} park={park} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Geen parken gevonden</p>
            <p className="text-muted-foreground mb-4">
              Probeer andere zoektermen of filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Filters wissen
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
