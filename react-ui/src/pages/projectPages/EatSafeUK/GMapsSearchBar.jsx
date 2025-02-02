import { useState, useEffect, useCallback } from "react";
import { enrichPlaceResults } from "./enrichPlaceResults";
import { performNearbySearch } from "./nearbySearch";

const GMapsSearchBar = ({ onSearchResults, google, userLocation }) => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [sessionToken, setSessionToken] = useState(null);

    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500); // Adjust debounce delay as needed (500ms)

        return () => clearTimeout(handler);
    }, [query]);

    // Refresh session token every time a new search is initiated
    useEffect(() => {
        if (google) {
            setSessionToken(new google.maps.places.AutocompleteSessionToken());
        }
    }, [google, debouncedQuery]);

    const handleSearch = useCallback(async () => {
        if (!google) {
            console.warn("Google API not loaded");
            return;
        }

        const service = new google.maps.places.PlacesService(document.createElement("div"));
        onSearchResults([]); // Clear previous results

        try {
            if (userLocation) {
                // **1. Prioritize nearby search to reduce API cost**
                console.log("Performing location-based search near:", userLocation);
                await performNearbySearch(google, userLocation, onSearchResults);
            } else if (debouncedQuery) {
                // **2. Only use text search as fallback**
                console.log("Performing text search for query:", debouncedQuery);
                service.textSearch(
                    {
                        query: debouncedQuery,
                        sessionToken, // **3. Use session token to reduce billing**
                        fields: ["name", "place_id" ], // **4. Fetch only essential data**
                    },
                    async (results, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            const enrichedResults = await enrichPlaceResults(results, service, google);
                            onSearchResults(enrichedResults);
                        } else {
                            console.error("Text search failed with status:", status);
                        }
                    }
                );
            } else {
                console.warn("No query or user location provided");
            }
        } catch (error) {
            console.error("Error performing search:", error);
        }
    }, [google, debouncedQuery, userLocation, sessionToken, onSearchResults]);

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
