import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/services/api";
import axios from "axios";

export interface AddressSuggestion {
  id: string;
  label: string;
  name: string;
  postcode: string;
  city: string;
  citycode: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface BANFeature {
  properties: {
    id: string;
    label: string;
    name: string;
    postcode: string;
    city: string;
    citycode: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface BANResponse {
  features: BANFeature[];
}

export function useAddressAutocomplete(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/cadastre/geocode/', {
        params: { q: searchQuery, limit: 5 },
        signal: abortControllerRef.current.signal,
      });

      const results = response.data.results || [];

      const formattedSuggestions: AddressSuggestion[] = results.map((item: any, index: number) => ({
        id: `addr-${index}-${Date.now()}`, // Generate a temporary unique ID
        label: item.label,
        name: item.label, // Backend 'label' is the full address
        postcode: item.postcode,
        city: item.city,
        citycode: item.citycode,
        coordinates: [item.longitude, item.latitude],
      }));

      setSuggestions(formattedSuggestions);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        if (!axios.isCancel(err)) {
          setError(err.message || "Erreur lors de la recherche d'adresse");
          setSuggestions([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      searchAddresses(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs, searchAddresses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    clearSuggestions,
  };
}
