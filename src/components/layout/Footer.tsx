import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Vakantie Parken NL</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Ontdek de mooiste vakantieparken en campings in Nederland.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Navigatie</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/zoeken" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Zoeken
              </Link>
              <Link to="/kaart" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kaart
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Type Parken</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/zoeken?type=camping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Campings
              </Link>
              <Link to="/zoeken?type=bungalowpark" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Bungalowparken
              </Link>
              <Link to="/zoeken?type=glamping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Glamping
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vakantie Parken Nederland. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
};
