import axios from "axios";

interface Place {
  id: string;
  name: string;
  formattedAddress?: string;
  addressComponents?: Array<{
    types: string[];
    shortText: string;
  }>;
  location?: {
    latitude: number;
    longitude: number;
  };
  position?: {
    lat: number;
    lng: number;
  };
}

interface HygieneScorePayload {
  place_id: string;
  name: string;
  address: string;
  postcode: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  position?: {
    lat: number;
    lng: number;
  };
}

/**
 * Fetches hygiene scores for a list of places using their postcodes.
 * @param places - Array of places.
 * @returns Promise<Object> - A map of hygiene scores indexed by place_id.
 */
export const fetchHygieneScores = async (places: Place[]): Promise<any> => {
  try {
    // Extract postcodes and normalize address data
    const payload: HygieneScorePayload[] = places.map((place) => {
      const postcodeComponent = place.addressComponents?.find(component =>
        component.types.some(type => type === "postal_code")
      );
      return {
        place_id: place.id,
        name: place.name || "Unknown",
        address: place.formattedAddress || "No Address Available",
        postcode: postcodeComponent ? postcodeComponent.shortText : "N/A",
        ...(place.location ? { location: place.location } : {}),
        ...(place.position ? { position: place.position } : {})
      };
    });

    console.log("📦 Payload sent to backend:", payload);

    // Make API request
    const response = await axios.post("/api/hygieneScoreRoute", { places: payload });

    return response.data;
  } catch (error) {
    console.error("🚨 Error fetching hygiene scores:", error);
    return {};
  }
}; 