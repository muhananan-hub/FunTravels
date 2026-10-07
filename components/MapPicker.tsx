"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type SelectedMapLocation = {
  latitude: number;
  longitude: number;
  address?: string;
};

type MapPickerProps = {
  title: string;
  initialLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  onSelect: (location: SelectedMapLocation) => void;
  onClose: () => void;
};

const LOMBOK_CENTER: [number, number] = [-8.5833, 116.1167];

export default function MapPicker({
  title,
  initialLocation,
  onSelect,
  onClose,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selected, setSelected] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    initialLocation
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
        }
      : null
  );

  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center: [number, number] = initialLocation
      ? [initialLocation.latitude, initialLocation.longitude]
      : LOMBOK_CENTER;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: initialLocation ? 15 : 10,
      zoomControl: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    if (initialLocation) {
      const marker = L.marker(center).addTo(map);
      markerRef.current = marker;
    }

    map.on("click", (event: L.LeafletMouseEvent) => {
      const latitude = event.latlng.lat;
      const longitude = event.latlng.lng;

      setSelected({
        latitude,
        longitude,
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else {
        markerRef.current = L.marker([latitude, longitude]).addTo(map);
      }

      setAddress("");
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [initialLocation]);

  async function reverseGeocode() {
    if (!selected) return;

    setLoadingAddress(true);

    try {
      const response = await fetch(
        `/api/maps?lat=${selected.latitude}&lon=${selected.longitude}`
      );

      const data = await response.json();

      if (response.ok && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress("Lokasi dipilih di peta");
      }
    } catch {
      setAddress("Lokasi dipilih di peta");
    } finally {
      setLoadingAddress(false);
    }
  }

  function handleUseLocation() {
    if (!selected) return;

    onSelect({
      latitude: selected.latitude,
      longitude: selected.longitude,
      address: address || "Lokasi dipilih di peta",
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 sm:text-xl">
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Klik pada peta untuk menandai lokasi yang diinginkan.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200"
            aria-label="Tutup peta"
          >
            ×
          </button>
        </div>

        {/* Map */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={mapContainerRef}
            className="h-full w-full"
          />

          <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:left-5 sm:top-5">
            <p className="text-xs font-bold text-slate-800">
              📍 Tandai lokasi
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Klik titik yang tepat pada peta
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
          {selected ? (
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Latitude
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {selected.latitude.toFixed(6)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Longitude
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {selected.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                {address && (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    {address}
                  </p>
                )}

                {!address && (
                  <button
                    type="button"
                    onClick={reverseGeocode}
                    disabled={loadingAddress}
                    className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 disabled:opacity-50"
                  >
                    {loadingAddress
                      ? "Mencari nama lokasi..."
                      : "↻ Cari nama lokasi otomatis"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleUseLocation}
                className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700"
              >
                ✓ Gunakan Lokasi Ini
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada lokasi yang dipilih
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Klik salah satu titik pada peta terlebih dahulu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}