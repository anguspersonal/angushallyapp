import React, { useState, useEffect } from "react";
import "../../../index.css";
import SearchBar from "./GMapsSearchBar";
import MapView from "./GMapView";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useJsApiLoader } from "@react-google-maps/api";
import { performNearbySearch } from "./nearbySearch";

// Default libraries to load with the Google Maps API
const libraries = ["places"];

function EatSafeUK() {
    const [searchResults, setSearchResults] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

    // Use the useJsApiLoader hook to load the Google Maps API
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        version: "3.58", // Specify the desired API version
        libraries, // Load the Places library
    });

    // Ask for user location on page load
    useEffect(() => {
        askForLocationPermission(setUserLocation);
    }, []);

    // Automatically fetch nearby restaurants once location and API are available
    useEffect(() => {
        if (userLocation && isLoaded) {
            performNearbySearch(window.google, userLocation, setSearchResults);
        }
    }, [userLocation, isLoaded]);

    if (loadError) {
        return <div>Error loading Google Maps API: {loadError.message}</div>;
    }

    if (!isLoaded) {
        return <div>Loading Google Maps...</div>;
    }

    return (
        <div className="Page">
            <Header />
            <SearchBar
                onSearchResults={setSearchResults}
                google={window.google} // Pass the Google API object
                userLocation={userLocation}
            />
            <MapView
                searchResults={searchResults}
                userLocation={userLocation}
                google={window.google} // Pass the Google API object
            />
            <Footer />
        </div>
    );
}

function askForLocationPermission(setUserLocation) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Location access denied:", error);
                setUserLocation(null);
            }
        );
    } else {
        console.error("Geolocation not supported");
        setUserLocation(null);
    }
}

export default EatSafeUK;
