import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Park } from "@/lib/api/parks";

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface ParkMapProps {
  parks: Park[];
  className?: string;
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (park: Park) => void;
}

export const ParkMap = ({
  parks,
  className = "",
  center = [52.1326, 5.2913], // Center of Netherlands
  zoom = 7,
  onMarkerClick,
}: ParkMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map with modern style
    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Use a modern, clean tile layer (CartoDB Positron)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Create custom icon
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px hsl(var(--primary)/0.4);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">★</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Add markers for each park
    parks.forEach((park) => {
      if (park.latitude && park.longitude) {
        const marker = L.marker([park.latitude, park.longitude], {
          icon: customIcon,
        }).addTo(map);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; padding: 8px;">
            <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${park.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
              ${park.city || park.province || "Nederland"}
            </p>
            ${park.google_rating ? `
              <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; margin-bottom: 8px;">
                <span style="color: #facc15;">★</span>
                <span>${Number(park.google_rating).toFixed(1)}</span>
              </div>
            ` : ""}
            <a href="/park/${park.id}" style="
              display: inline-block;
              padding: 6px 12px;
              background: hsl(var(--primary));
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
            ">Bekijk park</a>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(park));
        }

        markersRef.current.push(marker);
      }
    });

    // Fit bounds if we have markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [parks, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full rounded-lg ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
};
