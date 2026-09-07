import type mapboxgl from "mapbox-gl";
import { Crosshair, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { mapboxAccessToken } from "../config/mapbox";
import { useI18n } from "../i18n/I18nContext";

type LocationPickerProps = {
  location: string;
  latitude: string;
  longitude: string;
  onLocationChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
};

type MapboxFeature = {
  id: string;
  geometry?: { coordinates?: [number, number] };
  properties?: {
    full_address?: string;
    coordinates?: { latitude?: number; longitude?: number };
  };
  place_name?: string;
  name?: string;
};

type MapboxSearchResponse = { features?: MapboxFeature[] };

type Coordinates = { latitude: number; longitude: number };

const defaultCenter: [number, number] = [-98.2063, 19.0414];

export function LocationPicker({
  location,
  latitude,
  longitude,
  onLocationChange,
  onLatitudeChange,
  onLongitudeChange,
}: LocationPickerProps) {
  const { t } = useI18n();
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const selectedLocationRef = useRef(location);
  const coordinates = getCoordinates(latitude, longitude);

  useEffect(() => {
    const query = location.trim();
    if (!mapboxAccessToken || query.length < 3 || query === selectedLocationRef.current) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const response = await fetch(createSearchUrl(query), { signal: controller.signal });
        if (!response.ok) throw new Error("Location search failed.");
        const data: MapboxSearchResponse = await response.json();
        setSuggestions(data.features ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSearchError(t("locationPicker.searchError"));
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [location, t]);

  function selectSuggestion(feature: MapboxFeature) {
    const resultCoordinates = getFeatureCoordinates(feature);
    const selectedLocation = getFeatureLabel(feature);
    selectedLocationRef.current = selectedLocation;
    onLocationChange(selectedLocation);
    if (resultCoordinates) setCoordinateValues(resultCoordinates, onLatitudeChange, onLongitudeChange);
    setSuggestions([]);
    setSearchError("");
    setIsMapOpen(true);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setSearchError(t("locationPicker.locationUnavailable"));
      return;
    }

    setIsLocating(true);
    setSearchError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinateValues(coords, onLatitudeChange, onLongitudeChange);
        setIsLocating(false);
        setIsMapOpen(true);
      },
      () => {
        setSearchError(t("locationPicker.locationUnavailable"));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <section className="location-picker">
      <label className="location-picker-search">
        <span>{t("locationPicker.searchLabel")}</span>
        <span className="location-picker-input-wrap">
          <Search aria-hidden="true" />
          <input value={location} placeholder={t("locationPicker.searchPlaceholder")} autoComplete="off" onChange={(event) => { selectedLocationRef.current = ""; onLocationChange(event.target.value); }} />
          {isSearching ? <span className="location-picker-status">{t("locationPicker.searching")}</span> : null}
        </span>
      </label>
      {suggestions.length > 0 ? (
        <ul className="location-picker-results" role="listbox">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button type="button" onClick={() => selectSuggestion(suggestion)}>
                <MapPin aria-hidden="true" />
                <span>{getFeatureLabel(suggestion)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {!isSearching && !searchError && location.trim().length >= 3 && suggestions.length === 0 && mapboxAccessToken ? <p className="location-picker-message">{t("locationPicker.noResults")}</p> : null}
      <div className="location-picker-actions">
        <button type="button" onClick={useCurrentLocation} disabled={isLocating}>
          <Crosshair aria-hidden="true" />
          {isLocating ? t("locationPicker.locating") : t("locationPicker.currentLocation")}
        </button>
        {mapboxAccessToken ? <button type="button" onClick={() => setIsMapOpen((open) => !open)}><MapPin aria-hidden="true" />{isMapOpen ? t("locationPicker.hideMap") : t("locationPicker.adjustOnMap")}</button> : null}
      </div>
      {searchError ? <p className="location-picker-message location-picker-message--error">{searchError}</p> : null}
      {!mapboxAccessToken ? <p className="location-picker-message">{t("locationPicker.noToken")}</p> : null}
      {isMapOpen && mapboxAccessToken ? <LocationMap coordinates={coordinates} onCoordinatesChange={(nextCoordinates) => setCoordinateValues(nextCoordinates, onLatitudeChange, onLongitudeChange)} /> : null}
      <details className="location-picker-advanced">
        <summary>{t("locationPicker.advancedCoordinates")}</summary>
        <div>
          <label><span>{t("memoryForm.latitudeLabel")}</span><input name="latitude" type="number" inputMode="decimal" min="-90" max="90" step="any" value={latitude} placeholder="19.043300" onChange={(event) => onLatitudeChange(event.target.value)} /></label>
          <label><span>{t("memoryForm.longitudeLabel")}</span><input name="longitude" type="number" inputMode="decimal" min="-180" max="180" step="any" value={longitude} placeholder="-98.201900" onChange={(event) => onLongitudeChange(event.target.value)} /></label>
        </div>
        <small>{t("memoryForm.coordinatesHint")}</small>
      </details>
    </section>
  );
}

function LocationMap({ coordinates, onCoordinatesChange }: { coordinates: Coordinates | undefined; onCoordinatesChange: (coordinates: Coordinates) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>();
  const markerRef = useRef<mapboxgl.Marker>();
  const initialCoordinatesRef = useRef(coordinates);
  const onCoordinatesChangeRef = useRef(onCoordinatesChange);
  onCoordinatesChangeRef.current = onCoordinatesChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let isDisposed = false;
    let map: mapboxgl.Map | undefined;

    void Promise.all([import("mapbox-gl"), import("mapbox-gl/dist/mapbox-gl.css")]).then(([mapboxModule]) => {
      if (isDisposed || !containerRef.current) return;
      const mapbox = mapboxModule.default;
      mapbox.accessToken = mapboxAccessToken;
      const initialCoordinates = initialCoordinatesRef.current;
      const initialCenter: [number, number] = initialCoordinates ? [initialCoordinates.longitude, initialCoordinates.latitude] : defaultCenter;
      map = new mapbox.Map({ container: containerRef.current, style: "mapbox://styles/mapbox/dark-v11", center: initialCenter, zoom: initialCoordinates ? 14 : 10 });
      const marker = new mapbox.Marker({ color: "#ed93b1", draggable: true }).setLngLat(initialCenter).addTo(map);
      marker.on("dragend", () => onCoordinatesChangeRef.current(toCoordinates(marker.getLngLat())));
      map.on("click", (event) => {
        marker.setLngLat(event.lngLat);
        onCoordinatesChangeRef.current(toCoordinates(event.lngLat));
      });
      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      isDisposed = true;
      map?.remove();
      mapRef.current = undefined;
      markerRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (!coordinates || !mapRef.current || !markerRef.current) return;
    const lngLat: [number, number] = [coordinates.longitude, coordinates.latitude];
    markerRef.current.setLngLat(lngLat);
    mapRef.current.easeTo({ center: lngLat, duration: 300 });
  }, [coordinates]);

  return <div ref={containerRef} className="location-picker-map" aria-label="Location map" />;
}

function createSearchUrl(query: string) {
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", mapboxAccessToken);
  url.searchParams.set("limit", "5");
  url.searchParams.set("types", "address,street,neighborhood,locality,place");
  return url;
}

function getFeatureCoordinates(feature: MapboxFeature): Coordinates | undefined {
  const coordinates = feature.properties?.coordinates;
  if (typeof coordinates?.latitude === "number" && typeof coordinates.longitude === "number") {
    return { latitude: coordinates.latitude, longitude: coordinates.longitude };
  }
  const geometryCoordinates = feature.geometry?.coordinates;
  if (!geometryCoordinates) return undefined;
  return { longitude: geometryCoordinates[0], latitude: geometryCoordinates[1] };
}

function getFeatureLabel(feature: MapboxFeature) {
  return feature.properties?.full_address || feature.place_name || feature.name || "";
}

function getCoordinates(latitude: string, longitude: string): Coordinates | undefined {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) return undefined;
  return { latitude: parsedLatitude, longitude: parsedLongitude };
}

function setCoordinateValues(coordinates: Coordinates | GeolocationCoordinates, onLatitudeChange: (value: string) => void, onLongitudeChange: (value: string) => void) {
  onLatitudeChange(String(coordinates.latitude));
  onLongitudeChange(String(coordinates.longitude));
}

function toCoordinates(lngLat: mapboxgl.LngLat): Coordinates {
  return { latitude: lngLat.lat, longitude: lngLat.lng };
}
