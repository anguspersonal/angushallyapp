import React,  { useState }from 'react';
import '../../../index.css'; // Import the CSS file from
import SearchBar from "./GMapsSearchBar";
import MapView from "./GMapView";
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';


function EatSafeUK() {
    const [searchResults, setSearchResults] = useState([]);


    return (
        <div className='Page'>
            <Header />
            <SearchBar onSearchResults={setSearchResults} />
            <MapView searchResults={searchResults} />
            <Footer />
        </div>
    );
}

export default EatSafeUK;