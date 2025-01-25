import React, { useEffect, useRef } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
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
        initializeMap();
    }, [searchResults]);

    // Render the map
    return (
    <div className='page'>
        <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
        </div>);
};
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
                        place_id: place.place_id,
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
                    markerMap[place.place_id] = { marker, infoWindow };
                    console.log(`Marker and InfoWindow created for placeID ${placeDetails.place_id}`);
                }
                    //create place plus postcode to return
                    const placePlusPostcode = { ...place, postcode: placeDetails?.postcode };

                return placePlusPostcode; // Return the postal code for batch search
            });
            
            const placesPlusPostcodes = (await Promise.all(placeDetailsPromises)).filter(pc => pc); // Collect valid postcodes
            console.log("Places Plus Postcodes:");
            console.log(placesPlusPostcodes);
            map.fitBounds(bounds);

            // Step 2: Perform batch hygiene score search
            try {
                const hygieneScoresResponse = await axios.post('/api/hygieneScoreRoute', { places: placesPlusPostcodes });
                if (!hygieneScoresResponse.data) {
                    console.warn("No hygiene scores found");
                    return;
                }
                // console.log("Hygiene Scores Response:", hygieneScoresResponse.data);
                const hygieneScoresMap = hygieneScoresResponse.data; // Map of { postcode: hygieneScore }
                // console.log("Hygiene Scores Map:", hygieneScoresMap); 
                console.log(`${placesPlusPostcodes.length} places found`);

                // Step 3: Update markers with hygiene scores
                placesPlusPostcodes.forEach(place => {
                    // console.log("Place:", place);
                    const { marker, infoWindow } = markerMap[place.place_id] || {};
                    if (!marker || !infoWindow) {
                        console.warn(`Marker or InfoWindow not found for placeID ${place.place_id}`);
                    }
                    // console log the place id you are looking for and the array of scores place ids to see if they match
                    // console.log("Place ID:", place.place_id, "Scores:", hygieneScoresMap.map(score => score.place_id));
                    const hygieneScore = hygieneScoresMap.find(score => score.place_id === place.place_id)?.rating_value_num || 'N/A';
                    // console.log("Hygiene Score:", hygieneScore);
                    if (marker && infoWindow) {
                        // Update InfoWindow content with hygiene score
                        infoWindow.setContent(`
                            <div>
                                <h3>${marker.getTitle()}</h3>
                                <p>${place.formatted_address}</p>
                                <p><strong>Hygiene Rating:</strong> ${(hygieneScore !== 'N/A') ? `${hygieneScore}/5` : 'N/A'}</p>
                            </div>
                        `);
                    } else {
                        console.warn(`Marker or InfoWindow not found for placeID ${place.place_id}`);
                    }
                });
            } catch (error) {
                console.error("Error fetching hygiene scores:", error);
            }
        }
    } catch (error) {
        console.error("Error initializing map:", error);
    }
};


const getPlaceDetails = async (placeId) => {
    try {
        const response = await fetch(`/api/google-places-details?place_id=${placeId}&key=${apiKey}`);
        const data = await response.json();
        if (response.ok) {
            // Get the name, full address, and post code from the response
            const postalCodeComponent = data.result.address_components.find(component => component.types.includes('postal_code'));
            const placeDetails = { placeName: data.result.name, address: data.result.formatted_address, postcode: postalCodeComponent ? postalCodeComponent.long_name : 'N/A' };
            return placeDetails;
        } else {
            console.warn(`Post code not found for placeID ${placeId}: ${data.error}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch details for placeID ${placeId}:`, error);
        return null;
    }
};

export default GMapView;
