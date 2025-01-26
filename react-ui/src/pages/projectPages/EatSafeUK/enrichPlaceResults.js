/**
 * Enriches Places API search results by fetching additional details (e.g., postcodes and formatted_address).
 * @param {Array} results - Array of Places search results.
 * @param {Object} service - Google PlacesService instance.
 * @param {Object} google - Google API object.
 * @returns {Promise<Array>} - Enriched results including postcodes and formatted_address.
 */
export const enrichPlaceResults = async (results, service, google) => {
    // Validate that the Google API is loaded
    if (!google) {
        console.error("Google API not loaded. Returning original results.");
        return results.map((place) => ({
            ...place,
            formatted_address: place.vicinity || "N/A",
            postcode: "N/A",
        }));
    }

    const enrichedResultsPromises = results.map((place) =>
        new Promise((resolve) => {
            try {
            service.getDetails({ placeId: place.place_id }, (details, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    const postalCodeComponent = details.address_components.find((component) =>
                        component.types.includes("postal_code")
                    );
                    resolve({
                        ...place,
                        formatted_address: details.formatted_address,
                        postcode: postalCodeComponent ? postalCodeComponent.long_name : "N/A",
                    });
                } else {
                    console.warn(`Failed to fetch details for place ID ${place.place_id}`);
                    resolve({
                        ...place,
                        formatted_address: place.vicinity || "N/A", // Fallback to vicinity
                        postcode: "N/A",
                    });
                }
            });
        } catch (error) { console.error(`Unexpected error during getDetails for place ID ${place.place_id}:`, error);
        resolve({
            ...place,
            formatted_address: place.vicinity || "N/A",
            postcode: "N/A",
        });
    }
        })
    );

    return Promise.all(enrichedResultsPromises); // Wait for all promises to resolve
};
