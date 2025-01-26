import React, { useEffect, useRef } from 'react';
import { fetchHygieneScores } from './fetchHygienceScores';

// Default map settings
const defaultCentre = { lat: 51.509865, lng: -0.118092 }; // London
const defaultZoom = 15;

const GMapView = ({ searchResults, userLocation, google }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]); // Store references to markers

    // Initialize the map once when the component mounts
    useEffect(() => {
        if (!google || mapInstanceRef.current) return;

        const initializeMap = () => {
            const mapInstance = new google.maps.Map(mapRef.current, {
                center: userLocation || defaultCentre,
                zoom: defaultZoom,
            });
            mapInstanceRef.current = mapInstance;
        };

        initializeMap();
    }, [google, userLocation]);

    // Dynamically update markers and fetch hygiene scores
    useEffect(() => {
        if (!mapInstanceRef.current || !searchResults.length) return;
    
        const mapInstance = mapInstanceRef.current;
        const bounds = new google.maps.LatLngBounds();
    
        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Call the refactored function with the required arguments
        updateMarkersWithHygieneScores(searchResults, mapInstance, bounds, google, markersRef);
    }, [searchResults]);


    return <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>;
};

export default GMapView;


const updateMarkersWithHygieneScores = async (searchResults, mapInstance, bounds, google, markersRef) => {
    try {
        const markerMap = {}; // To store marker and info window references
        let currentInfoWindow = null; // Track the currently open InfoWindow

        // Create markers and info windows for search results
        searchResults.forEach((place) => {
            const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: mapInstance,
                title: place.name,
            });

            markersRef.current.push(marker); // Store marker reference

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div>
                        <h3>${place.name}</h3>
                        <p>${place.formatted_address}</p>
                        <p><strong>Postcode:</strong> ${place.postcode}</p>
                        <p><strong>Hygiene Rating:</strong> Loading...</p>
                    </div>
                `,
            });

            marker.addListener("click", () => {
                // Close the currently open InfoWindow, if any
                if (currentInfoWindow) {
                    currentInfoWindow.close();
                }

                // Open the new InfoWindow and update the reference
                infoWindow.open(mapInstance, marker);
                currentInfoWindow = infoWindow;
            });
                        bounds.extend(marker.getPosition());
            markerMap[place.place_id] = { marker, infoWindow };
        });

        mapInstance.fitBounds(bounds);

        // Fetch hygiene scores for all places
        const hygieneScores = await fetchHygieneScores(searchResults);

        // Updated validation logic
        if (!Array.isArray(hygieneScores)) {
            console.warn("Invalid hygiene scores data:", hygieneScores);
            return;
        }

        // Update info windows with hygiene scores
        searchResults.forEach((place) => {
            const { marker, infoWindow } = markerMap[place.place_id] || {};
            if (!marker || !infoWindow) return;

            const hygieneScore = hygieneScores.find(
                (score) => score.place_id === place.place_id
            )?.rating_value_num || 'N/A';

            infoWindow.setContent(`
                <div>
                    <h3>${place.name}</h3>
                    <p>${place.formatted_address}</p>
                    <p><strong>Hygiene Rating:</strong> ${
                        hygieneScore !== "N/A" ? `${hygieneScore}/5` : "N/A"
                    }</p>
                </div>
            `);
        });
    } catch (error) {
        console.error("Error updating markers and fetching hygiene scores:", error);
    }
};
