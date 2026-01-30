import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already logged in as admin
  if (user && isAdmin) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Add admin role for new user
        if (data.user) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: data.user.id, role: "admin" });
          
          if (roleError) {
            console.error("Error adding admin role:", roleError);
          }
        }
        
        toast({ title: "Account aangemaakt! Je bent nu ingelogd als admin." });
        navigate("/admin");
      } else {
        await signIn(email, password);
        toast({ title: "Ingelogd!" });
        navigate("/admin");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: isSignUp ? "Registratie mislukt" : "Inloggen mislukt",
        description: error.message || "Controleer je gegevens en probeer opnieuw",
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
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{isSignUp ? "Admin Registratie" : "Admin Login"}</CardTitle>
            <CardDescription>
              {isSignUp ? "Maak een admin account aan" : "Log in om vakantieparken te beheren"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isSignUp ? "Registreren..." : "Inloggen...") : (isSignUp ? "Registreren" : "Inloggen")}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? "Al een account? Log in" : "Nog geen account? Registreer"}
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                Terug naar home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
