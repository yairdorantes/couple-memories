import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl from "mapbox-gl";
import { CalendarDays, Images, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingHearts } from "./FloatingHearts";
import { mapboxAccessToken } from "../config/mapbox";
import { navItems, type AppView } from "../data/homeContent";
import { couplePlaces, type CouplePlace } from "../data/placesContent";
import { useI18n } from "../i18n/I18nContext";

type PlacesPageProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
};

export function PlacesPage({ activeView, onNavigate }: PlacesPageProps) {
  const { language, t } = useI18n();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [selectedPlaceId, setSelectedPlaceId] = useState(couplePlaces[0]?.id ?? "");

  const selectedPlace = useMemo(
    () =>
      couplePlaces.find((place) => place.id === selectedPlaceId) ??
      couplePlaces[0],
    [selectedPlaceId],
  );

  useEffect(() => {
    if (!mapContainerRef.current || !mapboxAccessToken || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = mapboxAccessToken;

    const center = getPlacesCenter(couplePlaces);
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

    couplePlaces.forEach((place) => {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.className = "place-map-marker";
      markerElement.setAttribute("aria-label", t(place.nameKey));
      markerElement.innerHTML = "<span></span>";
      markerElement.addEventListener("click", () => {
        setSelectedPlaceId(place.id);
      });

      const marker = new mapboxgl.Marker({
        anchor: "bottom",
        element: markerElement,
      })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);

      markers.set(place.id, marker);
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
  }, [t]);

  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    markersRef.current.forEach((marker, placeId) => {
      const markerElement = marker.getElement();
      markerElement.classList.toggle("is-active", placeId === selectedPlace.id);
    });

    mapRef.current?.flyTo({
      center: [selectedPlace.longitude, selectedPlace.latitude],
      essential: true,
      zoom: 12.2,
    });
  }, [selectedPlace]);

  function handleSelectPlace(place: CouplePlace) {
    setSelectedPlaceId(place.id);
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
              <p>{t("places.count", couplePlaces.length)}</p>
            </div>
            <span>{t("places.subtitle")}</span>
          </header>

          <div className='places-map-layout'>
            <div className='places-map-card'>
              {mapboxAccessToken ? (
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
                language={language}
                onNavigate={onNavigate}
              />
            ) : null}
          </div>

          <div className='places-list' aria-label={t("places.title")}>
            {couplePlaces.map((place) => (
              <button
                key={place.id}
                className={place.id === selectedPlace?.id ? "is-active" : undefined}
                type='button'
                onClick={() => handleSelectPlace(place)}
              >
                <img src={place.coverImage.src} alt={t(place.coverImage.altKey)} />
                <span>
                  <strong>{t(place.nameKey)}</strong>
                  <small>{formatVisitedDates(place.visitedDates, language)}</small>
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
  place: CouplePlace;
  language: string;
  onNavigate: (view: AppView) => void;
};

function PlaceDetail({ place, language, onNavigate }: PlaceDetailProps) {
  const { t } = useI18n();

  return (
    <article className='place-detail-card'>
      <img src={place.coverImage.src} alt={t(place.coverImage.altKey)} />
      <div className='place-detail-content'>
        <div className='place-detail-heading'>
          <span>{t(place.categoryKey)}</span>
          <h2>{t(place.nameKey)}</h2>
        </div>
        <p>{t(place.descriptionKey)}</p>
        <dl className='place-detail-meta'>
          <div>
            <CalendarDays aria-hidden='true' />
            <dt>{t("places.detail.visited")}</dt>
            <dd>{formatVisitedDates(place.visitedDates, language)}</dd>
          </div>
          <div>
            <Images aria-hidden='true' />
            <dt>{t("places.detail.memories", place.memories.length)}</dt>
            <dd>{place.memories.map((memory) => t(memory.titleKey)).join(", ")}</dd>
          </div>
        </dl>
        <button type='button' onClick={() => onNavigate("memories")}>
          {t("places.detail.viewMemories")}
        </button>
      </div>
    </article>
  );
}

function getPlacesCenter(places: CouplePlace[]): [number, number] {
  if (places.length === 0) {
    return [-98.2063, 19.0414];
  }

  const totals = places.reduce(
    (currentTotals, place) => ({
      latitude: currentTotals.latitude + place.latitude,
      longitude: currentTotals.longitude + place.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return [totals.longitude / places.length, totals.latitude / places.length];
}

function formatVisitedDates(dates: string[], language: string): string {
  return dates
    .map((date) =>
      new Intl.DateTimeFormat(language, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date)),
    )
    .join(" · ");
}
