import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark, VehicleType, SingaporeRegion } from '../types/carpark';
import { MapPin, Navigation, Info, Locate } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  vehicleType: VehicleType;
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  userLocation: { lat: number; lng: number } | null;
  onOpenDetails: (carpark: Carpark) => void;
}

const REGION_CENTERS: Record<SingaporeRegion, { lat: number; lng: number; zoom: number }> = {
  central: { lat: 1.285, lng: 103.85, zoom: 14 },
  orchard: { lat: 1.303, lng: 103.834, zoom: 15 },
  marinabay: { lat: 1.288, lng: 103.858, zoom: 15 },
  east: { lat: 1.345, lng: 103.94, zoom: 13 },
  west: { lat: 1.335, lng: 103.73, zoom: 13 },
  north: { lat: 1.43, lng: 103.8, zoom: 13 },
  northeast: { lat: 1.39, lng: 103.89, zoom: 13 },
};

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  vehicleType,
  selectedCarpark,
  onSelectCarpark,
  userLocation,
  onOpenDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add zoom control to top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Sleek Dark Matter tiles for modern dashboard aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when carparks or vehicleType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    carparks.forEach((carpark) => {
      let lots = carpark.lots.car;
      if (vehicleType === 'motorcycle' && carpark.lots.motorcycle) {
        lots = carpark.lots.motorcycle;
      } else if (vehicleType === 'heavy' && carpark.lots.heavy) {
        lots = carpark.lots.heavy;
      }

      const vacancyRate = lots.total > 0 ? (lots.available / lots.total) * 100 : 0;
      let pinColor = '#10b981'; // emerald
      let glowColor = 'rgba(16, 185, 129, 0.4)';

      if (lots.available === 0 || vacancyRate < 10) {
        pinColor = '#f43f5e'; // rose
        glowColor = 'rgba(244, 63, 94, 0.4)';
      } else if (vacancyRate < 25) {
        pinColor = '#f59e0b'; // amber
        glowColor = 'rgba(245, 158, 11, 0.4)';
      }

      const isSelected = selectedCarpark?.id === carpark.id;

      // Custom HTML Pin icon
      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: #ffffff;
            border: 2px solid ${pinColor};
            border-radius: 9999px;
            padding: 2px 7px;
            font-size: 11px;
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
            box-shadow: 0 4px 12px ${glowColor};
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
            transition: transform 0.2s ease;
            white-space: nowrap;
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${pinColor}; margin-right: 4px;"></span>
            ${lots.available}
          </div>
        `,
        iconSize: [48, 24],
        iconAnchor: [24, 12],
      });

      const marker = L.marker([carpark.coordinates.lat, carpark.coordinates.lng], {
        icon: customIcon,
      }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="padding: 14px; min-width: 240px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
            ${carpark.id} · ${carpark.region.toUpperCase()}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-top: 2px;">
            ${carpark.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            ${carpark.address}
          </div>

          <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #1e293b;">
            <span style="font-size: 20px; font-weight: 800; font-family: monospace; color: ${pinColor};">
              ${lots.available}
            </span>
            <span style="font-size: 11px; color: #94a3b8;">
              / ${lots.total} available (${Math.round(vacancyRate)}% vacant)
            </span>
          </div>

          <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px;">
            <strong>Day:</strong> ${carpark.rates.weekdayDay}
          </div>

          <div style="display: flex; gap: 6px; margin-top: 12px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                flex: 1;
                text-align: center;
                background: #10b981;
                color: #022c22;
                font-size: 11px;
                font-weight: 700;
                padding: 6px 10px;
                border-radius: 6px;
                text-decoration: none;
                display: block;
              "
            >
              Navigate
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectCarpark(carpark);
      });

      markersRef.current.set(carpark.id, marker);
    });
  }, [carparks, vehicleType, selectedCarpark, onSelectCarpark, onOpenDetails]);

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'user-location-pin',
          html: `
            <div style="
              width: 16px;
              height: 16px;
              background: #38bdf8;
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 16px #38bdf8;
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        userMarkerRef.current.bindTooltip('Your Location', { permanent: false, direction: 'top' });
      }
    }
  }, [userLocation]);

  // Handle selected carpark focus
  useEffect(() => {
    if (selectedCarpark && mapInstanceRef.current) {
      const marker = markersRef.current.get(selectedCarpark.id);
      if (marker) {
        mapInstanceRef.current.flyTo(
          [selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng],
          15,
          { duration: 1.0 }
        );
        marker.openPopup();
      }
    }
  }, [selectedCarpark]);

  const handleZoomToRegion = (region: SingaporeRegion) => {
    const target = REGION_CENTERS[region];
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1.0 });
    }
  };

  const handleResetSingapore = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([1.3521, 103.8198], 12, { duration: 1.0 });
    }
  };

  const handlePanToUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full h-[650px] lg:h-[760px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Floating Controls: Region Quick Jump Buttons */}
      <div className="absolute top-4 left-14 z-20 flex items-center gap-1.5 overflow-x-auto max-w-[calc(100%-80px)] p-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg">
        <button
          onClick={handleResetSingapore}
          className="px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
        >
          All SG
        </button>
        <button
          onClick={() => handleZoomToRegion('central')}
          className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
        >
          Central / CBD
        </button>
        <button
          onClick={() => handleZoomToRegion('orchard')}
          className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
        >
          Orchard
        </button>
        <button
          onClick={() => handleZoomToRegion('marinabay')}
          className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
        >
          Marina Bay
        </button>
        <button
          onClick={() => handleZoomToRegion('east')}
          className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
        >
          East
        </button>
        <button
          onClick={() => handleZoomToRegion('west')}
          className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
        >
          West
        </button>
        <button
          onClick={() => handleZoomToRegion('north')}
          className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
        >
          North
        </button>
        <button
          onClick={() => handleZoomToRegion('northeast')}
          className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
        >
          North-East
        </button>
      </div>

      {/* Floating User Location Button */}
      {userLocation && (
        <button
          onClick={handlePanToUser}
          className="absolute bottom-6 right-6 z-20 p-2.5 bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700 rounded-xl shadow-xl transition-all"
          title="Center on my location"
        >
          <Locate className="w-5 h-5" />
        </button>
      )}

      {/* Sleek Legend Panel */}
      <div className="absolute bottom-6 left-6 z-20 p-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl text-xs space-y-1.5 hidden sm:block">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Live Vacancy Status
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-slate-300 font-medium">&gt; 25% Lots Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span className="text-slate-300 font-medium">10% - 25% Filling Fast</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <span className="text-slate-300 font-medium">&lt; 10% or Carpark Full</span>
        </div>
      </div>
    </div>
  );
};
