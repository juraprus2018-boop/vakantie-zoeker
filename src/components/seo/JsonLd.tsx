import React from "react";

interface JsonLdProps {
  data: object;
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Website schema for the main site
export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Vakantielach",
  url: "https://vakantielach.nl",
  description: "Vind alle campings, vakantieparken en bungalowparken in Nederland. Zoek op plaats, provincie of parknaam.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://vakantielach.nl/zoeken?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
});

// Organization schema
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vakantielach",
  url: "https://vakantielach.nl",
  logo: "https://vakantielach.nl/favicon.png",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Dutch",
  },
});

// Local business schema for a park (rich result eligible)
export const getParkSchema = (park: {
  id?: string;
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  website?: string | null;
  park_type?: string | null;
  google_rating?: number | null;
  google_ratings_total?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  facilities?: string[] | null;
  photos?: { photo_url: string }[];
  reviews?: {
    rating: number;
    title?: string | null;
    content?: string | null;
    reviewer_name?: string | null;
    created_at?: string;
  }[];
}) => {
  const url = park.id ? `https://vakantielach.nl/park/${park.id}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": url,
    name: park.name,
    description:
      park.description ||
      `${park.name} - ${park.park_type || "vakantiepark"} in ${park.city || park.province || "Nederland"}`,
    url,
    address: {
      "@type": "PostalAddress",
      streetAddress: park.address || undefined,
      addressLocality: park.city || undefined,
      addressRegion: park.province || undefined,
      postalCode: park.postal_code || undefined,
      addressCountry: "NL",
    },
    telephone: park.phone || undefined,
    sameAs: park.website ? [park.website] : undefined,
    priceRange: "€€",
    ...(park.facilities && park.facilities.length > 0 && {
      amenityFeature: park.facilities.map((f) => ({
        "@type": "LocationFeatureSpecification",
        name: f,
        value: true,
      })),
    }),
    ...(park.google_rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(park.google_rating).toFixed(1),
        reviewCount: park.google_ratings_total || (park.reviews?.length ?? 1),
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(park.reviews && park.reviews.length > 0 && {
      review: park.reviews.slice(0, 10).map((r) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          "@type": "Person",
          name: r.reviewer_name || "Anoniem",
        },
        ...(r.title && { name: r.title }),
        ...(r.content && { reviewBody: r.content }),
        ...(r.created_at && { datePublished: r.created_at.split("T")[0] }),
      })),
    }),
    ...(park.latitude && park.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: park.latitude,
        longitude: park.longitude,
      },
    }),
    ...(park.photos && park.photos.length > 0 && {
      image: park.photos.slice(0, 6).map((p) => p.photo_url),
    }),
  };
};

// BreadcrumbList schema
export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// FAQ schema
export const getFaqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

// ItemList schema for search results
export const getItemListSchema = (
  parks: { name: string; id: string; city?: string | null }[],
  baseUrl: string
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: parks.map((park, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: park.name,
    url: `${baseUrl}/park/${park.id}`,
  })),
});
