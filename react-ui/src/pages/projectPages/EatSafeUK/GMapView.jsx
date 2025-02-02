import React, { useEffect, useRef, useState } from "react";
import { fetchHygieneScores } from "./fetchHygieneScores";

const defaultCentre = { lat: 51.509865, lng: -0.118092 }; // Default to London
const defaultZoom = 15;

const GMapView = ({ searchResults, userLocation }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [isMapsLoaded, setIsMapsLoaded] = useState(false);

    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const GOOGLE_MAPS_MAP_ID = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID; // ✅ Add Map ID

    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            console.error("❌ Google Maps API key is missing. Check your .env file.");
            return;
        }

        if (!GOOGLE_MAPS_MAP_ID) {
            console.error("❌ Google Maps Map ID is missing. Get it from Google Cloud Console.");
            return;
        }

        if (window.google && window.google.maps) {
            setIsMapsLoaded(true);
            return;
        }

        console.log("📡 Loading Google Maps JavaScript API...");
        window.initMap = () => {
            console.log("✅ Google Maps API Loaded!");
            setIsMapsLoaded(true);
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker&callback=initMap&loading=async`;
        script.async = true;
        script.defer = true;

        script.onerror = () => console.error("❌ Failed to load Google Maps API");
        document.head.appendChild(script);
    }, [GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID]);

    useEffect(() => {
        if (!isMapsLoaded || !mapRef.current) return;

        if (mapInstanceRef.current) {
            console.log("🗺️ Google Map already initialized.");
            return;
        }

        console.log("🔍 Initializing Google Map...");
        const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: userLocation || defaultCentre,
            zoom: defaultZoom,
            mapId: GOOGLE_MAPS_MAP_ID, // ✅ Pass the Map ID here
            streetViewControl: false,
            zoomControl: true,
        });

        mapInstance.setOptions({
            padding: { top: 10, right: 40, bottom: 40, left: 10 },
        });

        mapInstanceRef.current = mapInstance;
    }, [isMapsLoaded, userLocation, GOOGLE_MAPS_MAP_ID]);

    useEffect(() => {
        if (!mapInstanceRef.current || searchResults.length === 0) return;

        console.log("📍 Fetching hygiene scores before placing new markers...");

        fetchHygieneScores(searchResults)
            .then((hygieneScores) => {
                console.log("✅ Hygiene scores fetched. Adding markers...");

                const mapInstance = mapInstanceRef.current;
                const bounds = new window.google.maps.LatLngBounds();

                // Remove old markers before adding new ones
                markersRef.current.forEach(marker => marker.map = null);
                markersRef.current = [];

                searchResults.forEach((place) => {
                    if (!place.location?.latitude || !place.location?.longitude) {
                        console.warn("⚠️ Skipping marker due to missing location data:", place);
                        return;
                    }

                    // console.log(`📌 Adding marker for: ${place.displayName?.text || "Unknown Place"}`);

                    const marker = new window.google.maps.marker.AdvancedMarkerElement({
                        position: new window.google.maps.LatLng(
                            place.location.latitude, 
                            place.location.longitude
                        ),
                        map: mapInstance,
                        title: place.displayName?.text || "Unknown Place",
                    });

                    markersRef.current.push(marker);

                    // Find matching hygiene score
                    const hygieneScore = hygieneScores.find(
                        (score) => score.place_id === place.id
                    )?.rating_value_num || 'N/A';

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div>
                                <h3>${place.displayName?.text || "Unknown Place"}</h3>
                                <p>${place.formattedAddress || "No Address Available"}</p>
                                <p><strong>Hygiene Rating:</strong> ${hygieneScore !== "N/A" ? `${hygieneScore}/5` : "N/A"}</p>
                            </div>
                        `,
                    });

                    marker.addListener("click", () => {
                        infoWindow.open(mapInstance, marker);
                    });

                    bounds.extend(marker.position);
                });

                mapInstance.fitBounds(bounds);
            })
            .catch(error => console.error("🚨 Error fetching hygiene scores:", error));

    }, [searchResults]);

    return <div ref={mapRef} className="map-container" style={{ width: "100%", height: "80vh" }}></div>;
};

export default GMapView;
