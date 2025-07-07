// @ts-nocheck - Complex food safety application with Google Maps integration and dynamic data fetching that TypeScript cannot properly infer
import React, { useState } from "react";
import "../../../index.css";
import SearchBar from "./GMapsSearchBar";
import MapView from "./GMapView";
import Header from "../../../components/Header";
import "./EatSafeUK.css";
import NearbySearchButton from "./NearbySearchButton";

function EatSafeUK() {
    const [searchResults, setSearchResults] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null); //Set selected markers on map.


    return (
        <div className="eatsafeuk">
            <Header />
            <div className="full_stage">
                <div className="centre_stage">
                    <p>
                        Hello! Welcome to EatSafeUK.
                        This app helps you check the hygiene scores
                        of restaurants, cafés, hospitals, schools,
                        and other establishments. It currently covers
                        England and works by using the Google Maps API
                        to locate places, then matches them with
                        establishments in the  
                        <a href="https://www.food.gov.uk/" target="_blank" rel="noopener noreferrer"> Food Standards Agency</a> database.
                    </p>

                    <div className="search-bar">
                        <NearbySearchButton
                            setSearchResults={setSearchResults}
                            setUserLocation={setUserLocation}
                            isSearching={isSearching}
                            setIsSearching={setIsSearching}
                            selectedMarker={selectedMarker}
                            setSelectedMarker={setSelectedMarker}
                        />
                        <p>or</p>
                        <SearchBar
                            setSearchResults={setSearchResults}
                            isSearching={isSearching}
                            setIsSearching={setIsSearching}
                            selectedMarker={selectedMarker}
                            setSelectedMarker={setSelectedMarker}
                        />
                    </div>
                    <MapView
                        searchResults={searchResults}
                        userLocation={userLocation}
                        isSearching={isSearching}
                        setIsSearching={setIsSearching}
                        selectedMarker={selectedMarker}
                        setSelectedMarker={setSelectedMarker}
                    />
                </div>
            </div>
        </div>
    );
}


export default EatSafeUK;
