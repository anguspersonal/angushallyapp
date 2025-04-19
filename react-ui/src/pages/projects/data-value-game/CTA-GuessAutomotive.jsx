import React from 'react';

const CTAGuessAutomotive = () => {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>If you enjoyed this, why not try and guess the value of data within the automotive industry (FTSE350).</h2>
            <p>Scan the QR code to play on your device!</p>
            {/* QR Code Image */}
            <img className="qr-code-img" src="/QR_code.png" alt="QR Code" />
        </div>
    );
};

export default CTAGuessAutomotive;