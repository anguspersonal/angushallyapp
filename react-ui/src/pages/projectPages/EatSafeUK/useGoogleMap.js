import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to initialize Google Maps dynamically.
 * ✅ Manually loads Google Maps before calling importLibrary()
 */

const defaultCentre = { lat: 51.509865, lng: -0.118092 }; // Default to London
const defaultZoom = 15;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const useGoogleMap = (userLocation, mapId) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [isMapsLoaded, setIsMapsLoaded] = useState(false);

    /** ✅ Function to manually load Google Maps script if missing */
    const loadGoogleMapsScript = () => {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                console.log("✅ Google Maps already loaded.");
                resolve();
                return;
            }

            if (document.querySelector("script[src*='maps.googleapis.com']")) {
                console.warn("🚨 Google Maps script already exists in the document.");
                resolve();
                return;
            }

            console.log("📡 Injecting Google Maps API script...");
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&loading=async`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log("✅ Google Maps API script loaded.");
                resolve();
            };
            script.onerror = () => reject(new Error("❌ Google Maps script failed to load"));

            document.head.appendChild(script);
        });
    };

    useEffect(() => {
        if (!mapId) {
            console.error("❌ Google Maps Map ID is missing.");
            return;
        }

        /** ✅ First, ensure Google Maps is fully loaded */
        loadGoogleMapsScript()
            .then(async () => {
                while (!window.google || !window.google.maps) {
                    console.warn("⏳ Waiting for Google Maps to load...");
                    await new Promise(resolve => setTimeout(resolve, 500)); // Retry every 500ms
                }

                try {
                    console.log("📡 Importing Google Maps libraries...");
                    const { Map } = await window.google.maps.importLibrary("maps");
                    await window.google.maps.importLibrary("marker");

                    console.log("✅ Google Maps libraries loaded!");
                    setIsMapsLoaded(true);

                    if (mapRef.current && !mapInstanceRef.current) {
                        console.log("🔍 Initializing Google Map...");
                        mapInstanceRef.current = new Map(mapRef.current, {
                            center: userLocation || defaultCentre,
                            zoom: defaultZoom,
                            mapId,
                            streetViewControl: false,
                            zoomControl: true,
                        });

                        mapInstanceRef.current.setOptions({
                            padding: { top: 10, right: 40, bottom: 40, left: 10 },
                        });
                    }
                } catch (error) {
                    console.error("❌ Failed to load Google Maps:", error);
                }
            })
            .catch(error => console.error("❌ Google Maps script loading failed:", error));
    }, [userLocation, mapId]);

    return { mapRef, mapInstanceRef, isMapsLoaded };
};
