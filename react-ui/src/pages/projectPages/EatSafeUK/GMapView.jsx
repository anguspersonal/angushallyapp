import React from "react";
import { useGoogleMap } from "./useGoogleMap";
import Markers from "./Markers";

/**
 * Main component rendering the Google Map and markers.
 */

const GMapView = ({ searchResults, userLocation }) => {
    const GOOGLE_MAPS_MAP_ID = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
    const { mapRef, mapInstanceRef, isMapsLoaded } = useGoogleMap(userLocation, GOOGLE_MAPS_MAP_ID);

    return (
        <div className="map-container" style={{ width: "100%", height: "80vh" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
            {isMapsLoaded && (
                <Markers mapInstanceRef={mapInstanceRef} searchResults={searchResults} isMapsLoaded={isMapsLoaded} />
            )}
        </div>
    );
};

export default GMapView;
