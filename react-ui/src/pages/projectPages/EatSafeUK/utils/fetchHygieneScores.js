import axios from "axios";

/**
 * Fetches hygiene scores for a list of places using their postcodes.
 * @param {Array} places - Array of places.
 * @returns {Promise<Object>} - A map of hygiene scores indexed by place_id.
 */
export const fetchHygieneScores = async (places) => {
    try {
        // console.log("🔍 Received places for hygiene lookup:", places);

        // Extract postcodes and normalize address data
        const payload = places.map((place) => {
            const postcodeComponent = place.addressComponents?.find(component =>
                component.types.some(type => type === "postal_code")
            );
            return {
                place_id: place.id,
                name: place.displayName?.text || "Unknown",
                address: place.formattedAddress || "No Address Available",
                postcode: postcodeComponent ? postcodeComponent.shortText : "N/A",
                location: place.location
            };
        });

        // console.log("📦 Payload sent to backend:", payload);

        // Make API request
        const response = await axios.post("/api/hygieneScoreRoute", { places: payload });

        console.log("✅ Received hygiene scores:", response.data);
        return response.data;
    } catch (error) {
        console.error("🚨 Error fetching hygiene scores:", error);
        return {};
    }
};
