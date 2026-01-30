import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, ArrowLeft } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
});

const OwnerAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isSignUp = location.pathname === "/eigenaar/registreren";

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/eigenaar/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/eigenaar/dashboard`,
          },
        });
        
        if (error) throw error;

        // Update profile with display name if provided
        if (data.user && displayName) {
          await supabase
            .from("profiles")
            .update({ display_name: displayName })
            .eq("id", data.user.id);
        }

        toast({
          title: "Account aangemaakt!",
          description: "Uw account wacht nu op goedkeuring door een beheerder. U ontvangt bericht zodra uw account is geactiveerd.",
        });
        navigate("/eigenaar/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        toast({ title: "Ingelogd!" });
        navigate("/eigenaar/dashboard");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      let message = "Controleer je gegevens en probeer opnieuw";
      if (error.message?.includes("already registered")) {
        message = "Dit e-mailadres is al geregistreerd. Probeer in te loggen.";
      } else if (error.message?.includes("Invalid login")) {
        message = "Ongeldige inloggegevens. Controleer uw e-mail en wachtwoord.";
      }

      toast({
        title: isSignUp ? "Registratie mislukt" : "Inloggen mislukt",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isSignUp ? "Account aanmaken" : "Inloggen"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Registreer als parkeigenaar om uw vermelding te beheren"
                : "Log in om uw vakantiepark te beheren"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="displayName">Naam (optioneel)</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Uw naam of bedrijfsnaam"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="uw@email.nl"
                  required
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? (isSignUp ? "Registreren..." : "Inloggen...") 
                  : (isSignUp ? "Account aanmaken" : "Inloggen")
                }
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <div>
                {isSignUp ? (
                  <Link 
                    to="/eigenaar/login" 
                    className="text-sm text-primary hover:underline"
                  >
                    Al een account? Log in
                  </Link>
                ) : (
                  <Link 
                    to="/eigenaar/registreren" 
                    className="text-sm text-primary hover:underline"
                  >
                    Nog geen account? Registreer
                  </Link>
                )}
              </div>
              <div>
                <Link 
                  to="/eigenaar" 
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Terug naar informatie
                </Link>
              </div>
            </div>

            {isSignUp && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Let op:</p>
                <p>
                  Na registratie moet uw account eerst worden goedgekeurd door een 
                  beheerder voordat u uw park kunt toevoegen. Dit duurt meestal 1-2 werkdagen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OwnerAuth;
