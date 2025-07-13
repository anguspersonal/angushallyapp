import React from 'react';

const CTAGuessAutomotive = () => {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Want to learn more about the hidden value of data?</h2>
            <a 
                href="https://www.anmut.co.uk/uncovering-the-hidden-value-of-data/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    marginTop: '10px'
                }}
            >
                Read More on Anmut.co.uk
            </a>
        </div>
    );
};

export default CTAGuessAutomotive; 