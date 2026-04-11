interface UserLocation {
  lat: number;
  lng: number;
}

interface SearchResult {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  addressComponents?: Array<{
    types: string[];
    shortText: string;
  }>;
}

/**
 * Performs a nearby search using the Google Places API.
 * @param userLocation - The location object with `lat` and `lng` properties.
 * @param setSearchResults - Callback to set search results.
 * @param radius - (Optional) The search radius in meters. Defaults to 500m.
 * @param maxResultCount - (Optional) Maximum number of results. Defaults to 5.
 */
export const performNearbySearch = async (
  userLocation: UserLocation, 
  setSearchResults: (results: SearchResult[]) => void, 
  radius: number = 500, 
  maxResultCount: number = 5
): Promise<void> => {
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
        "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location"
      },
      body: JSON.stringify(payload)
    });

    // Handle rate limits or API errors
    if (!response.ok) {
      console.error(`❌ Nearby Search API Error: ${response.status} ${response.statusText}`);
      setSearchResults([]);
      return;
    }

    const data = await response.json();
    if (data.places && Array.isArray(data.places)) {
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