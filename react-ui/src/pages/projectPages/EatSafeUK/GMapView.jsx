import React from "react";
// import { useGoogleMap } from "./useGoogleMap";
import Markers from "./Markers";
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import '../../../index.css';
import './EatSafeUK.css';


/**
 * Main component rendering the Google Map and markers.
 */


const GMapView = ({ searchResults, userLocation }) => {
    const mapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const mapsID = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
    // const { mapRef, mapInstanceRef, isMapsLoaded } = useGoogleMap(userLocation, GOOGLE_MAPS_MAP_ID);

    return (
        <div className="map-container">
            <APIProvider apiKey={mapsApiKey} className="invisible_wrapper" onLoad={() => console.log('Maps API has loaded.')}>
                <Map
                    defaultZoom={13}
                    defaultCenter={{ lat: 51.5074, lng: -0.1278 }}
                    className="google-map"
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId={mapsID}
                    // onCameraChanged={(ev) => {
                    //     console.log("Camera changed:", ev.detail.center, "Zoom:", ev.detail.zoom);
                    // }}
                >
                </Map>
            </APIProvider>
        </div>
    )
};


export default GMapView;
