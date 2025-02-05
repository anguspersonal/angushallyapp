import { useEffect, useRef } from "react";
import { fetchHygieneScores } from "./fetchHygieneScores";

/**
 * Component responsible for adding markers to a Google Map instance.
 * Fetches hygiene scores and displays markers with info windows.
 */

const Markers = ({ mapInstanceRef, searchResults, isMapsLoaded }) => {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!isMapsLoaded || !mapInstanceRef.current || searchResults.length === 0) return;

        console.log("📍 Fetching hygiene scores before placing new markers...");

        fetchHygieneScores(searchResults)
            .then((hygieneScores) => {
                console.log("✅ Hygiene scores fetched. Adding markers...");

                const mapInstance = mapInstanceRef.current;
                const bounds = new window.google.maps.LatLngBounds();

                // Remove old markers before adding new ones
                markersRef.current.forEach(marker => marker.setMap(null));
                markersRef.current = [];

                let activeInfoWindow = null;

                searchResults.forEach((place) => {
                    if (!place.location?.latitude || !place.location?.longitude) {
                        console.warn("⚠️ Skipping marker due to missing location data:", place);
                        return;
                    }

                    const marker = new window.google.maps.marker.AdvancedMarkerElement({
                        position: new window.google.maps.LatLng(
                            place.location.latitude, 
                            place.location.longitude
                        ),
                        map: mapInstance,
                        title: place.displayName?.text || "Unknown Place",
                    });

                    markersRef.current.push(marker);

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
                        if (activeInfoWindow) {
                            activeInfoWindow.close();
                        }
                        infoWindow.open(mapInstance, marker);
                        activeInfoWindow = infoWindow;
                    });

                    bounds.extend(marker.position);
                });

                mapInstance.fitBounds(bounds);
            })
            .catch(error => console.error("🚨 Error fetching hygiene scores:", error));
    }, [searchResults, isMapsLoaded]);

    return null;
};

export default Markers;
