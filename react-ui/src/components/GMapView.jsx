import React, { useEffect, useRef } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import '../index.css'; // Import the CSS file

const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
});

const GMapView = ({ searchResults }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        const initializeMap = async () => {
            try {
                const google = await loader.load();
                const map = new google.maps.Map(mapRef.current, {
                    center: { lat: 51.509865, lng: -0.118092 }, // Default center (London)
                    zoom: 10,
                });

                if (searchResults.length > 0) {
                    const bounds = new google.maps.LatLngBounds();

                    searchResults.forEach(async (place) => {
                        // const hygieneScore = await fetchHygieneScore(place.name, place.formatted_address);
                        
                        // Add markers for search results
                        const marker = new google.maps.Marker({
                            position: place.geometry.location,
                            map: map,
                            title: place.name,
                        });

                        // Extend the bounds to include each marker's position
                        bounds.extend(marker.getPosition());

                        // Create InfoWindow for each marker
                        const infoWindow = new google.maps.InfoWindow({
                            content: `
                                <div>
                                    <h3>${place.name}</h3>
                                    <p>${place.formatted_address}</p>
                                    <p><strong>Hygiene Rating:</strong> hygieneScore?.RatingValue/5 || 'N/A'</p>
                                </div>
                            `,
                        });

                        // Open InfoWindow on marker click
                        marker.addListener("click", () => {
                            infoWindow.open(map, marker);
                        });
                    });

                    // Adjust the map's viewport to fit the bounds of all markers
                    map.fitBounds(bounds);

                    // Set a minimum zoom level
                    const listener = google.maps.event.addListener(map, "idle", () => {
                        if (map.getZoom() > 13) map.setZoom(13);
                        google.maps.event.removeListener(listener);
                    });
                }
            } catch (error) {
                console.error("Error initializing map:", error);
            }
        };

        initializeMap();
    }, [searchResults]);

    // const fetchHygieneScore = async (name, address) => {
    //     try {
    //         const response = await fetch(`/api/hygiene-score?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}`);
    //         const data = await response.json();
    //         if (response.ok) {
    //             return data;
    //         } else {
    //             console.warn(`Hygiene score not found: ${data.error}`);
    //             return null;
    //         }
    //     } catch (error) {
    //         console.error("Failed to fetch hygiene score:", error);
    //         return null;
    //     }
    // };

    return <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>;
};

export default GMapView;
