import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { ParkCard } from "@/components/parks/ParkCard";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getBreadcrumbSchema, getFaqSchema, getItemListSchema } from "@/components/seo/JsonLd";
import { parksApi, Park } from "@/lib/api/parks";
import { useParkPhotos } from "@/hooks/useParkPhotos";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, ChevronRight } from "lucide-react";

const parkTypeData: Record<string, { 
  title: string; 
  description: string; 
  longDescription: string;
  faqs: { question: string; answer: string }[];
}> = {
  camping: {
    title: "Campings in Nederland",
    description: "Ontdek de beste campings in Nederland. Van rustige natuurcampings tot gezellige familiecampings met alle voorzieningen.",
    longDescription: "Nederland heeft een rijke campingcultuur met honderden prachtige campings verspreid over het hele land. Of u nu houdt van kamperen in de natuur, aan het water of op een gezellige familiecamping met animatie en zwembad - er is voor ieder wat wils. Onze campings variëren van eenvoudige natuurkampeerterreinen tot luxe campings met alle voorzieningen.",
    faqs: [
      { question: "Wat kost een camping in Nederland gemiddeld?", answer: "Campingprijzen variëren van €15 tot €50 per nacht, afhankelijk van de voorzieningen en het seizoen." },
      { question: "Welke voorzieningen hebben Nederlandse campings?", answer: "De meeste campings hebben sanitairgebouwen, een receptie en speelvoorzieningen. Grotere campings hebben vaak ook zwembaden, restaurants en animatieteams." },
      { question: "Kan ik met mijn hond naar een camping?", answer: "Veel campings zijn hondvriendelijk. Check altijd vooraf de huisregels van de specifieke camping." },
    ],
  },
  bungalowpark: {
    title: "Bungalowparken in Nederland",
    description: "Vind het perfecte bungalowpark voor uw vakantie. Comfortabele vakantiehuizen in de mooiste regio's van Nederland.",
    longDescription: "Bungalowparken bieden het beste van twee werelden: het comfort van een eigen vakantiewoning gecombineerd met de voorzieningen van een vakantiepark. Of u nu kiest voor een knusse 4-persoons bungalow of een luxe villa voor het hele gezin, in Nederland vindt u bungalowparken in elke prijsklasse en omgeving.",
    faqs: [
      { question: "Wat is het verschil tussen een bungalow en een chalet?", answer: "Een bungalow is meestal een vrijstaande woning van steen, terwijl een chalet vaak van hout is en een meer landelijke uitstraling heeft." },
      { question: "Zijn bungalowparken geschikt voor kinderen?", answer: "Absoluut! De meeste bungalowparken hebben uitgebreide speelvoorzieningen, zwembaden en soms zelfs animatieprogramma's voor kinderen." },
      { question: "Kan ik mijn eigen beddengoed meenemen?", answer: "Dit verschilt per park. Sommige parken bieden beddengoed aan, bij andere moet u het zelf meenemen of huren." },
    ],
  },
  glamping: {
    title: "Glamping in Nederland",
    description: "Luxe kamperen in stijl. Ontdek de mooiste glamping accommodaties in Nederland: safaritenten, lodges en meer.",
    longDescription: "Glamping, oftewel 'glamorous camping', combineert het avontuur van kamperen met het comfort van een hotelkamer. Slaap in een sfeervolle safaritent, een romantische boomhut of een hippe Airstream caravan. Glamping accommodaties zijn volledig ingericht en bieden vaak unieke ervaringen midden in de natuur.",
    faqs: [
      { question: "Wat is glamping precies?", answer: "Glamping is luxe kamperen in bijzondere accommodaties zoals safaritenten, yurts, boomhutten of lodges, met het comfort van een hotel." },
      { question: "Is glamping duurder dan regulier kamperen?", answer: "Ja, glamping is doorgaans duurder vanwege de unieke accommodaties en extra voorzieningen, maar goedkoper dan een hotel." },
      { question: "Moet ik zelf koken bij glamping?", answer: "De meeste glamping accommodaties hebben een eigen keuken. Sommige locaties bieden ook ontbijt of diner aan." },
    ],
  },
  vakantiepark: {
    title: "Vakantieparken in Nederland",
    description: "De beste vakantieparken van Nederland. Geniet van zwembaden, entertainment en comfortabele accommodaties.",
    longDescription: "Nederlandse vakantieparken staan bekend om hun uitgebreide voorzieningen en activiteiten voor het hele gezin. Van subtropische zwemparadijzen tot avontuurlijke speeltuinen en van restaurants tot wellness faciliteiten. Vakantieparken bieden een zorgeloze vakantie waar voor iedereen iets te doen is.",
    faqs: [
      { question: "Wat is er te doen op een vakantiepark?", answer: "Vakantieparken bieden vaak zwembaden, restaurants, sportfaciliteiten, speeltuinen en animatieprogramma's voor kinderen." },
      { question: "Zijn vakantieparken alleen voor gezinnen?", answer: "Nee, er zijn ook vakantieparken gericht op koppels of groepen vrienden, met bijvoorbeeld wellness en uitgaansgelegenheden." },
      { question: "Kan ik een dagje weg naar een vakantiepark?", answer: "Sommige vakantieparken bieden dagentree aan voor hun zwembad of andere faciliteiten. Check dit vooraf bij het park." },
    ],
  },
  resort: {
    title: "Resorts in Nederland",
    description: "Luxe resorts voor een onvergetelijke vakantie. Ontdek exclusieve accommodaties met spa, restaurants en meer.",
    longDescription: "Voor wie het beste van het beste zoekt, bieden Nederlandse resorts een luxueuze vakantie-ervaring. Met hoogwaardige accommodaties, uitstekende restaurants, wellness faciliteiten en persoonlijke service. Resorts zijn de perfecte keuze voor een ontspannen en verwennend verblijf.",
    faqs: [
      { question: "Wat maakt een resort anders dan een vakantiepark?", answer: "Resorts bieden doorgaans een hoger serviceniveau, luxere accommodaties en meer exclusieve faciliteiten zoals spa's en fine dining restaurants." },
      { question: "Zijn resorts geschikt voor kinderen?", answer: "Veel resorts zijn gezinsvriendelijk met speciale voorzieningen voor kinderen, maar er zijn ook resorts gericht op volwassenen." },
      { question: "Is all-inclusive mogelijk bij Nederlandse resorts?", answer: "Sommige resorts bieden all-inclusive arrangementen aan. Dit verschilt per resort." },
    ],
  },
};

const LandingParkType = () => {
  const location = useLocation();
  const type = location.pathname.replace("/", ""); // Get type from path like /camping -> camping
  const typeData = type ? parkTypeData[type] : null;

  const { data: parks = [], isLoading } = useQuery({
    queryKey: ["parks", "type", type],
    queryFn: () => parksApi.getAll({ parkType: type }),
    enabled: !!type && !!typeData,
  });

  const parkIds = parks.map((p) => p.id);
  const { data: photosByPark = {} } = useParkPhotos(parkIds);

  if (!typeData) {
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
        title={`${typeData.title} in Nederland | Vakantielach`}
        description={`${typeData.description} Vakantielach toont alle ${typeData.title.toLowerCase()} per provincie en plaats.`}
        canonical={`${baseUrl}/${type}`}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: typeData.title, url: `${baseUrl}/${type}` },
        ])}
      />
      <JsonLd data={getFaqSchema(typeData.faqs)} />
      {parks.length > 0 && <JsonLd data={getItemListSchema(parks, baseUrl)} />}

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{typeData.title}</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{typeData.title}</h1>
            <p className="text-xl text-muted-foreground mb-8">
              {typeData.longDescription}
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to={`/zoeken?type=${type}`}>
                  Bekijk alle {type === "camping" ? "campings" : type === "bungalowpark" ? "bungalowparken" : type}
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
            Populaire {type === "camping" ? "campings" : type === "bungalowpark" ? "bungalowparken" : type}
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
              Nog geen {type} gevonden. Binnenkort meer beschikbaar!
            </p>
          )}
          {parks.length > 9 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link to={`/zoeken?type=${type}`}>
                  Bekijk alle {parks.length} resultaten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Veelgestelde vragen</h2>
          <div className="max-w-3xl space-y-6">
            {typeData.faqs.map((faq, index) => (
              <div key={index} className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingParkType;
