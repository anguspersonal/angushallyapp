/**
 * Enriches Places API search results by fetching additional details.
 * This version tracks `getDetails()` calls *without* optimization.
 */
export const enrichPlaceResults = async (results, service, google) => {
    if (!google) {
        console.error("Google API not loaded. Returning original results.");
        return results.map((place) => ({
            ...place,
            formatted_address: place.vicinity || "N/A",
            postcode: "N/A",
        }));
    }

    let getDetailsCallCount = 0; // Track total API calls
    let observedFields = {}; // Track which fields are returned by default

    console.log(`🔍 Processing ${results.length} places for enrichment...`);

    const enrichedResultsPromises = results.map((place) =>
        new Promise((resolve) => {
            getDetailsCallCount++; // Increment API call count

            console.log(`📡 Calling getDetails() for "${place.name}" (place_id: ${place.place_id})`);
            console.log(`📝 Requested Fields: formatted_address, address_components`);

            service.getDetails(
                { placeId: place.place_id, fields: ["formatted_address", "address_components"] },
                (details, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // Log which fields were returned
                        Object.keys(details).forEach((field) => {
                            //log details for the place
                            console.log(details);
                            observedFields[field] = (observedFields[field] || 0) + 1;
                        });

                        const postalCodeComponent = details.address_components?.find((component) =>
                            component.types.includes("postal_code")
                        );

                        resolve({
                            ...place,
                            formatted_address: details.formatted_address || place.vicinity || "N/A",
                            postcode: postalCodeComponent ? postalCodeComponent.long_name : "N/A",
                        });
                    } else {
                        console.warn(`⚠️ getDetails() failed for "${place.name}" (place_id: ${place.place_id})`);
                        resolve({
                            ...place,
                            formatted_address: place.vicinity || "N/A",
                            postcode: "N/A",
                        });
                    }
                }
            );
        })
    );

    const enrichedResults = await Promise.all(enrichedResultsPromises);

    console.log(`📊 Total getDetails() calls made: ${getDetailsCallCount}/${results.length}`);
    console.log(`📋 Fields Returned by getDetails():`, observedFields);

    return enrichedResults;
};
