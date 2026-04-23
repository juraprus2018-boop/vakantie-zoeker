import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { ParkCard } from "@/components/parks/ParkCard";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getBreadcrumbSchema, getFaqSchema, getItemListSchema } from "@/components/seo/JsonLd";
import { parksApi, Park } from "@/lib/api/parks";
import { useParkPhotos } from "@/hooks/useParkPhotos";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, ChevronRight } from "lucide-react";

const provinceData: Record<string, {
  title: string;
  description: string;
  longDescription: string;
  highlights: string[];
}> = {
  "noord-holland": {
    title: "Vakantieparken in Noord-Holland",
    description: "Ontdek vakantieparken in Noord-Holland. Strand, duinen, historische steden en het mooie Noord-Hollandse landschap.",
    longDescription: "Noord-Holland biedt een perfecte mix van strand, natuur en cultuur. Van de Waddeneilanden tot de duinen bij Bergen en van het historische Amsterdam tot de kleurrijke bloembollenvelden. De provincie heeft voor elk type vakantieganger iets te bieden.",
    highlights: ["Texel", "Bergen aan Zee", "Zandvoort", "Egmond aan Zee"],
  },
  "zuid-holland": {
    title: "Vakantieparken in Zuid-Holland",
    description: "Vakantieparken in Zuid-Holland. Kustplaatsen, historische steden en het groene hart van Nederland.",
    longDescription: "Zuid-Holland combineert bruisende steden als Den Haag en Rotterdam met rustige kustplaatsen en het groene polderlandschap. Geniet van de stranden van Scheveningen, de molens van Kinderdijk of de tulpenvelden rond Lisse.",
    highlights: ["Scheveningen", "Katwijk", "Noordwijk", "Ouddorp"],
  },
  gelderland: {
    title: "Vakantieparken in Gelderland",
    description: "Ontdek vakantieparken op de Veluwe en in Gelderland. Bossen, heide en de mooiste natuur van Nederland.",
    longDescription: "Gelderland is de grootste provincie van Nederland en herbergt de prachtige Veluwe. Met uitgestrekte bossen, heidevelden en stuifzanden is dit dé provincie voor natuurliefhebbers. Combineer uw verblijf met een bezoek aan de Hoge Veluwe of de Posbank.",
    highlights: ["Veluwe", "Arnhem", "Nijmegen", "Harderwijk"],
  },
  "noord-brabant": {
    title: "Vakantieparken in Noord-Brabant",
    description: "Vakantieparken in Brabant. Gezellige Brabantse gastvrijheid, natuur en cultuur.",
    longDescription: "Noord-Brabant staat bekend om zijn gezelligheid en gastvrijheid. De provincie biedt prachtige natuurgebieden zoals de Biesbosch en de Loonse en Drunense Duinen, maar ook bruisende steden als Eindhoven en Den Bosch.",
    highlights: ["Efteling", "Biesbosch", "Eindhoven", "Den Bosch"],
  },
  zeeland: {
    title: "Vakantieparken in Zeeland",
    description: "Vakantieparken aan de Zeeuwse kust. Strand, zon en de lekkerste mosselen van Nederland.",
    longDescription: "Zeeland is de zonnigste provincie van Nederland en perfect voor een strandvakantie. Met kilometers aan kust, pittoreske dorpjes en de beroemde Deltawerken biedt Zeeland een unieke vakantie-ervaring.",
    highlights: ["Renesse", "Domburg", "Cadzand", "Vlissingen"],
  },
};

const LandingProvince = () => {
  const { province } = useParams<{ province: string }>();
  const provinceInfo = province ? provinceData[province] : null;

  // Convert slug back to proper province name for API
  const provinceName = province ? province.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-") : "";

  const { data: parks = [], isLoading } = useQuery({
    queryKey: ["parks", "province", provinceName],
    queryFn: () => parksApi.getAll({ province: provinceName }),
    enabled: !!province && !!provinceInfo,
  });

  const parkIds = parks.map((p) => p.id);
  const { data: photosByPark = {} } = useParkPhotos(parkIds);

  if (!provinceInfo) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Pagina niet gevonden</h1>
        </div>
      </Layout>
    );
  }

  const baseUrl = "https://vakantielach.nl";

  return (
    <Layout>
      <SEOHead
        title={`Campings & vakantieparken in ${provinceName} | Vakantielach`}
        description={`${provinceInfo.description} Bekijk alle campings, vakantieparken en bungalowparken in ${provinceName} op Vakantielach.`}
        canonical={`${baseUrl}/provincie/${province}`}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "Provincies", url: `${baseUrl}/provincies` },
          { name: provinceInfo.title, url: `${baseUrl}/provincie/${province}` },
        ])}
      />
      {parks.length > 0 && <JsonLd data={getItemListSchema(parks, baseUrl)} />}

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{provinceInfo.title}</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{provinceInfo.title}</h1>
            <p className="text-xl text-muted-foreground mb-8">
              {provinceInfo.longDescription}
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {provinceInfo.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {highlight}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to={`/zoeken?province=${provinceName}`}>
                  Bekijk alle parken
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/kaart">
                  <MapPin className="mr-2 h-4 w-4" />
                  Bekijk op kaart
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Parks Grid */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">
            Populaire parken in {provinceName}
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : parks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parks.slice(0, 9).map((park) => (
                <ParkCard 
                  key={park.id} 
                  park={park} 
                  photoUrl={photosByPark[park.id]}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nog geen parken gevonden in {provinceName}. Binnenkort meer beschikbaar!
            </p>
          )}
          {parks.length > 9 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link to={`/zoeken?province=${provinceName}`}>
                  Bekijk alle {parks.length} resultaten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Populaire bestemmingen</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {provinceInfo.highlights.map((highlight) => (
              <Link
                key={highlight}
                to={`/zoeken?q=${highlight}`}
                className="p-6 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">{highlight}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bekijk parken
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingProvince;
