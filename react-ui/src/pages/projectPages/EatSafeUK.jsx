import React from 'react';
import '../../index.css';

function EatSafeUK() {
    return (
        <div className='Page'>
            <div className='centre_stage'>
                <h1>Eat Safe UK</h1>
                <iframe
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src="https://www.google.com/maps/embed/v1/search?q=London%2C%20UK&key=AIzaSyDdhQk6bRYyzo7I7jLr4Wcg7fvKaBKbOpg"
                ></iframe>
            </div>
        </div>
    );
}

export default EatSafeUK;