import { supabase } from "@/integrations/supabase/client";

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  ratings_total?: number;
  photo_reference?: string;
  types?: string[];
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  rating?: number;
  ratings_total?: number;
  photos: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours: string[];
  website?: string;
  phone?: string;
  types?: string[];
  park_type?: string;
}

export const googlePlacesApi = {
  async search(query: string, type?: string): Promise<PlaceSearchResult[]> {
    const { data, error } = await supabase.functions.invoke("google-places", {
      body: { action: "search", query, type },
    });

    if (error) {
      console.error("Search error:", error);
      throw new Error(error.message || "Failed to search places");
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to search places");
    }

    return data.results;
  },

  async getDetails(placeId: string): Promise<PlaceDetails> {
    const { data, error } = await supabase.functions.invoke("google-places", {
      body: { action: "details", placeId },
    });

    if (error) {
      console.error("Details error:", error);
      throw new Error(error.message || "Failed to get place details");
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to get place details");
    }

    return data.result;
  },

  async downloadPhoto(photoReference: string, parkId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke("google-places", {
      body: { action: "downloadPhoto", photoReference, parkId },
    });

    if (error) {
      console.error("Download photo error:", error);
      throw new Error(error.message || "Failed to download photo");
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to download photo");
    }

    return data.url;
  },

  getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    return `https://${projectId}.supabase.co/functions/v1/google-places?action=photo&photoRef=${photoReference}`;
  },
};
