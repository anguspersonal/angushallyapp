import React,  { useState }from 'react';
import '../../index.css';
import SearchBar from "../../components/GMapsSearchBar";
import MapView from "../../components/GMapView";


function EatSafeUK() {
    const [searchResults, setSearchResults] = useState([]);


    return (
        <div className='Page'>
            <SearchBar onSearchResults={setSearchResults} />
            <MapView searchResults={searchResults} />
        </div>
    );
}

export default EatSafeUK;