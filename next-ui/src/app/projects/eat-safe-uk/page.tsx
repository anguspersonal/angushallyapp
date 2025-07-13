'use client';

import React, { useState } from "react";
import SearchBar from "./components/GMapsSearchBar";
import MapView from "./components/GMapView";
import NearbySearchButton from "./components/NearbySearchButton";
import "./EatSafeUK.css";

interface SearchResult {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  addressComponents?: Array<{
    types: string[];
    shortText: string;
  }>;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface Marker {
  id: string;
  key: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  addressComponents?: Array<{
    types: string[];
    shortText: string;
  }>;
  rating: string | null;
}

export default function EatSafeUK() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);

  return (
    <div className="eatsafeuk">
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
            setIsSearching={setIsSearching}
            selectedMarker={selectedMarker}
            setSelectedMarker={setSelectedMarker}
          />
        </div>
      </div>
    </div>
  );
} 