import { performNearbySearch} from "./utils/nearbySearch";
import {askUserLocation} from "./utils/askUserLocation";

export default function NearbySearchButton({ setSearchResults, setUserLocation, setUserLocationPermission, setUserSearched, isSearching, setIsSearching, selectedMarker, setSelectedMarker }) {
    
    //Handle nearby search when user clicks button
    const handleNearbySearch = async () => {
        try {
            askUserLocation((location) => {
                if (location) {
                    setUserLocation(location);
                    setUserLocationPermission(true);
                    setUserSearched(true);
                    setIsSearching(true);
                    setSelectedMarker(null);

                    // Perform nearby search
                    performNearbySearch(location, setSearchResults);
                } else {
                    setUserLocationPermission(false);
                }
            });
        } catch (error) {
            console.error("Error in nearby search:", error);
        }
    };

    return (
        <button
          onClick={!isSearching ? handleNearbySearch : undefined}
          disabled={isSearching}
          className="search-button"
        >
          Find Nearby Places
        </button>
      );
      }
