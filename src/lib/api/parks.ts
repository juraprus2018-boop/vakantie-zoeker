import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Park = Tables<"parks">;
export type ParkInsert = TablesInsert<"parks">;
export type ParkUpdate = TablesUpdate<"parks">;
export type ParkPhoto = Tables<"park_photos">;
export type Review = Tables<"reviews">;

export interface ParkWithDetails extends Park {
  photos: ParkPhoto[];
  reviews: Review[];
  average_rating?: number;
}

export const parksApi = {
  async getAll(filters?: {
    province?: string;
    parkType?: string;
    minRating?: number;
    search?: string;
  }): Promise<Park[]> {
    let query = supabase
      .from("parks")
      .select("*")
      .eq("is_visible", true)
      .order("is_featured", { ascending: false })
      .order("google_rating", { ascending: false, nullsFirst: false });

    if (filters?.province) {
      query = query.eq("province", filters.province);
    }
    if (filters?.parkType) {
      query = query.eq("park_type", filters.parkType as any);
    }
    if (filters?.minRating) {
      query = query.gte("google_rating", filters.minRating);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getFeatured(): Promise<Park[]> {
    const { data, error } = await supabase
      .from("parks")
      .select("*")
      .eq("is_visible", true)
      .eq("is_featured", true)
      .limit(6);

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<ParkWithDetails | null> {
    const { data: park, error: parkError } = await supabase
      .from("parks")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (parkError) throw parkError;
    if (!park) return null;

    const [photosResult, reviewsResult] = await Promise.all([
      supabase
        .from("park_photos")
        .select("*")
        .eq("park_id", id)
        .order("display_order"),
      supabase
        .from("reviews")
        .select("*")
        .eq("park_id", id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false }),
    ]);

    const photos = photosResult.data || [];
    const reviews = reviewsResult.data || [];

    const average_rating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

    return {
      ...park,
      photos,
      reviews,
      average_rating,
    };
  },

  async create(park: ParkInsert): Promise<Park> {
    const { data, error } = await supabase
      .from("parks")
      .insert(park)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, park: ParkUpdate): Promise<Park> {
    const { data, error } = await supabase
      .from("parks")
      .update(park)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("parks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async addPhoto(parkId: string, photoUrl: string, photoReference?: string, isFromGoogle: boolean = false): Promise<ParkPhoto> {
    const { data, error } = await supabase
      .from("park_photos")
      .insert({
        park_id: parkId,
        photo_url: photoUrl,
        photo_reference: photoReference,
        is_from_google: isFromGoogle,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const reviewsApi = {
  async create(review: {
    park_id: string;
    author_name: string;
    rating: number;
    review_text?: string;
  }): Promise<Review> {
    const { data, error } = await supabase
      .from("reviews")
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRecent(limit: number = 5): Promise<(Review & { park_name?: string })[]> {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        parks!inner(name)
      `)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((r: any) => ({
      ...r,
      park_name: r.parks?.name,
    }));
  },
};
