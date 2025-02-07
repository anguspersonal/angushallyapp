import { useState, useEffect, useCallback, useRef } from "react";
import { askForLocationPermission } from "./utils/askUserLocation";
import { getDynamicPlaceholder } from "./utils/getDynamicPlaceholder";


const GMapsSearchBar = ({setSearchResults, setUserSearched, isSearching, setIsSearching}) => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [placeholder, setPlaceholder] = useState("Search restaurants...");
    const inputRef = useRef(null);

    // Load environment variable for API key
    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    //Set Debounce on search Query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 1000);
        return () => clearTimeout(handler);
    }, [query]);


    // Handle Text Search
    const handleSearch = useCallback(async () => {

        setIsSearching(true);
        
        if (!GOOGLE_MAPS_API_KEY) {
            console.error("❌ Google Maps API key is missing. Check your .env file.");
            return;
        }

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
                textQuery: debouncedQuery, // ✅ Ensure correct formatting,
                pageSize: 10
            };

            const headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location",
            };

            console.log("📡 Sending request to Google Places API:", payload);

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
                setUserSearched(true);
            } else {
                console.warn("⚠️ No results found for text search.");
                setSearchResults([]);
                setUserSearched(true);
            }
        } catch (error) {
            console.error("🚨 Error performing text search:", error);
        }
    }, [debouncedQuery, setSearchResults]);


    //Dynamically update placeholder
    useEffect(() => {
        const updatePlaceholder = () => {
            if (inputRef.current) {
                const inputWidth = inputRef.current.clientWidth;
                setPlaceholder(getDynamicPlaceholder(inputWidth)); // Use the utility function
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
                className="search-input"
            />
            {isSearching ? (<div className="spinner"></div>) :
             (<button onClick={handleSearch} className="search-button">
             Search
         </button>)}
           
            
        </div>
    );
};

export default GMapsSearchBar;
