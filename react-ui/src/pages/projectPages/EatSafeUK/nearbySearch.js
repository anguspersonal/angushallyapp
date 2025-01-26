/**
 * Performs a nearby search using the Google Places API.
 * @param {Object} google - The Google API object.
 * @param {Object} location - The location object with `lat` and `lng` properties.
 * @param {Function} setSearchResults - Callback to set search results.
 * @param {Number} radius - The search radius in meters.
 */

import { enrichPlaceResults } from "./enrichPlaceResults";

export const performNearbySearch = async (google, userLocation, setSearchResults) => {
    if (!google || !userLocation) {
        console.warn("Google API or user location not available");
        return;
    }

    try {
        const service = new google.maps.places.PlacesService(document.createElement("div"));
        const request = {
            location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
            radius: 1500,
            type: ["restaurant"],
        };

        service.nearbySearch(request, async (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                try {
                    const enrichedResults = await enrichPlaceResults(results, service, google);
                    setSearchResults(enrichedResults); // Set enriched results
                } catch (error) {
                    console.error("Error enriching place results:", error);
                    setSearchResults(results); // Fallback to original results if enrichment fails
                }
            } else {
                console.error(`Nearby search failed with status: ${status}`);
            }
        });
    } catch (error) {
        console.error("Error performing nearby search:", error);
    }
};
