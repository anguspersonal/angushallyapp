import React, { useState, useEffect } from "react";
import "../../../index.css";
import SearchBar from "./GMapsSearchBar";
import MapView from "./GMapView";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { performNearbySearch } from "./nearbySearch";
import "./EatSafeUK.css";

function EatSafeUK() {
    const [searchResults, setSearchResults] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [userSearched, setUserSearched] = useState(false); // NEW: Track if user performed a search

    // Ask for user location on page load
    useEffect(() => {
        askForLocationPermission(setUserLocation);
    }, []);

    // Automatically fetch nearby restaurants only if user has not searched
    useEffect(() => {
        if (userLocation && !userSearched) {
            console.log("🔍 Fetching nearby places...");
            performNearbySearch(userLocation, setSearchResults, 2000 );
        }
    }, [userLocation, userSearched]);

    return (
        <div className="eatsafeuk">
            <Header />
            <div className="full_stage">
                <div className="centre_stage">
                    <p>Hello! This is my "EatSafeUK" project. Apologies, it's currently limited to England. You can use it to serach the hygiene score of restaurants, cafes, or establishment of any kind. It uses Google Maps API to locate places, and then matches them with estblishments on the Food Standard Agency Database.</p>
                    <SearchBar 
                        onSearchResults={(results) => {
                            setSearchResults(results);
                            setUserSearched(true); // NEW: Mark that user has searched
                        }}
                        userLocation={userLocation} 
                    />
                    <MapView searchResults={searchResults} userLocation={userLocation} />
                </div>
            </div>
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
