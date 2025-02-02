/**
 * Enriches Places API search results by fetching additional details.
 * This version tracks `getDetails()` calls *without* optimization.
 */
export const enrichPlaceResults = async (results) => {
    if (!results || results.length === 0) {
        return [];
    }

    let getDetailsCallCount = 0;
    console.log(`🔍 Processing ${results.length} places for enrichment...`);

    const enrichedResultsPromises = results.map(async (place) => {
        try {
            const placeDetailsUrl = `https://places.googleapis.com/v1/places/${place.id}`;

            const response = await fetch(placeDetailsUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                    "X-Goog-FieldMask": "formattedAddress,location"
                }
            });

            const details = await response.json();
            getDetailsCallCount++;

            return {
                ...place,
                formatted_address: details.formattedAddress || "N/A",
                postcode: "N/A", // We need a separate function to extract postcode if available
                location: details.location
            };
        } catch (error) {
            console.warn(`⚠️ getDetails() failed for "${place.displayName}" (place_id: ${place.id})`);
            return {
                ...place,
                formatted_address: "N/A",
                postcode: "N/A"
            };
        }
    });

    const enrichedResults = await Promise.all(enrichedResultsPromises);
    console.log(`📊 Total getDetails() calls made: ${getDetailsCallCount}/${results.length}`);

    return enrichedResults;
};

