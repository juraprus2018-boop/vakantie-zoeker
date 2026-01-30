import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Vakantie Parken NL</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/zoeken" className="text-sm font-medium hover:text-primary transition-colors">
            Zoeken
          </Link>
          <Link to="/kaart" className="text-sm font-medium hover:text-primary transition-colors">
            Kaart
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Uitloggen
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">Admin Login</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            <Link
              to="/zoeken"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Zoeken
            </Link>
            <Link
              to="/kaart"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kaart
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                Uitloggen
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm">Admin Login</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
