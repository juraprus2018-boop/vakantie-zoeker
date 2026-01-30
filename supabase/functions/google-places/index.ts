import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    weekday_text?: string[];
  };
  website?: string;
  formatted_phone_number?: string;
  types?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error("GOOGLE_PLACES_API_KEY is not configured");
    }

    const url = new URL(req.url);
    const actionParam = url.searchParams.get("action");
    
    // Handle GET requests for photos
    if (req.method === "GET" && actionParam === "photo") {
      const photoRef = url.searchParams.get("photoRef");
      if (!photoRef) {
        throw new Error("photoRef is required");
      }
      
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`;
      const photoResponse = await fetch(photoUrl);
      
      if (!photoResponse.ok) {
        throw new Error("Failed to fetch photo from Google");
      }
      
      const imageData = await photoResponse.arrayBuffer();
      const contentType = photoResponse.headers.get("content-type") || "image/jpeg";
      
      return new Response(imageData, {
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const body = await req.json();
    const { action, query, placeId, type, parkId, photoReference } = body;

    // Initialize Supabase client for storage operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "search") {
      // Text search for parks in a region
      const searchQuery = `${type || "vakantiepark"} ${query}`;
      const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&region=nl&language=nl&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Google Places API error:", data);
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const results = (data.results || []).map((place: PlaceResult) => ({
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
        rating: place.rating,
        ratings_total: place.user_ratings_total,
        photo_reference: place.photos?.[0]?.photo_reference,
        types: place.types,
      }));

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "details") {
      // Get detailed info for a specific place
      const fields = "place_id,name,formatted_address,geometry,rating,user_ratings_total,photos,opening_hours,website,formatted_phone_number,types,address_components";
      const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=nl&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status !== "OK") {
        console.error("Google Places API error:", data);
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const place = data.result;
      
      // Extract city and province from address components
      let city = "";
      let province = "";
      let postalCode = "";
      
      if (place.address_components) {
        for (const component of place.address_components) {
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            province = component.long_name;
          }
          if (component.types.includes("postal_code")) {
            postalCode = component.long_name;
          }
        }
      }

      const result = {
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        city,
        province,
        postal_code: postalCode,
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
        rating: place.rating,
        ratings_total: place.user_ratings_total,
        photos: place.photos?.map((p: any) => ({
          photo_reference: p.photo_reference,
          height: p.height,
          width: p.width,
        })) || [],
        opening_hours: place.opening_hours?.weekday_text || [],
        website: place.website,
        phone: place.formatted_phone_number,
        types: place.types,
      };

      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "downloadPhoto") {
      // Download photo from Google and save to Supabase storage
      if (!photoReference || !parkId) {
        throw new Error("photoReference and parkId are required");
      }

      // Fetch photo from Google
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
      const photoResponse = await fetch(photoUrl);
      
      if (!photoResponse.ok) {
        throw new Error("Failed to fetch photo from Google");
      }

      const imageData = await photoResponse.arrayBuffer();
      const contentType = photoResponse.headers.get("content-type") || "image/jpeg";
      const extension = contentType.includes("png") ? "png" : "jpg";
      const fileName = `${parkId}/${crypto.randomUUID()}.${extension}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("park-images")
        .upload(fileName, imageData, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload photo: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("park-images")
        .getPublicUrl(fileName);

      return new Response(JSON.stringify({ 
        success: true, 
        url: urlData.publicUrl,
        path: fileName,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
