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
import { supabase } from "@/integrations/supabase/client";

const slugToCity = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const LandingPlaats = () => {
  const { city: citySlug } = useParams<{ city: string }>();
  const cityName = citySlug ? slugToCity(citySlug) : "";

  // Find parks where city ILIKE %cityName%
  const { data: parks = [], isLoading } = useQuery({
    queryKey: ["parks", "city", cityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parks")
        .select("*")
        .eq("is_visible", true)
        .ilike("city", `%${cityName}%`)
        .order("google_rating", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!cityName,
  });

  const parkIds = parks.map((p) => p.id);
  const { data: photosByPark = {} } = useParkPhotos(parkIds);

  const baseUrl = "https://vakantielach.nl";

  const faqs = [
    {
      question: `Welke campings en vakantieparken zijn er in ${cityName}?`,
      answer: `In en rond ${cityName} vind je ${parks.length || "diverse"} campings, vakantieparken en bungalowparken. Bekijk hierboven het volledige overzicht met foto's, beoordelingen en directe links naar de website van elk park.`,
    },
    {
      question: `Wat is de beste tijd om naar ${cityName} te gaan?`,
      answer: `${cityName} is het hele jaar door een prachtige bestemming. De zomermaanden (juni-augustus) zijn populair voor strand- en buitenactiviteiten, terwijl het voor- en naseizoen vaak rustiger en goedkoper zijn.`,
    },
    {
      question: `Zijn er hondvriendelijke parken in ${cityName}?`,
      answer: `Veel campings en vakantieparken in ${cityName} zijn hondvriendelijk. Bekijk de details van elk park om te zien of huisdieren welkom zijn.`,
    },
    {
      question: `Hoe boek ik een park in ${cityName}?`,
      answer: `Op Vakantielach vind je per park een directe link naar de officiële website waar je beschikbaarheid kunt checken en kunt boeken.`,
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={`Campings & vakantieparken in ${cityName} (${parks.length}) | Vakantielach`}
        description={`Alle campings, vakantieparken en bungalowparken in ${cityName} op een rij. Bekijk foto's, beoordelingen en boek direct via de officiële website. ${parks.length} parken gevonden.`}
        canonical={`${baseUrl}/plaats/${citySlug}`}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "Plaatsen", url: `${baseUrl}/zoeken` },
          { name: cityName, url: `${baseUrl}/plaats/${citySlug}` },
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
            <Link to="/zoeken" className="hover:text-foreground">Zoeken</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{cityName}</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Campings & vakantieparken in {cityName}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Ontdek {parks.length || "alle"} campings, vakantieparken en bungalowparken in en rond {cityName}.
              Vergelijk eenvoudig op beoordelingen en faciliteiten en boek direct bij het park.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to={`/zoeken?q=${encodeURIComponent(cityName)}`}>
                  Bekijk alle resultaten
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

      {/* Parks */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">
            Parken in {cityName}
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : parks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parks.map((park) => (
                <ParkCard key={park.id} park={park} photoUrl={photosByPark[park.id]} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nog geen parken gevonden in {cityName}. Probeer een andere plaats of bekijk onze{" "}
              <Link to="/zoeken" className="text-primary underline">volledige zoekpagina</Link>.
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Veelgestelde vragen over {cityName}</h2>
          <div className="max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-background rounded-lg p-6 shadow-sm group">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
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

export default LandingPlaats;
