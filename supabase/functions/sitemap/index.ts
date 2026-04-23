// Dynamic sitemap.xml generator for Vakantielach
// Lists homepage, search, map, all park types, all provinces, all park detail pages
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://vakantielach.nl";

const PARK_TYPES = ["camping", "bungalowpark", "glamping", "vakantiepark", "resort"];

const PROVINCES = [
  "Drenthe",
  "Flevoland",
  "Friesland",
  "Gelderland",
  "Groningen",
  "Limburg",
  "Noord-Brabant",
  "Noord-Holland",
  "Overijssel",
  "Utrecht",
  "Zeeland",
  "Zuid-Holland",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function urlEntry(loc: string, lastmod?: string, changefreq = "weekly", priority = "0.7") {
  return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: parks } = await supabase
      .from("parks")
      .select("id, city, updated_at, is_visible")
      .eq("is_visible", true)
      .order("updated_at", { ascending: false });

    const today = new Date().toISOString().split("T")[0];
    const urls: string[] = [];

    // Static pages
    urls.push(urlEntry(`${BASE_URL}/`, today, "daily", "1.0"));
    urls.push(urlEntry(`${BASE_URL}/zoeken`, today, "daily", "0.9"));
    urls.push(urlEntry(`${BASE_URL}/kaart`, today, "weekly", "0.8"));
    urls.push(urlEntry(`${BASE_URL}/eigenaar`, today, "monthly", "0.5"));

    // Park types
    for (const t of PARK_TYPES) {
      urls.push(urlEntry(`${BASE_URL}/${t}`, today, "weekly", "0.8"));
    }

    // Provinces
    for (const p of PROVINCES) {
      urls.push(urlEntry(`${BASE_URL}/provincie/${slugify(p)}`, today, "weekly", "0.8"));
    }

    // Cities (unique)
    const cities = new Set<string>();
    (parks || []).forEach((p) => p.city && cities.add(p.city));
    for (const c of cities) {
      urls.push(urlEntry(`${BASE_URL}/plaats/${slugify(c)}`, today, "weekly", "0.7"));
    }

    // Park detail pages
    for (const p of parks || []) {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : today;
      urls.push(urlEntry(`${BASE_URL}/park/${p.id}`, lastmod, "weekly", "0.6"));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return new Response(`Error: ${(e as Error).message}`, { status: 500, headers: corsHeaders });
  }
});
