// @ts-nocheck
/**
 * Performs a nearby search using the Google Places API.
 * @param {Object} userLocation - The location object with `lat` and `lng` properties.
 * @param {Function} setSearchResults - Callback to set search results.
 * @param {Number} radius - (Optional) The search radius in meters. Defaults to 1500m.
 */
export const performNearbySearch = async (userLocation, setSearchResults, radius = 500, maxResultCount = 5) => {
    if (!userLocation) {
        console.warn("User location not available");
        return;
    }

    try {
        const requestUrl = `https://places.googleapis.com/v1/places:searchNearby`;

        const payload = {
            includedTypes: ["restaurant"],
            maxResultCount: maxResultCount,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: userLocation.lat,
                        longitude: userLocation.lng
                    },
                    radius: radius
                }
            }
        };

        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location"
            },
            body: JSON.stringify(payload)
        });

        // Log API response status for debugging
        // console.log(`📡 Nearby Search API Response: ${response.status} ${response.statusText}`);

        // Handle rate limits or API errors
        if (!response.ok) {
            console.error(`❌ Nearby Search API Error: ${response.status} ${response.statusText}`);
            setSearchResults([]);
            return;
        }

        const data = await response.json();
        if (data.places && Array.isArray(data.places)) {
            // console.log(`✅ Found ${data.places.length} nearby restaurants`,data.places);
            setSearchResults(data.places);
        } else {
            console.warn("⚠️ No places found in API response");
            setSearchResults([]);
        }
    } catch (error) {
        console.error("🚨 Error performing nearby search:", error);
        setSearchResults([]);
    }
};
