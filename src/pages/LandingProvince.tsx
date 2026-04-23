import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { ParkCard } from "@/components/parks/ParkCard";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getBreadcrumbSchema, getFaqSchema, getItemListSchema } from "@/components/seo/JsonLd";
import { parksApi } from "@/lib/api/parks";
import { useParkPhotos } from "@/hooks/useParkPhotos";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, ChevronRight } from "lucide-react";

const provinceData: Record<string, {
  name: string;
  description: string;
  longDescription: string;
  highlights: string[];
}> = {
  drenthe: {
    name: "Drenthe",
    description: "Vakantieparken in Drenthe: rustige natuur, hunebedden en uitgestrekte fietsroutes.",
    longDescription: "Drenthe is dé provincie voor rust, ruimte en natuur. Geniet van uitgestrekte heidevelden, eeuwenoude hunebedden en het Drentsche Aa nationaal park. Ideaal voor fietsers, wandelaars en gezinnen die op zoek zijn naar een ontspannen vakantie.",
    highlights: ["Assen", "Emmen", "Hoogeveen", "Westerbork"],
  },
  flevoland: {
    name: "Flevoland",
    description: "Vakantieparken in Flevoland: water, natuur en moderne polders aan het IJsselmeer.",
    longDescription: "De jongste provincie van Nederland biedt verrassend veel: het Oostvaardersplassen natuurgebied, de bossen van de Noordoostpolder en watersport rond het IJsselmeer. Perfect voor actieve vakanties en natuurliefhebbers.",
    highlights: ["Lelystad", "Almere", "Urk", "Biddinghuizen"],
  },
  friesland: {
    name: "Friesland",
    description: "Vakantieparken in Friesland: meren, Waddeneilanden en Friese gastvrijheid.",
    longDescription: "Friesland is een paradijs voor watersporters met de Friese meren en de Waddeneilanden Vlieland, Terschelling, Ameland en Schiermonnikoog. Ontdek de elf steden, geniet van de uitgestrekte natuur en proef de Friese cultuur.",
    highlights: ["Leeuwarden", "Sneek", "Harlingen", "Ameland"],
  },
  gelderland: {
    name: "Gelderland",
    description: "Vakantieparken op de Veluwe en in Gelderland: bossen, heide en de mooiste natuur.",
    longDescription: "Gelderland is de grootste provincie van Nederland en herbergt de prachtige Veluwe. Met uitgestrekte bossen, heidevelden en stuifzanden is dit dé provincie voor natuurliefhebbers. Combineer uw verblijf met een bezoek aan de Hoge Veluwe of de Posbank.",
    highlights: ["Veluwe", "Arnhem", "Nijmegen", "Harderwijk"],
  },
  groningen: {
    name: "Groningen",
    description: "Vakantieparken in Groningen: Wadden, weidse landschappen en bruisende stad.",
    longDescription: "Groningen combineert de Waddenzee met uitgestrekte landschappen, historische kerken en de levendige studentenstad Groningen. Een unieke provincie voor wie écht op zoek is naar rust en authenticiteit.",
    highlights: ["Stad Groningen", "Lauwersoog", "Winschoten", "Pieterburen"],
  },
  limburg: {
    name: "Limburg",
    description: "Vakantieparken in Limburg: heuvels, kastelen en bourgondisch genieten.",
    longDescription: "Limburg is de enige Nederlandse provincie met heuvels. Het Heuvelland rond Valkenburg en Maastricht biedt prachtige fietsroutes, kastelen, grotten en bourgondische gastronomie. Ideaal voor wie houdt van actieve én culinaire vakanties.",
    highlights: ["Valkenburg", "Maastricht", "Roermond", "Heerlen"],
  },
  "noord-brabant": {
    name: "Noord-Brabant",
    description: "Vakantieparken in Brabant: Brabantse gezelligheid, natuur en cultuur.",
    longDescription: "Noord-Brabant staat bekend om zijn gezelligheid en gastvrijheid. De provincie biedt prachtige natuurgebieden zoals de Biesbosch en de Loonse en Drunense Duinen, maar ook bruisende steden als Eindhoven en Den Bosch en attractiepark de Efteling.",
    highlights: ["Efteling", "Biesbosch", "Eindhoven", "Den Bosch"],
  },
  "noord-holland": {
    name: "Noord-Holland",
    description: "Vakantieparken in Noord-Holland: strand, duinen en historische steden.",
    longDescription: "Noord-Holland biedt een perfecte mix van strand, natuur en cultuur. Van de Waddeneilanden tot de duinen bij Bergen en van het historische Amsterdam tot de kleurrijke bloembollenvelden. De provincie heeft voor elk type vakantieganger iets te bieden.",
    highlights: ["Texel", "Bergen aan Zee", "Zandvoort", "Egmond aan Zee"],
  },
  overijssel: {
    name: "Overijssel",
    description: "Vakantieparken in Overijssel: water, natuur en het Hollandse Venetië.",
    longDescription: "Overijssel verrast met diverse landschappen: het waterrijke Giethoorn, de bossen van Twente en de Sallandse Heuvelrug. Ideaal voor natuurliefhebbers, fietsers en wie op zoek is naar authentieke dorpjes.",
    highlights: ["Giethoorn", "Zwolle", "Ootmarsum", "Hellendoorn"],
  },
  utrecht: {
    name: "Utrecht",
    description: "Vakantieparken in Utrecht: bossen, kastelen en centraal gelegen.",
    longDescription: "De provincie Utrecht ligt centraal in Nederland en is rijk aan natuur en cultuur. Geniet van de Utrechtse Heuvelrug, prachtige kastelen en de monumentale stad Utrecht. Perfect uitvalsbasis voor het ontdekken van Nederland.",
    highlights: ["Utrecht", "Amersfoort", "Doorn", "Bunnik"],
  },
  zeeland: {
    name: "Zeeland",
    description: "Vakantieparken aan de Zeeuwse kust: strand, zon en de lekkerste mosselen.",
    longDescription: "Zeeland is de zonnigste provincie van Nederland en perfect voor een strandvakantie. Met kilometers aan kust, pittoreske dorpjes en de beroemde Deltawerken biedt Zeeland een unieke vakantie-ervaring. Geniet van Zeeuwse mosselen, fiets langs de kust en ontdek de eilanden.",
    highlights: ["Renesse", "Domburg", "Cadzand", "Vlissingen"],
  },
  "zuid-holland": {
    name: "Zuid-Holland",
    description: "Vakantieparken in Zuid-Holland: kust, historische steden en het groene hart.",
    longDescription: "Zuid-Holland combineert bruisende steden als Den Haag en Rotterdam met rustige kustplaatsen en het groene polderlandschap. Geniet van de stranden van Scheveningen, de molens van Kinderdijk of de tulpenvelden rond Lisse.",
    highlights: ["Scheveningen", "Katwijk", "Noordwijk", "Ouddorp"],
  },
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const LandingProvince = () => {
  const { province } = useParams<{ province: string }>();
  const provinceInfo = province ? provinceData[province] : null;

  const provinceName = provinceInfo?.name || "";

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
          <h1 className="text-2xl font-bold">Provincie niet gevonden</h1>
          <Link to="/zoeken" className="text-primary underline mt-4 inline-block">
            Terug naar zoeken
          </Link>
        </div>
      </Layout>
    );
  }

  const baseUrl = "https://vakantielach.nl";

  // Unique cities in this province from the parks
  const citiesInProvince = Array.from(new Set(parks.map((p) => p.city).filter(Boolean) as string[]));

  const faqs = [
    {
      question: `Hoeveel vakantieparken zijn er in ${provinceName}?`,
      answer: `Op Vakantielach vind je momenteel ${parks.length} campings, vakantieparken en bungalowparken in ${provinceName}.`,
    },
    {
      question: `Wat zijn populaire bestemmingen in ${provinceName}?`,
      answer: `Populaire bestemmingen in ${provinceName} zijn: ${provinceInfo.highlights.join(", ")}.`,
    },
    {
      question: `Wat is de beste reistijd voor ${provinceName}?`,
      answer: `${provinceName} is het hele jaar door een mooie bestemming. De zomermaanden (juni-augustus) zijn populair voor strand en buitenactiviteiten, terwijl voor- en naseizoen vaak rustiger en goedkoper zijn.`,
    },
    {
      question: `Kan ik direct boeken via Vakantielach?`,
      answer: `Vakantielach is een onafhankelijke gids. Klik op een park om naar de officiële website van het park te gaan voor beschikbaarheid en boekingen.`,
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={`Campings & vakantieparken in ${provinceName} (${parks.length}) | Vakantielach`}
        description={`${provinceInfo.description} Bekijk ${parks.length} parken in ${provinceName} met foto's, beoordelingen en directe link naar de officiële website.`}
        canonical={`${baseUrl}/provincie/${province}`}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "Provincies", url: `${baseUrl}/zoeken` },
          { name: provinceName, url: `${baseUrl}/provincie/${province}` },
        ])}
      />
      <JsonLd data={getFaqSchema(faqs)} />
      {parks.length > 0 && <JsonLd data={getItemListSchema(parks, baseUrl)} />}

      {/* Hero */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Vakantieparken in {provinceName}</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Campings & vakantieparken in {provinceName}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {provinceInfo.longDescription}
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {provinceInfo.highlights.map((highlight) => (
                <Link
                  key={highlight}
                  to={`/plaats/${slugify(highlight)}`}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                >
                  {highlight}
                </Link>
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
                <ParkCard key={park.id} park={park} photoUrl={photosByPark[park.id]} />
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

      {/* Cities in this province */}
      {citiesInProvince.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Plaatsen in {provinceName}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {citiesInProvince.slice(0, 24).map((city) => (
                <Link
                  key={city}
                  to={`/plaats/${slugify(city)}`}
                  className="p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium truncate">{city}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Veelgestelde vragen over {provinceName}</h2>
          <div className="max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-background border rounded-lg p-6 group">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="text-muted-foreground mt-3">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingProvince;
