import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { 
  Building2, 
  CheckCircle, 
  Search, 
  Edit, 
  Users, 
  Star,
  ArrowRight,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Eenvoudig toevoegen",
    description: "Zoek uw bedrijf op via adres en importeer alle gegevens automatisch van Google Places.",
  },
  {
    icon: Edit,
    title: "Volledig bewerken",
    description: "Pas teksten, foto's en faciliteiten aan. U heeft volledige controle over uw vermelding.",
  },
  {
    icon: Users,
    title: "Bereik meer gasten",
    description: "Uw park wordt zichtbaar voor duizenden bezoekers die op zoek zijn naar de perfecte vakantie.",
  },
  {
    icon: Star,
    title: "Reviews beheren",
    description: "Ontvang en reageer op beoordelingen van uw gasten.",
  },
];

const steps = [
  {
    number: "1",
    title: "Account aanmaken",
    description: "Registreer met uw e-mailadres en wachtwoord.",
  },
  {
    number: "2",
    title: "Wacht op goedkeuring",
    description: "Onze beheerders controleren uw aanvraag. Dit duurt meestal 1-2 werkdagen.",
  },
  {
    number: "3",
    title: "Voeg uw park toe",
    description: "Na goedkeuring kunt u uw vakantiepark toevoegen door te zoeken op adres.",
  },
  {
    number: "4",
    title: "Publicatie na review",
    description: "Na een laatste controle wordt uw vermelding gepubliceerd en zichtbaar voor bezoekers.",
  },
];

const OwnerLanding = () => {
  const baseUrl = "https://vakantielach.nl";
  return (
    <Layout>
      <SEOHead
        title="Voor parkeigenaren: voeg uw camping of vakantiepark toe | Vakantielach"
        description="Bent u eigenaar van een camping, vakantiepark of bungalowpark? Registreer gratis op Vakantielach en bereik duizenden nieuwe gasten."
        canonical={`${baseUrl}/eigenaar`}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "Voor eigenaren", url: `${baseUrl}/eigenaar` },
        ])}
      />
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Voor parkeigenaren</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Laat uw vakantiepark{" "}
              <span className="text-primary">ontdekken</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Beheer uw eigen vermelding op ons platform. Voeg uw vakantiepark, 
              camping of bungalowpark toe en bereik nieuwe gasten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/eigenaar/registreren">
                  Gratis registreren
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/eigenaar/login">
                  Ik heb al een account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Waarom uw park toevoegen?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Profiteer van onze groeiende community en laat potentiële gasten uw park ontdekken.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hoe werkt het?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              In vier eenvoudige stappen staat uw vakantiepark online.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
              
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg z-10">
                      {step.number}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Veilig en betrouwbaar</h2>
            <p className="text-muted-foreground mb-8">
              Wij controleren alle aanmeldingen handmatig om de kwaliteit van ons platform 
              te waarborgen. Alleen geverifieerde parkeigenaren kunnen een vermelding aanmaken.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Handmatige verificatie</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Veilige gegevensopslag</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Gratis vermelding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Klaar om te beginnen?</h2>
              <p className="mb-8 opacity-90 max-w-xl mx-auto">
                Registreer vandaag nog en laat uw vakantiepark ontdekken door duizenden bezoekers.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/eigenaar/registreren">
                  Gratis registreren
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default OwnerLanding;
