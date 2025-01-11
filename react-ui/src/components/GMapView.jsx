import React, { useEffect, useRef } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import '../index.css'; // Import the CSS file
import axios from 'axios';
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
});

const GMapView = ({ searchResults }) => {
    const mapRef = useRef(null);

    // Initialize the map and render markers for search results
    useEffect(() => {
        const initializeMap = async () => {
            try {
                const google = await loader.load();
                const map = new google.maps.Map(mapRef.current, {
                    center: { lat: 51.509865, lng: -0.118092 }, // Default center (London)
                    zoom: 10,
                });
    
                if (searchResults.length > 0) {
                    const bounds = new google.maps.LatLngBounds();
                    console.log(`Found ${searchResults.length} places`);
                    // Step 1: Render markers immediately
                    const markerMap = {}; // Store markers keyed by postal code
                    // We will need postcode for hygiene search, so search place details api
                    // only create markers for places with valid postcodes
                    const placeDetailsPromises = searchResults.map(async (place) => {
                        const placeDetails = await getPlaceDetails(place.place_id);
    
                        if (placeDetails) {
                            // Create a marker
                            const marker = new google.maps.Marker({
                                position: place.geometry.location,
                                map: map,
                                title: place.name,
                            });
    
                            bounds.extend(marker.getPosition());
    
                            // Create an initial InfoWindow without the hygiene score
                            const infoWindow = new google.maps.InfoWindow({
                                content: `
                                    <div>
                                        <h3>${place.name}</h3>
                                        <p>${place.formatted_address}</p>
                                        <p><strong>Hygiene Rating:</strong> Loading...</p>
                                    </div>
                                `,
                            });
    
                            marker.addListener("click", () => {
                                infoWindow.open(map, marker);
                            });
    
                            // Save the marker and InfoWindow to the map
                            markerMap[placeDetails.postalCode] = { marker, infoWindow };
                        }
                            //create place plus postcode to return
                            const placePlusPostcode = { ...place, postcode: placeDetails?.postalCode };

                        return placePlusPostcode; // Return the postal code for batch search
                    });
                    
                    const placesPlusPostcodes = (await Promise.all(placeDetailsPromises)).filter(pc => pc); // Collect valid postcodes
                    console.log("Places Plus Postcodes:");
                    console.log(placesPlusPostcodes);
                    map.fitBounds(bounds);
    
                    // Step 2: Perform batch hygiene score search
                    const hygieneScoresResponse = await axios.post('/api/hygieneScoreRoute', { places: placesPlusPostcodes });
                    const hygieneScoresMap = hygieneScoresResponse.data; // Map of { postcode: hygieneScore }
    
                    // Step 3: Update markers with hygiene scores
                    placesPlusPostcodes.forEach(postcode => {
                        const { marker, infoWindow } = markerMap[postcode] || {};
                        const hygieneScore = hygieneScoresMap[postcode] || 'N/A';
    
                        if (marker && infoWindow) {
                            // Update InfoWindow content with hygiene score
                            infoWindow.setContent(`
                                <div>
                                    <h3>${marker.getTitle()}</h3>
                                    <p>${marker.getPosition()}</p>
                                    <p><strong>Hygiene Rating:</strong> ${hygieneScore}/5</p>
                                </div>
                            `);
                        }
                    });
                }
            } catch (error) {
                console.error("Error initializing map:", error);
            }
        };
        initializeMap();
    }, [searchResults]);
    

    // Render the map
    return (<div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>);
};

const getPlaceDetails = async (placeId) => {
    try {
        const response = await fetch(`/api/google-places-details?place_id=${placeId}&key=${apiKey}`);
        const data = await response.json();
        if (response.ok) {
            // Get the name, full address, and post code from the response
            const postalCodeComponent = data.result.address_components.find(component => component.types.includes('postal_code'));
            const placeDetails = { placeName: data.result.name, address: data.result.formatted_address, postalCode: postalCodeComponent ? postalCodeComponent.long_name : 'N/A' };
            return placeDetails;
        } else {
            console.warn(`Post code not  for placeID${placeId}: ${data.error}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch details for placeID${placeId}:`, error);
        return null;
    }
};

// Use place details to do the fuzzy search on the database
const fuzzySearchResult = async (place, placeDetails) => {
    try {
        const response = await axios.post('/api/hygieneScoreLookup', {
            place: {
                name: place.name,
                addressline1: place.formatted_address,
                postcode: placeDetails.postalCode
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to perform fuzzy search for ${place.placeId}:`, error);
        return null;
    }
};

export default GMapView;
