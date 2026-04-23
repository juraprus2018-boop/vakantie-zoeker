import { Link } from "react-router-dom";

const provinces = [
  { slug: "drenthe", name: "Drenthe" },
  { slug: "flevoland", name: "Flevoland" },
  { slug: "friesland", name: "Friesland" },
  { slug: "gelderland", name: "Gelderland" },
  { slug: "groningen", name: "Groningen" },
  { slug: "limburg", name: "Limburg" },
  { slug: "noord-brabant", name: "Noord-Brabant" },
  { slug: "noord-holland", name: "Noord-Holland" },
  { slug: "overijssel", name: "Overijssel" },
  { slug: "utrecht", name: "Utrecht" },
  { slug: "zeeland", name: "Zeeland" },
  { slug: "zuid-holland", name: "Zuid-Holland" },
];

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="Vakantielach homepage">
              <img src="/favicon.png" alt="Vakantielach logo" className="h-7 w-7" width={28} height={28} loading="lazy" />
              <span className="text-lg font-semibold">Vakantielach</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Vakantielach helpt je de mooiste campings, vakantieparken en bungalowparken in Nederland te vinden.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navigatie</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/zoeken" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Zoeken</Link>
              <Link to="/kaart" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kaart</Link>
              <Link to="/eigenaar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Voor eigenaren</Link>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Type Parken</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/camping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Campings</Link>
              <Link to="/bungalowpark" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bungalowparken</Link>
              <Link to="/glamping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Glamping</Link>
              <Link to="/vakantiepark" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Vakantieparken</Link>
              <Link to="/resort" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resorts</Link>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Provincies</h3>
            <nav className="grid grid-cols-2 gap-x-3 gap-y-2">
              {provinces.map((p) => (
                <Link
                  key={p.slug}
                  to={`/provincie/${p.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {p.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vakantielach. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
};

