import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { googlePlacesApi, PlaceSearchResult } from "@/lib/api/google-places";
import { parksApi, Park } from "@/lib/api/parks";
import { ParkEditDialog } from "@/components/admin/ParkEditDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  MapPin, 
  Star, 
  RefreshCw, 
  Building2,
  Edit,
  ExternalLink,
  LogOut
} from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  is_approved: boolean;
}

const OwnerDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [existingPlaceIds, setExistingPlaceIds] = useState<Set<string>>(new Set());
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  // Edit state
  const [editingPark, setEditingPark] = useState<Park | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Check authentication and fetch profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      setUser(session.user);

      // Fetch profile with is_approved status
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!error && profileData) {
        setProfile(profileData as Profile);
      }

      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch owner's park
  const { data: myPark, isLoading: parkLoading, refetch: refetchPark } = useQuery({
    queryKey: ["owner", "park", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("parks")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Park | null;
    },
    enabled: !!user && !!profile?.is_approved,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedPlace(null);
    setExistingPlaceIds(new Set());

    try {
      const results = await googlePlacesApi.search(searchQuery, "vakantiepark");
      
      // Check which parks already exist in database
      if (results.length > 0) {
        const placeIds = results.map(r => r.place_id);
        const { data: existingParks } = await supabase
          .from("parks")
          .select("google_place_id")
          .in("google_place_id", placeIds);
        
        if (existingParks) {
          setExistingPlaceIds(new Set(existingParks.map(p => p.google_place_id).filter(Boolean) as string[]));
        }
      }
      
      setSearchResults(results);
      if (results.length === 0) {
        toast({ title: "Geen resultaten gevonden", description: "Probeer een andere zoekterm." });
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

  const handleImport = async () => {
    if (!selectedPlace || !user) return;

    setIsImporting(true);

    try {
      setImportProgress("Gegevens ophalen...");
      const details = await googlePlacesApi.getDetails(selectedPlace);

      setImportProgress("Park aanmaken...");
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
        owner_id: user.id,
        is_visible: false, // Hidden until admin approves
        is_pending: true,  // Mark as pending approval
      });

      // Download and save photos
      setImportProgress("Foto's downloaden...");
      for (const photo of details.photos.slice(0, 5)) {
        try {
          const photoUrl = await googlePlacesApi.downloadPhoto(photo.photo_reference, park.id);
          await parksApi.addPhoto(park.id, photoUrl, photo.photo_reference, true);
        } catch (photoError) {
          console.error("Error downloading photo:", photoError);
        }
      }

      toast({
        title: "Park toegevoegd!",
        description: "Uw vermelding wacht nu op goedkeuring door een beheerder.",
      });

      setSearchResults([]);
      setSelectedPlace(null);
      refetchPark();
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Toevoegen mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/eigenaar/login" replace />;
  }

  // Status: Account not approved yet
  if (!profile?.is_approved) {
    return (
      <Layout>
        <div className="container py-16">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Account in afwachting</h1>
              <p className="text-muted-foreground mb-6">
                Uw account is aangemaakt en wacht op goedkeuring door een beheerder. 
                Dit duurt meestal 1-2 werkdagen. U ontvangt bericht zodra uw account is geactiveerd.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Status vernieuwen
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Uitloggen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Status: Has a park already
  if (myPark) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Mijn vakantiepark</h1>
              <p className="text-muted-foreground mt-1">Beheer uw vermelding</p>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {myPark.name}
                    {myPark.is_pending && (
                      <Badge variant="secondary" className="font-normal">
                        <Clock className="h-3 w-3 mr-1" />
                        Wacht op goedkeuring
                      </Badge>
                    )}
                    {!myPark.is_pending && myPark.is_visible && (
                      <Badge variant="default" className="font-normal bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Actief
                      </Badge>
                    )}
                    {!myPark.is_pending && !myPark.is_visible && (
                      <Badge variant="secondary" className="font-normal">
                        <XCircle className="h-3 w-3 mr-1" />
                        Verborgen
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {myPark.city}, {myPark.province}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {myPark.is_visible && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/park/${myPark.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Bekijken
                      </Link>
                    </Button>
                  )}
                  {!myPark.is_pending && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setEditingPark(myPark);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bewerken
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {myPark.is_pending ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    Uw vermelding is ingediend en wacht op goedkeuring door een beheerder. 
                    Na goedkeuring wordt uw park zichtbaar op de website en kunt u de gegevens bewerken.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Gegevens</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Type:</dt>
                        <dd className="capitalize">{myPark.park_type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Adres:</dt>
                        <dd>{myPark.address}</dd>
                      </div>
                      {myPark.google_rating && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Google Rating:</dt>
                          <dd className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {myPark.google_rating}
                          </dd>
                        </div>
                      )}
                      {myPark.website && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Website:</dt>
                          <dd>
                            <a 
                              href={myPark.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Bekijken
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Beschrijving</h4>
                    <p className="text-sm text-muted-foreground">
                      {myPark.description || "Nog geen beschrijving toegevoegd. Klik op 'Bewerken' om een beschrijving toe te voegen."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <ParkEditDialog
            park={editingPark}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={() => refetchPark()}
          />
        </div>
      </Layout>
    );
  }

  // Status: Approved but no park yet - show search to add park
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Park toevoegen</h1>
            <p className="text-muted-foreground mt-1">
              Zoek uw vakantiepark op via adres om het toe te voegen
            </p>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Uitloggen
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Zoek uw bedrijf
            </CardTitle>
            <CardDescription>
              Zoek op naam of adres van uw vakantiepark. De gegevens worden automatisch 
              geïmporteerd van Google Places.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4 mb-6">
              <div>
                <Label htmlFor="searchQuery">Zoekterm</Label>
                <Input
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bijv. Camping De Bosrand, Vaassen"
                />
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
                <p className="text-sm text-muted-foreground">
                  Selecteer uw bedrijf uit de resultaten:
                </p>

                <div className="border rounded-lg divide-y">
                  {searchResults.map((place) => {
                    const alreadyExists = existingPlaceIds.has(place.place_id);
                    return (
                      <div
                        key={place.place_id}
                        className={`p-4 flex items-start gap-4 transition-colors ${
                          alreadyExists 
                            ? "bg-muted/50 opacity-60 cursor-not-allowed" 
                            : `cursor-pointer hover:bg-muted/50 ${selectedPlace === place.place_id ? "bg-primary/5 border-l-4 border-l-primary" : ""}`
                        }`}
                        onClick={() => !alreadyExists && setSelectedPlace(place.place_id)}
                      >
                        <Checkbox
                          checked={selectedPlace === place.place_id}
                          onCheckedChange={() => !alreadyExists && setSelectedPlace(place.place_id)}
                          disabled={alreadyExists}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{place.name}</span>
                            {alreadyExists && (
                              <Badge variant="secondary" className="text-xs">
                                Al in gebruik
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
                                {place.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handleImport}
                  disabled={!selectedPlace || isImporting}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {importProgress || "Toevoegen..."}
                    </>
                  ) : (
                    "Geselecteerd park toevoegen"
                  )}
                </Button>
              </div>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Let op:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>U kunt maximaal 1 vakantiepark toevoegen</li>
                <li>Na toevoegen wordt uw vermelding gecontroleerd door een beheerder</li>
                <li>Pas na goedkeuring is uw park zichtbaar op de website</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OwnerDashboard;
