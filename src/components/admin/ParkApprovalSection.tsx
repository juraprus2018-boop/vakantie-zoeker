import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { parksApi, Park } from "@/lib/api/parks";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Star, 
  RefreshCw, 
  Building2,
  ExternalLink,
  User
} from "lucide-react";
import { Link } from "react-router-dom";

interface ParkWithOwner extends Park {
  profiles?: {
    email: string | null;
    display_name: string | null;
  } | null;
}

export const ParkApprovalSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingParks = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "pending-parks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parks")
        .select(`
          *,
          profiles:owner_id (
            email,
            display_name
          )
        `)
        .eq("is_pending", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ParkWithOwner[];
    },
  });

  const handleApprove = async (park: ParkWithOwner) => {
    try {
      await parksApi.update(park.id, { 
        is_pending: false, 
        is_visible: true 
      });

      toast({ title: "Park goedgekeurd en zichtbaar gemaakt" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin", "parks"] });
    } catch (error: any) {
      toast({ 
        title: "Fout", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleReject = async (park: ParkWithOwner) => {
    if (!confirm(`Weet je zeker dat je "${park.name}" wilt afwijzen? Dit verwijdert de vermelding.`)) return;

    try {
      await parksApi.delete(park.id);

      toast({ title: "Park verwijderd" });
      refetch();
    } catch (error: any) {
      toast({ 
        title: "Fout", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Nieuwe parken ({pendingParks.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Vernieuwen
        </Button>
      </CardHeader>
      <CardContent>
        {pendingParks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geen parken wachtend op goedkeuring</p>
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {pendingParks.map((park) => (
              <div key={park.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{park.name}</span>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {park.park_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {park.city}, {park.province}
                      </span>
                      {park.google_rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {park.google_rating}
                        </span>
                      )}
                    </div>
                    {park.profiles && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Ingediend door: {park.profiles.display_name || park.profiles.email}</span>
                      </div>
                    )}
                    {park.website && (
                      <a 
                        href={park.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Website bekijken
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(park)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Goedkeuren
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(park)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Afwijzen
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
