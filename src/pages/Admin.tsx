import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { googlePlacesApi, PlaceSearchResult } from "@/lib/api/google-places";
import { parksApi, Park } from "@/lib/api/parks";
import { ParkEditDialog } from "@/components/admin/ParkEditDialog";
import { UserApprovalSection } from "@/components/admin/UserApprovalSection";
import { ParkApprovalSection } from "@/components/admin/ParkApprovalSection";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Star, Trash2, Eye, EyeOff, Plus, RefreshCw, Pencil, Image } from "lucide-react";

const parkTypeOptions = [
  { value: "camping", label: "Camping" },
  { value: "vakantiepark", label: "Vakantiepark" },
  { value: "bungalowpark", label: "Bungalowpark" },
  { value: "glamping", label: "Glamping" },
  { value: "resort", label: "Resort" },
];

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Google Places Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("vakantiepark");
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  // Edit state
  const [editingPark, setEditingPark] = useState<Park | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch existing parks
  const { data: parks = [], isLoading: parksLoading, refetch: refetchParks } = useQuery({
    queryKey: ["admin", "parks"],
    queryFn: async () => {
      const { data, error } = await (await import("@/integrations/supabase/client")).supabase
        .from("parks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Park[];
    },
    enabled: isAdmin,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedPlaces(new Set());

    try {
      const results = await googlePlacesApi.search(searchQuery, searchType);
      setSearchResults(results);
      if (results.length === 0) {
        toast({ title: "Geen resultaten gevonden" });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Zoeken mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const togglePlaceSelection = (placeId: string) => {
    const newSelection = new Set(selectedPlaces);
    if (newSelection.has(placeId)) {
      newSelection.delete(placeId);
    } else {
      newSelection.add(placeId);
    }
    setSelectedPlaces(newSelection);
  };

  const handleImport = async () => {
    if (selectedPlaces.size === 0) return;

    setIsImporting(true);
    let imported = 0;
    let skipped = 0;

    try {
      const totalPlaces = selectedPlaces.size;
      let current = 0;

      for (const placeId of selectedPlaces) {
        current++;
        
        // Check if already exists
        const existing = parks.find((p) => p.google_place_id === placeId);
        if (existing) {
          skipped++;
          continue;
        }

        setImportProgress(`Importeren ${current}/${totalPlaces}...`);

        // Get full details (includes AI-categorized park_type)
        const details = await googlePlacesApi.getDetails(placeId);

        // Create park with AI-determined category
        const park = await parksApi.create({
          google_place_id: details.place_id,
          name: details.name,
          address: details.address,
          city: details.city,
          province: details.province,
          postal_code: details.postal_code,
          latitude: details.latitude,
          longitude: details.longitude,
          google_rating: details.rating,
          google_ratings_total: details.ratings_total,
          website: details.website,
          phone: details.phone,
          opening_hours: details.opening_hours,
          park_type: (details.park_type || "vakantiepark") as any,
        });

        // Download and save photos to storage
        setImportProgress(`Foto's downloaden ${current}/${totalPlaces}...`);
        for (const photo of details.photos.slice(0, 5)) {
          try {
            const photoUrl = await googlePlacesApi.downloadPhoto(photo.photo_reference, park.id);
            await parksApi.addPhoto(park.id, photoUrl, photo.photo_reference, true);
          } catch (photoError) {
            console.error("Error downloading photo:", photoError);
            // Continue with next photo if one fails
          }
        }

        imported++;
      }

      toast({
        title: `${imported} parken geïmporteerd`,
        description: skipped > 0 ? `${skipped} parken overgeslagen (bestonden al)` : undefined,
      });

      setSearchResults([]);
      setSelectedPlaces(new Set());
      refetchParks();
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Importeren mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  const handleToggleVisibility = async (park: Park) => {
    try {
      await parksApi.update(park.id, { is_visible: !park.is_visible });
      toast({ title: park.is_visible ? "Park verborgen" : "Park zichtbaar gemaakt" });
      refetchParks();
    } catch (error: any) {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleFeatured = async (park: Park) => {
    try {
      await parksApi.update(park.id, { is_featured: !park.is_featured });
      toast({ title: park.is_featured ? "Niet meer uitgelicht" : "Park uitgelicht" });
      refetchParks();
    } catch (error: any) {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (park: Park) => {
    if (!confirm(`Weet je zeker dat je "${park.name}" wilt verwijderen?`)) return;

    try {
      await parksApi.delete(park.id);
      toast({ title: "Park verwijderd" });
      refetchParks();
    } catch (error: any) {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (park: Park) => {
    setEditingPark(park);
    setIsEditDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Beheer vakantieparken en reviews</p>
        </div>

        <Tabs defaultValue="approvals">
          <TabsList className="mb-6">
            <TabsTrigger value="approvals">Goedkeuringen</TabsTrigger>
            <TabsTrigger value="import">Importeren</TabsTrigger>
            <TabsTrigger value="parks">Parken ({parks.length})</TabsTrigger>
          </TabsList>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <UserApprovalSection />
            <ParkApprovalSection />
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Parken importeren via Google Places
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="searchQuery">Zoek locatie</Label>
                      <Input
                        id="searchQuery"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Bijv. Veluwe, Noord-Holland, Texel..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="searchType">Type</Label>
                      <Select value={searchType} onValueChange={setSearchType}>
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>
                  <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                    {isSearching ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Zoeken...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Zoeken
                      </>
                    )}
                  </Button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {searchResults.length} resultaten gevonden
                      </p>
                      <Button
                        onClick={handleImport}
                        disabled={selectedPlaces.size === 0 || isImporting}
                      >
                        {isImporting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {importProgress || "Importeren..."}
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Importeer {selectedPlaces.size} geselecteerd
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                      {searchResults.map((place) => {
                        const alreadyExists = parks.some((p) => p.google_place_id === place.place_id);
                        return (
                          <div
                            key={place.place_id}
                            className={`p-4 flex items-start gap-4 ${
                              alreadyExists ? "bg-muted/50 opacity-60" : ""
                            }`}
                          >
                            <Checkbox
                              checked={selectedPlaces.has(place.place_id)}
                              onCheckedChange={() => togglePlaceSelection(place.place_id)}
                              disabled={alreadyExists}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{place.name}</span>
                                {alreadyExists && (
                                  <Badge variant="secondary" className="text-xs">
                                    Al geïmporteerd
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {place.address}
                                </span>
                                {place.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {place.rating} ({place.ratings_total})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parks Tab */}
          <TabsContent value="parks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Alle parken</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchParks()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Vernieuwen
                </Button>
              </CardHeader>
              <CardContent>
                {parksLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : parks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nog geen parken geïmporteerd</p>
                    <p className="text-sm mt-1">
                      Gebruik de import tool om parken toe te voegen
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y">
                    {parks.map((park) => (
                      <div key={park.id} className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/park/${park.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {park.name}
                            </Link>
                            {park.is_featured && (
                              <Badge variant="default" className="text-xs">
                                Uitgelicht
                              </Badge>
                            )}
                            {!park.is_visible && (
                              <Badge variant="secondary" className="text-xs">
                                Verborgen
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {park.city || park.province || "Nederland"} • {park.park_type}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(park)}
                            title="Bewerken"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFeatured(park)}
                            title={park.is_featured ? "Niet meer uitlichten" : "Uitlichten"}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                park.is_featured ? "fill-yellow-400 text-yellow-400" : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleVisibility(park)}
                            title={park.is_visible ? "Verbergen" : "Zichtbaar maken"}
                          >
                            {park.is_visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(park)}
                            className="text-destructive hover:text-destructive"
                            title="Verwijderen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <ParkEditDialog
        park={editingPark}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={() => refetchParks()}
      />
    </Layout>
  );
};

export default Admin;
