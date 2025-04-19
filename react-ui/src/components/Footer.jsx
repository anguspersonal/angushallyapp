import React from 'react';
import '../index.css';
import "../general.css";

function Footer() {
  const currentYear = new Date().getFullYear();
    return (
        <div className ='Footer'>
        { process.env.NODE_ENV === 'production' ?
            <p>
              {/* This is a production build of angushally app, built from create-react-app. */}
            </p>
          : <p>
              This is the local environment, Edit <code>src/App.js</code> and save to reload.
            </p>
        }
          <p>© {currentYear} Angus Hally. All rights reserved.</p>
        </div>
    );
}

export default Footer;