import { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import '../index.css'; // Import the CSS file

// Create a single instance of Loader
const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
});

const GMapsSearchBar = ({ onSearchResults }) => {
    const [query, setQuery] = useState("");

    const handleSearch = async () => {
        try {
            const google = await loader.load();
            const service = new google.maps.places.PlacesService(document.createElement("div"));

            service.textSearch({ query }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    onSearchResults(results); // Pass results to the parent component
                } else {
                    console.error("PlacesService failed with status:", status);
                }
            });
        } catch (error) {
            console.error("Error loading Google Maps API:", error);
        }
    };

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
