import React, { useState, useEffect } from "react";
import "../../../index.css";
import SearchBar from "./GMapsSearchBar";
import MapView from "./GMapView";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import "./EatSafeUK.css";
import NearbySearchButton from "./NearbySearchButton";

function EatSafeUK() {
    const [searchResults, setSearchResults] = useState([]);
    const [userSearched, setUserSearched] = useState(false); // Track if user performed a search
    const [userLocation, setUserLocation] = useState(null);
    const [userLocationPermission, setUserLocationPermission] = useState(false);
    const [isSearching, setIsSearching ] = useState(false);


    return (
        <div className="eatsafeuk">
            <Header />
            <div className="full_stage">
                <div className="centre_stage">
                    <p>Hello! This is my "EatSafeUK" project. Apologies, it's currently limited to England. You can use it to serach the hygiene score of restaurants, cafes, or establishment of any kind. It uses Google Maps API to locate places, and then matches them with estblishments on the Food Standard Agency Database.</p>
                    <div className="search-bar">
                        <NearbySearchButton
                            setSearchResults={setSearchResults}
                            setUserLocation={setUserLocation}
                            setUserLocationPermission={setUserLocationPermission}
                            setUserSearched={setUserSearched}
                            isSearching={isSearching}
                        />
                        <p>or</p>
                        <SearchBar setSearchResults={setSearchResults} setUserSearched={setUserSearched} isSearching={isSearching}/>
                    </div>
                    <MapView searchResults={searchResults} userLocation={userLocation} setIsSearching={setIsSearching}/>
                </div>
            </div>
            <Footer />
        </div>
    );
}


export default EatSafeUK;
