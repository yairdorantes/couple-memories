import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl from "mapbox-gl";
import { CalendarDays, Images, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMemories, usePlaces } from "../api/hooks";
import { getFriendlyError } from "../api/utils";
import { getPlaceCoverCropKey } from "../api/adapters";
import type { ApiMemory, ApiPlace } from "../api/types";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingHearts } from "./FloatingHearts";
import { PositionedImage } from "./PositionedImage";
import { mapboxAccessToken } from "../config/mapbox";
import { navItems, type AppView } from "../data/homeContent";
import { useI18n } from "../i18n/I18nContext";
import { getStoredImageCrop } from "../utils/imageCrop";
import { getDateForDisplay, getLocalDateKey } from "../utils/dateTime";

type PlacesPageProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenMemory: (memoryId: string) => void;
};

const emptyPlaces: ApiPlace[] = [];
const emptyMemories: ApiMemory[] = [];

export function PlacesPage({ activeView, onNavigate, onOpenMemory }: PlacesPageProps) {
  const { language, t } = useI18n();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const placesQuery = usePlaces();
  const memoriesQuery = useMemories({ category: "all", search: "" });
  const places = placesQuery.data ?? emptyPlaces;
  const memories =
    memoriesQuery.data?.pages.flatMap((page) => page.results) ?? emptyMemories;
  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  const selectedPlace = useMemo(
    () =>
      places.find((place) => String(place.id) === selectedPlaceId) ??
      places[0],
    [places, selectedPlaceId],
  );

  useEffect(() => {
    if (!selectedPlaceId && places[0]) {
      setSelectedPlaceId(String(places[0].id));
    }
  }, [places, selectedPlaceId]);

  useEffect(() => {
    if (!mapContainerRef.current || !mapboxAccessToken || mapRef.current || places.length === 0) {
      return;
    }

    mapboxgl.accessToken = mapboxAccessToken;

    const center = getPlacesCenter(places);
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom: 10.8,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    const markers = new Map<string, mapboxgl.Marker>();

    places.forEach((place) => {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.className = "place-map-marker";
      markerElement.setAttribute("aria-label", place.name);
      markerElement.innerHTML = "<span></span>";
      markerElement.addEventListener("click", () => {
        setSelectedPlaceId(String(place.id));
      });

      const marker = new mapboxgl.Marker({
        anchor: "bottom",
        element: markerElement,
      })
        .setLngLat([Number(place.longitude), Number(place.latitude)])
        .addTo(map);

      markers.set(String(place.id), marker);
    });

    markersRef.current = markers;
    mapRef.current = map;

    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [places]);

  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    markersRef.current.forEach((marker, placeId) => {
      const markerElement = marker.getElement();
      markerElement.classList.toggle("is-active", placeId === String(selectedPlace.id));
    });

    mapRef.current?.flyTo({
      center: [Number(selectedPlace.longitude), Number(selectedPlace.latitude)],
      essential: true,
      zoom: 12.2,
    });
  }, [selectedPlace]);

  function handleSelectPlace(place: ApiPlace) {
    setSelectedPlaceId(String(place.id));
  }

  return (
    <main className='min-h-screen overflow-x-hidden bg-ink-950 text-white'>
      <FloatingHearts />
      <div className='screen-glow' aria-hidden='true' />
      <div className='places-shell'>
        <section className='places-panel'>
          <header className='places-header'>
            <div>
              <h1>{t("places.title")}</h1>
              <p>{t("places.count", places.length)}</p>
            </div>
            <span>{t("places.subtitle")}</span>
          </header>

          <div className='places-map-layout'>
            <div className='places-map-card'>
              {placesQuery.isLoading ? (
                <div className='places-map-fallback'>
                  <MapPin aria-hidden='true' />
                  <h2>Loading places...</h2>
                </div>
              ) : placesQuery.isError ? (
                <div className='places-map-fallback'>
                  <MapPin aria-hidden='true' />
                  <h2>{getFriendlyError(placesQuery.error)}</h2>
                </div>
              ) : places.length === 0 ? (
                <div className='places-map-fallback'>
                  <MapPin aria-hidden='true' />
                  <h2>{t("places.emptyTitle")}</h2>
                  <p>{t("places.emptyCopy")}</p>
                </div>
              ) : mapboxAccessToken ? (
                <div
                  className='places-map'
                  ref={mapContainerRef}
                  aria-label={t("places.map.ariaLabel")}
                />
              ) : (
                <div className='places-map-fallback'>
                  <MapPin aria-hidden='true' />
                  <h2>{t("places.map.missingTokenTitle")}</h2>
                  <p>{t("places.map.missingToken")}</p>
                </div>
              )}
            </div>

            {selectedPlace ? (
              <PlaceDetail
                place={selectedPlace}
                memories={memories}
                language={language}
                onNavigate={onNavigate}
                onOpenMemory={onOpenMemory}
              />
            ) : null}
          </div>

          <div className='places-list' aria-label={t("places.title")}>
            {places.map((place) => (
              <button
                key={place.id}
                className={place.id === selectedPlace?.id ? "is-active" : undefined}
                type='button'
                onClick={() => handleSelectPlace(place)}
              >
                <PositionedImage
                  src={place.cover_media_detail?.url ?? "/images/featured-memory-placeholder.svg"}
                  alt={place.name}
                  crop={getStoredImageCrop(getPlaceCoverCropKey(place.id))}
                />
                <span>
                  <strong>{place.name}</strong>
                  <small>{formatVisitedDates(getPlaceVisitedDates(place, memories), language)}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <BottomNavigation
        activeView={activeView}
        items={navItems}
        onNavigate={onNavigate}
      />
    </main>
  );
}

type PlaceDetailProps = {
  place: ApiPlace;
  memories: ApiMemory[];
  language: string;
  onNavigate: (view: AppView) => void;
  onOpenMemory: (memoryId: string) => void;
};

function PlaceDetail({ place, memories, language, onNavigate, onOpenMemory }: PlaceDetailProps) {
  const { t } = useI18n();
  const placeMemories = memories.filter((memory) => isMemoryLinkedToPlace(memory, place.id));

  return (
    <article className='place-detail-card'>
      <PositionedImage
        src={place.cover_media_detail?.url ?? "/images/featured-memory-placeholder.svg"}
        alt={place.name}
        crop={getStoredImageCrop(getPlaceCoverCropKey(place.id))}
      />
      <div className='place-detail-content'>
        <div className='place-detail-heading'>
          <span>{place.category}</span>
          <h2>{place.name}</h2>
        </div>
        <p>{place.description}</p>
        <dl className='place-detail-meta'>
          <div>
            <CalendarDays aria-hidden='true' />
            <dt>{t("places.detail.visited")}</dt>
            <dd>{formatVisitedDates(getPlaceVisitedDates(place, memories), language)}</dd>
          </div>
          <div>
            <Images aria-hidden='true' />
            <dt>{t("places.detail.memories", placeMemories.length)}</dt>
            <dd className='place-detail-memory-links'>
              {placeMemories.length > 0 ? (
                placeMemories.map((memory) => (
                  <button
                    key={memory.id}
                    type='button'
                    onClick={() => onOpenMemory(String(memory.id))}
                  >
                    {memory.title}
                  </button>
                ))
              ) : (
                "No memories yet"
              )}
            </dd>
          </div>
        </dl>
        <button type='button' onClick={() => onNavigate("memories")}>
          {t("places.detail.viewMemories")}
        </button>
      </div>
    </article>
  );
}

function getPlacesCenter(places: ApiPlace[]): [number, number] {
  if (places.length === 0) {
    return [-98.2063, 19.0414];
  }

  const totals = places.reduce(
    (currentTotals, place) => ({
      latitude: currentTotals.latitude + Number(place.latitude),
      longitude: currentTotals.longitude + Number(place.longitude),
    }),
    { latitude: 0, longitude: 0 },
  );

  return [totals.longitude / places.length, totals.latitude / places.length];
}

function getPlaceVisitedDates(place: ApiPlace, memories: ApiMemory[]): string[] {
  const dates = memories
    .filter((memory) => isMemoryLinkedToPlace(memory, place.id))
    .map((memory) => getLocalDateKey(memory.happened_at));

  return dates.length > 0 ? dates : [getLocalDateKey(place.created_at)];
}

function isMemoryLinkedToPlace(memory: ApiMemory, placeId: number): boolean {
  return memory.place === placeId || memory.media_links.some((media) => media.place === placeId);
}

function formatVisitedDates(dates: string[], language: string): string {
  return dates
    .map((date) =>
      new Intl.DateTimeFormat(language, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(getDateForDisplay(date)),
    )
    .join(" · ");
}
