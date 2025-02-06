import { performNearbySearch} from "./utils/nearbySearch";
import {askUserLocation} from "./utils/askUserLocation";

export default function NearbySearchButton({ setSearchResults, setUserLocation, setUserLocationPermission, setUserSearched }) {
    const handleNearbySearch = async () => {
        try {
            askUserLocation((location) => {
                if (location) {
                    setUserLocation(location);
                    setUserLocationPermission(true);
                    setUserSearched(true);

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

    return <button onClick={handleNearbySearch}>Find Nearby Places</button>;
}
