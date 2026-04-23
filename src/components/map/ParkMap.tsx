import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
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
  photosByPark?: Record<string, string>;
  className?: string;
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (park: Park) => void;
}

export const ParkMap = ({
  parks,
  photosByPark = {},
  className = "",
  center = [52.1326, 5.2913], // Center of Netherlands
  zoom = 7,
  onMarkerClick,
}: ParkMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

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

    // Clear existing cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    // Create cluster group with custom styling
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = "small";
        let dimension = 40;

        if (count >= 10 && count < 50) {
          size = "medium";
          dimension = 50;
        } else if (count >= 50) {
          size = "large";
          dimension = 60;
        }

        return L.divIcon({
          html: `<div class="cluster-marker cluster-${size}">
            <span>${count}</span>
          </div>`,
          className: "custom-cluster-icon",
          iconSize: L.point(dimension, dimension),
        });
      },
    });

    // Create custom pin icon
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `
        <div style="position: relative; width: 34px; height: 44px;">
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            <path d="M17 0C7.611 0 0 7.611 0 17c0 11.5 17 27 17 27s17-15.5 17-27c0-9.389-7.611-17-17-17z" fill="#3a8268"/>
            <path d="M17 1.5C8.44 1.5 1.5 8.44 1.5 17c0 10.5 15.5 25 15.5 25s15.5-14.5 15.5-25c0-8.56-6.94-15.5-15.5-15.5z" stroke="#ffffff" stroke-width="2" fill="none"/>
            <circle cx="17" cy="17" r="6" fill="#ffffff"/>
            <circle cx="17" cy="17" r="3" fill="#3a8268"/>
          </svg>
        </div>
      `,
      iconSize: [34, 44],
      iconAnchor: [17, 44],
      popupAnchor: [0, -40],
    });

    // Add markers for each park
    parks.forEach((park) => {
      if (park.latitude && park.longitude) {
        const marker = L.marker([park.latitude, park.longitude], {
          icon: customIcon,
        });

        const photoUrl = photosByPark[park.id];

        // Create popup content with photo
        const popupContent = `
          <div style="min-width: 240px; padding: 0;">
            ${photoUrl ? `
              <img 
                src="${photoUrl}" 
                alt="${park.name}"
                style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px 8px 0 0;"
              />
            ` : `
              <div style="width: 100%; height: 80px; background: #f3f4f6; border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `}
            <div style="padding: 12px;">
              <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 4px; color: #1f2937;">${park.name}</h3>
              <p style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                ${park.city || park.province || "Nederland"}
              </p>
              ${park.google_rating ? `
                <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; margin-bottom: 12px;">
                  <span style="color: #facc15;">★</span>
                  <span style="font-weight: 500;">${Number(park.google_rating).toFixed(1)}</span>
                </div>
              ` : ""}
              <a href="/park/${park.id}" style="
                display: block;
                width: 100%;
                padding: 10px 16px;
                background: hsl(var(--primary));
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                box-sizing: border-box;
              ">Bekijk park</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 280,
          className: 'custom-popup',
        });

        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(park));
        }

        clusterGroup.addLayer(marker);
      }
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // Fit bounds if we have markers, but limit max zoom
    if (clusterGroup.getLayers().length > 0) {
      map.fitBounds(clusterGroup.getBounds().pad(0.3), { maxZoom: 10 });
    }
  }, [parks, photosByPark, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full rounded-lg relative z-0 ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
};
