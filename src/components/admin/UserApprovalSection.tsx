import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Mail, RefreshCw, Users } from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  is_approved: boolean;
  created_at: string;
}

export const UserApprovalSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "pending-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", userId);

      if (error) throw error;

      toast({ title: "Gebruiker goedgekeurd" });
      refetch();
    } catch (error: any) {
      toast({ 
        title: "Fout", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Weet je zeker dat je deze gebruiker wilt afwijzen?")) return;

    try {
      // We can't delete auth users from client, so we just leave them unapproved
      // In a real app, you might want to use an edge function to delete the auth user
      toast({ 
        title: "Gebruiker blijft afgekeurd",
        description: "De gebruiker kan geen park toevoegen." 
      });
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
          <Users className="h-5 w-5" />
          Nieuwe gebruikers ({pendingUsers.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Vernieuwen
        </Button>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geen nieuwe aanvragen</p>
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {pendingUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {user.display_name || "Geen naam"}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Nieuw
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Aangemeld op {new Date(user.created_at).toLocaleDateString("nl-NL")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(user.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Goedkeuren
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(user.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Afwijzen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
