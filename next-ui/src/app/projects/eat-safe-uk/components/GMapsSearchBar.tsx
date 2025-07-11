'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { getDynamicPlaceholder } from "../utils/getDynamicPlaceholder";

interface SearchResult {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  addressComponents?: Array<{
    types: string[];
    shortText: string;
  }>;
}

interface Marker {
  id: string;
  key: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  addressComponents?: Array<{
    types: string[];
    shortText: string;
  }>;
  rating: string | null;
}

interface GMapsSearchBarProps {
  setSearchResults: (results: SearchResult[]) => void;
  setUserSearched?: (searched: boolean) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  selectedMarker: Marker | null;
  setSelectedMarker: (marker: Marker | null) => void;
}

const GMapsSearchBar: React.FC<GMapsSearchBarProps> = ({
  setSearchResults, 
  setUserSearched, 
  isSearching, 
  setIsSearching, 
  selectedMarker, 
  setSelectedMarker
}) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("Search restaurants...");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load environment variable for API key
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Set Debounce on search Query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 100);
    return () => clearTimeout(handler);
  }, [query]);

  // Handle Text Search
  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    setSelectedMarker(null);

    if (!GOOGLE_MAPS_API_KEY) {
      console.error("❌ Google Maps API key is missing. Check your .env file.");
      return;
    }

    if (!debouncedQuery) {
      console.warn("⚠️ No search query provided.");
      return;
    }

    try {
      const requestUrl = `https://places.googleapis.com/v1/places:searchText`;

      const payload = {
        textQuery: debouncedQuery,
        pageSize: 10
      };

      const headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location",
      };

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Google Places API Error: ${response.status} ${response.statusText}`);
        console.error(`Response Body: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log("✅ API Response:", data);

      if (data.places) {
        setSearchResults(data.places);
        if (setUserSearched) setUserSearched(true);
      } else {
        console.warn("⚠️ No results found for text search.");
        setSearchResults([]);
        if (setUserSearched) setUserSearched(true);
      }
    } catch (error) {
      console.error("🚨 Error performing text search:", error);
    }
  }, [debouncedQuery, setSearchResults, setUserSearched, setIsSearching, setSelectedMarker, GOOGLE_MAPS_API_KEY]);

  // Dynamically update placeholder
  useEffect(() => {
    const updatePlaceholder = () => {
      if (inputRef.current) {
        const inputWidth = inputRef.current.clientWidth;
        setPlaceholder(getDynamicPlaceholder(inputWidth));
      }
    };

    // Run on mount and when the window resizes
    updatePlaceholder();
    window.addEventListener("resize", updatePlaceholder);

    return () => {
      window.removeEventListener("resize", updatePlaceholder);
    };
  }, []);

  return (
    <div className="text-search-bar">
      <input
        type="text"
        ref={inputRef}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
          }
        }}
        className="search-input"
      />
      {isSearching ? (
        <div className="spinner"></div>
      ) : (
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      )}
    </div>
  );
};

export default GMapsSearchBar; 