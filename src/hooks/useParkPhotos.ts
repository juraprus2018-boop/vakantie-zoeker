import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useParkPhotos = (parkIds: string[]) => {
  return useQuery({
    queryKey: ["park-photos", parkIds],
    queryFn: async () => {
      if (parkIds.length === 0) return {};

      const { data, error } = await supabase
        .from("park_photos")
        .select("*")
        .in("park_id", parkIds)
        .order("display_order");

      if (error) throw error;

      // Group photos by park_id, return first photo for each park
      const photosByPark: Record<string, string> = {};
      (data || []).forEach((photo) => {
        if (!photosByPark[photo.park_id]) {
          photosByPark[photo.park_id] = photo.photo_url;
        }
      });

      return photosByPark;
    },
    enabled: parkIds.length > 0,
  });
};
