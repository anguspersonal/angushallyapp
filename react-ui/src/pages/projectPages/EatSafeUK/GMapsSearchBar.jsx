import { useState } from "react";
import { enrichPlaceResults } from "./enrichPlaceResults";
import { performNearbySearch } from "./nearbySearch";

const GMapsSearchBar = ({ onSearchResults, google, userLocation }) => {
    const [query, setQuery] = useState("");

    const handleSearch = async () => {
        try {
            if (!google) {
                console.warn("Google API not loaded");
                return;
            }

            const service = new google.maps.places.PlacesService(document.createElement("div"));

            // Clear current search results
            onSearchResults([]);

            if (query) {
                // Perform query-based search
                console.log("Performing text search for query:", query);;
                service.textSearch({ query }, async (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        const enrichedResults = await enrichPlaceResults(results, service, google);
                        onSearchResults(enrichedResults);
                    } else {
                        console.error("Text search failed with status:", status);
                    }
                });
            } else if (userLocation) {
                // Perform location-based search using utility
                console.log("Performing location-based search near:", userLocation);
                await performNearbySearch(google, userLocation, onSearchResults);
            } else {
                console.warn("No query or user location provided");
            }
        } catch (error) {
            console.error("Error performing search:", error);
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search restaurants..."
                value={query}
                onChange={(e) => setQuery(e.target.value)} // Correctly formatted onChange handler
                className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
                Search
            </button>
        </div>
    );
};

export default GMapsSearchBar;
