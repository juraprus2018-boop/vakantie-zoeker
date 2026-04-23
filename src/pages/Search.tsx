import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/search/SearchBar";
import { ParkCard } from "@/components/parks/ParkCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parksApi, Park } from "@/lib/api/parks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, SlidersHorizontal, X, Search as SearchIcon } from "lucide-react";
import { useParkPhotos } from "@/hooks/useParkPhotos";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getBreadcrumbSchema, getItemListSchema } from "@/components/seo/JsonLd";

const parkTypeLabels: Record<string, string> = {
  camping: "Camping",
  vakantiepark: "Vakantiepark",
  bungalowpark: "Bungalowpark",
  glamping: "Glamping",
  resort: "Resort",
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  // Get initial values from URL
  const initialSearch = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";
  const initialProvince = searchParams.get("province") || "";

  const [filters, setFilters] = useState({
    search: initialSearch,
    parkType: initialType,
    province: initialProvince,
    minRating: 0,
  });

  // Update filters when URL changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get("q") || "",
      parkType: searchParams.get("type") || "all",
      province: searchParams.get("province") || "",
    }));
    setLocationSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const { data: parks = [], isLoading } = useQuery({
    queryKey: ["parks", "search", filters],
    queryFn: () =>
      parksApi.getAll({
        search: filters.search || undefined,
        parkType: filters.parkType !== "all" ? filters.parkType : undefined,
        province: filters.province || undefined,
        minRating: filters.minRating || undefined,
      }),
  });

  // Fetch only available provinces and types from existing visible parks
  const { data: availableOptions } = useQuery({
    queryKey: ["search", "available-filters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parks")
        .select("province, park_type")
        .eq("is_visible", true);
      if (error) throw error;
      const provinces = Array.from(
        new Set((data || []).map((p) => p.province).filter(Boolean) as string[])
      ).sort();
      const types = Array.from(
        new Set((data || []).map((p) => p.park_type).filter(Boolean) as string[])
      ).sort();
      return { provinces, types };
    },
  });

  const provinces = availableOptions?.provinces || [];
  const parkTypeOptions = [
    { value: "all", label: "Alle types" },
    ...(availableOptions?.types || []).map((t) => ({
      value: t,
      label: parkTypeLabels[t] || t,
    })),
  ];

  const parkIds = parks.map((p) => p.id);
  const { data: photosByPark = {} } = useParkPhotos(parkIds);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set("q", query);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(locationSearch);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    
    const newParams = new URLSearchParams(searchParams);
    if (key === "parkType") {
      if (value && value !== "all") {
        newParams.set("type", value as string);
      } else {
        newParams.delete("type");
      }
    }
    if (key === "province") {
      if (value) {
        newParams.set("province", value as string);
      } else {
        newParams.delete("province");
      }
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      parkType: "all",
      province: "",
      minRating: 0,
    });
    setLocationSearch("");
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    filters.search || filters.parkType !== "all" || filters.province || filters.minRating > 0;

  const baseUrl = "https://vakantielach.nl";
  const seoTitle = filters.search
    ? `${filters.search} — campings & vakantieparken | Vakantielach`
    : filters.province && filters.parkType !== "all"
    ? `${parkTypeOptions.find((o) => o.value === filters.parkType)?.label} in ${filters.province} | Vakantielach`
    : filters.province
    ? `Campings & vakantieparken in ${filters.province} | Vakantielach`
    : filters.parkType !== "all"
    ? `${parkTypeOptions.find((o) => o.value === filters.parkType)?.label} in Nederland | Vakantielach`
    : "Zoek campings & vakantieparken in Nederland | Vakantielach";

  return (
    <Layout>
      <SEOHead
        title={seoTitle}
        description={`Vind en vergelijk ${parks.length || "honderden"} vakantieparken, campings en bungalowparken in Nederland. Filter op type, provincie en beoordeling.`}
        canonical={`${baseUrl}/zoeken`}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "Zoeken", url: `${baseUrl}/zoeken` },
        ])}
      />
      {parks.length > 0 && <JsonLd data={getItemListSchema(parks, baseUrl)} />}

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Zoek vakantieparken in Nederland</h1>
          <p className="text-muted-foreground">
            Vind het perfecte vakantiepark, camping of bungalowpark voor jouw vakantie
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Location Search */}
          <form onSubmit={handleLocationSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Zoek op locatie, stad of parknaam..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Zoeken</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </form>

          {/* Filter Panel */}
          {showFilters && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="parkType">Type park</Label>
                  <Select
                    value={filters.parkType}
                    onValueChange={(value) => handleFilterChange("parkType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle types" />
                    </SelectTrigger>
                    <SelectContent>
                      {parkTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="province">Provincie</Label>
                  <Select
                    value={filters.province || "all"}
                    onValueChange={(value) => handleFilterChange("province", value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle provincies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle provincies</SelectItem>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minRating">Minimale beoordeling</Label>
                  <Select
                    value={String(filters.minRating)}
                    onValueChange={(value) => handleFilterChange("minRating", Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle beoordelingen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Alle beoordelingen</SelectItem>
                      <SelectItem value="3">★★★ 3.0+</SelectItem>
                      <SelectItem value="3.5">★★★½ 3.5+</SelectItem>
                      <SelectItem value="4">★★★★ 4.0+</SelectItem>
                      <SelectItem value="4.5">★★★★½ 4.5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {parks.length} resultaten gevonden
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Filters wissen
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
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
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {parks.length} parken gevonden
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parks.map((park) => (
                <ParkCard key={park.id} park={park} photoUrl={photosByPark[park.id]} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">Geen parken gevonden</h2>
            <p className="text-muted-foreground mb-4">
              Probeer andere zoektermen of filters
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Filters wissen
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
