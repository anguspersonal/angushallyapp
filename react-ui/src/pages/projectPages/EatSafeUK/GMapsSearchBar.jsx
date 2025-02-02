import { useState, useEffect, useCallback } from "react";

const GMapsSearchBar = ({ onSearchResults }) => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Load environment variable for API key
    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    const handleSearch = useCallback(async () => {
        if (!debouncedQuery) {
            console.warn("⚠️ No search query provided.");
            return;
        }

        if (!GOOGLE_MAPS_API_KEY) {
            console.error("❌ Google Maps API key is missing. Check your .env file.");
            return;
        }

        try {
            const requestUrl = `https://places.googleapis.com/v1/places:searchText`;

            const payload = {
                textQuery: debouncedQuery // ✅ Ensure correct formatting
            };

            const headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location"
            };

            console.log("📡 Sending request to Google Places API:", payload);

            const response = await fetch(requestUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Google Places API Error: ${response.status} ${response.statusText}`);
                console.error(`Response Body: ${errorText}`);
                return;
            }

            const data = await response.json();
            console.log("✅ API Response:", data[0]);

            if (data.places) {
                onSearchResults(data.places);
            } else {
                console.warn("⚠️ No results found for text search.");
                onSearchResults([]);
            }
        } catch (error) {
            console.error("🚨 Error performing text search:", error);
        }
    }, [debouncedQuery, onSearchResults, GOOGLE_MAPS_API_KEY]);

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search restaurants..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
                Search
            </button>
        </div>
    );
};

export default GMapsSearchBar;
