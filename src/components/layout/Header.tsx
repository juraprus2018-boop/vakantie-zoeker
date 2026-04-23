import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const parkTypes = [
  { slug: "camping", label: "Campings" },
  { slug: "bungalowpark", label: "Bungalowparken" },
  { slug: "glamping", label: "Glamping" },
  { slug: "vakantiepark", label: "Vakantieparken" },
  { slug: "resort", label: "Resorts" },
];

const provinces = [
  { slug: "noord-holland", label: "Noord-Holland" },
  { slug: "zuid-holland", label: "Zuid-Holland" },
  { slug: "gelderland", label: "Gelderland" },
  { slug: "noord-brabant", label: "Noord-Brabant" },
  { slug: "zeeland", label: "Zeeland" },
];

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Vakantielach homepage">
          <img src="/favicon.png" alt="Vakantielach logo" className="h-8 w-8" width={32} height={32} />
          <span className="text-xl font-semibold">Vakantielach</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/zoeken" className="text-sm font-medium hover:text-primary transition-colors">
            Zoeken
          </Link>
          <Link to="/kaart" className="text-sm font-medium hover:text-primary transition-colors">
            Kaart
          </Link>
          
          {/* Park Types Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Parktypes
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {parkTypes.map((type) => (
                <DropdownMenuItem key={type.slug} asChild>
                  <Link to={`/${type.slug}`}>{type.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Provinces Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Provincies
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {provinces.map((province) => (
                <DropdownMenuItem key={province.slug} asChild>
                  <Link to={`/provincie/${province.slug}`}>{province.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/eigenaar" className="text-sm font-medium hover:text-primary transition-colors">
            Voor eigenaren
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                Admin
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Uitloggen
              </Button>
            </>
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
            
            {/* Mobile Park Types */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">Parktypes</span>
              <div className="pl-4 flex flex-col gap-2">
                {parkTypes.map((type) => (
                  <Link
                    key={type.slug}
                    to={`/${type.slug}`}
                    className="text-sm hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {type.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Provinces */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">Provincies</span>
              <div className="pl-4 flex flex-col gap-2">
                {provinces.map((province) => (
                  <Link
                    key={province.slug}
                    to={`/provincie/${province.slug}`}
                    className="text-sm hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {province.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/eigenaar"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Voor eigenaren
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
                <Button variant="outline" size="sm" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                  Uitloggen
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
