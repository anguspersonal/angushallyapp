import React, { useState, useEffect, useRef, useCallback } from "react";
import { AdvancedMarker, Pin, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Marker } from "@googlemaps/markerclusterer";

/**
 * Combined Markers Component
 * @param {Array} places - Array of place objects with shape:
 *   {
 *     place_id: string,
 *     name: string,
 *     address: string,
 *     rating: number,
 *     position: { lat: number, lng: number },
 *     ...any other fields...
 *   }
 */
const Markers = ({ places, selectedMarker, setSelectedMarker, isSearching, setIsSearching }) => {
  // 1) Acquire the map instance from context
  const map = useMap();

  // 2) Keep marker instances in a ref (NOT in state) to avoid infinite loops
  const markerInstancesRef = useRef({});

  // 3) MarkerClusterer reference (also a ref, no re-renders needed)
  const clustererRef = useRef(null);

  // 4) Track the currently selected marker for InfoWindow
  // ///moved to grandparent

  // 5) Initialise the clusterer once (if map is ready)
  useEffect(() => {
    if (map && !clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map });
    }
  }, [map]);

  // 6) Every time we update markerInstancesRef, re-cluster
  //    We'll handle that in 'setMarkerRef' callback below so it’s immediate

  // 7) Store the old places array in a ref or state to detect changes
  const [prevPlacesJSON, setPrevPlacesJSON] = useState("");
  useEffect(() => {
    if (!map || !window.google) return;
    if (!places || places.length === 0) return;

    // Compare JSON to see if places actually changed
    const currentPlacesJSON = JSON.stringify(places);
    if (currentPlacesJSON === prevPlacesJSON) {
      return; // skip bounding if same data
    }
    setPrevPlacesJSON(currentPlacesJSON);

    // 8) Fit bounds around all place positions
    const bounds = new window.google.maps.LatLngBounds();
    places.forEach((p) => {
      if (p.position?.lat && p.position?.lng) {
        bounds.extend(p.position);
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
      // Optionally clamp zoom if there's only 1 marker
      if (places.length === 1) {
        map.setZoom(15);
      }
    }
  }, [map, places, prevPlacesJSON]);

  // 9) Callback ref for each marker - store or remove the marker instance
  const setMarkerRef = useCallback((markerInstance, placeId) => {
    // If there's no clusterer or no map yet, skip
    if (!clustererRef.current) return;

    // If marker unmounts, remove it
    if (!markerInstance) {
      if (markerInstancesRef.current[placeId]) {
        delete markerInstancesRef.current[placeId];
        // Re-cluster
        clustererRef.current.clearMarkers();
        clustererRef.current.addMarkers(Object.values(markerInstancesRef.current));
      }
      return;
    }

    // If marker mounts, add/update it
    const existing = markerInstancesRef.current[placeId];
    if (existing !== markerInstance) {
      markerInstancesRef.current[placeId] = markerInstance;
      // Re-cluster
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(Object.values(markerInstancesRef.current));
    }
  }, []);

  // 10) Marker click handler (pan + InfoWindow)
  const handleMarkerClick = useCallback(
    (event, placeData) => {
      if (!map || !event.latLng) return;
      map.panTo(event.latLng);
      setSelectedMarker(placeData);
    },
    [map]
  );

  // 11) If map is not ready, return null (ensures hooks are unconditionally declared)
  if (!map) {
    return null;
  }

  // 12) Render the markers + InfoWindow
  return (
    <>
      {places.map((place) => (
        <AdvancedMarker
          key={place.place_id}
          position={place.position}
          ref={(markerInstance) => setMarkerRef(markerInstance, place.place_id)}
          onClick={(e) => handleMarkerClick(e, place)}
        >
          <Pin background="#FBBC04" glyphColor="#000" borderColor="#000" />
        </AdvancedMarker>
      ))}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => setSelectedMarker(null)}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="info-window-content">
            <h3>{selectedMarker.name || "No Name"}</h3>
            <p>{selectedMarker.address || "No Address Available"}</p>
            <p>
              <strong>Hygiene Rating:</strong>{" "}
              {selectedMarker.rating ? `${selectedMarker.rating}/5` : "N/A"}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default Markers;
