import axios from "axios";

/**
 * Fetches hygiene scores for a list of places using their postcodes.
 * @param {Array} places - Array of places, each containing a `postcode` and other details.
 * @returns {Promise<Object>} - A map of hygiene scores indexed by place_id.
 */
export const fetchHygieneScores = async (places) => {
    try {
        // Extract the relevant data (e.g., postcodes) from the places array
        const payload = places.map((place) => ({
            place_id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            postcode: place.postcode,
        }));

        // Make a POST request to your backend route
        const response = await axios.post("/api/hygieneScoreRoute", { places: payload });
        // Return a map of hygiene scores
        return response.data; // Assume backend returns a map: { place_id: hygieneScore }
    } catch (error) {
        console.error("Error fetching hygiene scores:", error);
        return {}; // Return an empty object on failure
    }
};
