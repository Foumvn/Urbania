import { useState, useCallback, useRef } from "react";
import api from "@/services/api";
import axios from "axios";

export interface CadastreParcelle {
  id: string;
  section: string;
  numero: string;
  commune: string;
  contenance: number; // Surface in m²
  reference: string; // Formatted reference (e.g., "AB 0123")
}

interface CadastreFeature {
  properties: {
    id: string;
    commune: string;
    section: string;
    numero: string;
    contenance: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface CadastreResponse {
  type: string;
  features: CadastreFeature[];
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Get centroid of a polygon
function getPolygonCentroid(coordinates: number[][][]): [number, number] {
  const points = coordinates[0]; // First ring
  let x = 0;
  let y = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    x += points[i][0];
    y += points[i][1];
  }

  return [x / n, y / n]; // [longitude, latitude]
}

export function useCadastreSearch() {
  const [parcelles, setParcelles] = useState<CadastreParcelle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const searchParcelles = useCallback(async (codeInsee: string, coordinates?: [number, number]) => {
    if (!codeInsee || codeInsee.length < 5) {
      setError("Code INSEE invalide");
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setParcelles([]);

    try {
      let data: CadastreResponse;

      if (coordinates) {
        // Search by coordinates via backend
        const [lon, lat] = coordinates;
        try {
          const response = await api.get('/cadastre/parcelle/coords/', {
            params: { lat, lon },
            signal: abortControllerRef.current.signal,
          });

          // Backend returns a single feature, wrap it
          data = {
            type: "FeatureCollection",
            features: [response.data]
          };
        } catch (e) {
          // Handle 404 cleanly
          if (e.response && e.response.status === 404) {
            data = { type: "FeatureCollection", features: [] };
          } else {
            throw e;
          }
        }
      } else {
        // Search by code INSEE via backend
        const response = await api.get(`/cadastre/parcelles/${codeInsee}/`, {
          signal: abortControllerRef.current.signal,
        });
        data = response.data;
      }

      processCadastreData(data, coordinates);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") { // Axios cancellation check
        // Don't set error on cancel
        if (!axios.isCancel(err)) {
          setError(err.message || "Erreur lors de la recherche cadastrale");
        }
      }
    } finally {
      setIsLoading(false);
    }
  },
    []
  );

  const processCadastreData = useCallback(
    (data: CadastreResponse, targetCoordinates?: [number, number]) => {
      if (!data.features || data.features.length === 0) {
        setParcelles([]);
        return;
      }

      let formattedParcelles: CadastreParcelle[] = data.features.map(
        (feature) => ({
          id: feature.properties.id,
          section: feature.properties.section,
          numero: feature.properties.numero,
          commune: feature.properties.commune,
          contenance: feature.properties.contenance,
          reference: `${feature.properties.section} ${feature.properties.numero}`,
        })
      );

      // If we have target coordinates, sort by proximity
      if (targetCoordinates && data.features[0]?.geometry) {
        const [targetLon, targetLat] = targetCoordinates;

        const parcellesWithDistance = data.features.map((feature, index) => {
          const centroid = getPolygonCentroid(
            feature.geometry.coordinates as number[][][]
          );
          const distance = calculateDistance(
            targetLat,
            targetLon,
            centroid[1],
            centroid[0]
          );
          return { index, distance };
        });

        parcellesWithDistance.sort((a, b) => a.distance - b.distance);

        formattedParcelles = parcellesWithDistance
          .slice(0, 5) // Take 5 closest
          .map(({ index }) => formattedParcelles[index]);
      } else {
        // Limit results
        formattedParcelles = formattedParcelles.slice(0, 10);
      }

      setParcelles(formattedParcelles);
    },
    []
  );

  const clearParcelles = useCallback(() => {
    setParcelles([]);
    setError(null);
  }, []);

  return {
    parcelles,
    isLoading,
    error,
    searchParcelles,
    clearParcelles,
  };
}
