# Google Maps and Places API Integration

## Overview

This project demonstrates how to integrate the Google Maps JavaScript API and the Google Places API in a React application. It highlights the differences between using the Google Maps JavaScript API directly in the browser and making HTTP requests to the Google Places API, and provides a solution to avoid CORS issues when making HTTP requests.

## Google Maps JavaScript API

The Google Maps JavaScript API is designed to be used directly in the browser. When you load the Google Maps JavaScript API using a script tag or the `Loader` class, it includes all the necessary libraries and handles CORS internally. This allows you to create maps, markers, and use services like `PlacesService` directly in your client-side code without running into CORS issues.

### Example Usage

```jsx
import React, { useEffect, useRef } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import '../index.css'; // Import the CSS file

const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
});

const GMapView = ({ searchResults }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        const initializeMap = async () => {
            const google = await loader.load();
            const map = new google.maps.Map(mapRef.current, {
                center: { lat: 51.5074, lng: -0.1278 }, // Default center (London)
                zoom: 10,
            });

            if (searchResults.length > 0) {
                const bounds = new google.maps.LatLngBounds();

                searchResults.forEach(place => {
                    const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        title: place.name,
                    });

                    bounds.extend(marker.getPosition());

                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div>
                                <h3>${place.name}</h3>
                                <p>${place.formatted_address}</p>
                            </div>
                        `,
                    });

                    marker.addListener("click", () => {
                        infoWindow.open(map, marker);
                    });
                });

                map.fitBounds(bounds);
            }
        };

        initializeMap();
    }, [searchResults]);

    return <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>;
};

export default GMapView;

```
Google Places API (HTTP Requests)
The Google Places API, when accessed via HTTP requests (e.g., using fetch or axios), is subject to CORS restrictions. This means that if you try to make a request directly from the browser to the Google Places API endpoint, the browser will block the request if the response does not include the appropriate CORS headers.

Example Issue

```jsx
const getPostCodes = async (placeId) => {
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`);
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            console.warn(`Post code not found: ${data.error}`);
            return null;
        }
    } catch (error) {
        console.error("Failed to fetch post code:", error);
        return null;
    }
}

```
Solution: Using a Server-Side Proxy
To avoid CORS issues, you can use a server-side proxy to make the API requests. This way, the client-side code makes requests to your server, and your server makes the requests to the Google Places API. This approach avoids CORS issues because the requests to the Google Places API are made from the server-side.

Setting Up a Proxy Endpoint
Create a Proxy Route on the Server

```jsx
// filepath: /home/ahally/angushallyapp/server/routes/googlePlacesProxy.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/api/google-places-details', async (req, res) => {
    const { place_id } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching place details:', error);
        res.status(500).json({ error: 'Failed to fetch place details' });
    }
});

module.exports = router;


// filepath: /home/ahally/angushallyapp/react-ui/src/components/GMapView.jsx
import React, { useEffect, useRef } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import '../index.css'; // Import the CSS file
const axios = require('axios');

const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
});

const GMapView = ({ searchResults }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        const initializeMap = async () => {
            const google = await loader.load();
            const map = new google.maps.Map(mapRef.current, {
                center: { lat: 51.5074, lng: -0.1278 }, // Default center (London)
                zoom: 10,
            });

            if (searchResults.length > 0) {
                const bounds = new google.maps.LatLngBounds();

                searchResults.forEach(async (place) => {
                    const hygieneScore = await fetchHygieneScore(place.name, place.formatted_address);

                    const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        title: place.name,
                    });

                    bounds.extend(marker.getPosition());

                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div>
                                <h3>${place.name}</h3>
                                <p>${place.formatted_address}</p>
                                <p><strong>Hygiene Rating:</strong> ${hygieneScore?.RatingValue || 'N/A'}</p>
                            </div>
                        `,
                    });

                    marker.addListener("click", () => {
                        infoWindow.open(map, marker);
                    });

                    // Get post code from placesDetailAPI
                    const postCode = await getPostCodes(place.place_id);
                    console.log(`Post Code for ${place.name}: ${postCode}`);
                });

                map.fitBounds(bounds);

                const listener = google.maps.event.addListener(map, "idle", () => {
                    if (map.getZoom() > 13) map.setZoom(13);
                    google.maps.event.removeListener(listener);
                });
            }
        };

        initializeMap();
    }, [searchResults]);

    return <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>;
};

export default GMapView;



// filepath: /home/ahally/angushallyapp/server/index.js
const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Load environment variables
const db = require('./db'); // Import the database module

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

console.log('TEST_VAR:', process.env.TEST_VAR);

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const app = express();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

  // Import and use the hygiene score route
  const hygieneScoreRoute = require('./routes/hygieneScore');
  app.use(hygieneScoreRoute);

  // Import and use the Google Places proxy route
  const googlePlacesProxyRoute = require('./routes/googlePlacesProxy');
  app.use(googlePlacesProxyRoute);

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Node ${isDev ? 'dev server' : 'cluster worker ' + process.pid}: listening on port ${PORT}`);
  });
}

