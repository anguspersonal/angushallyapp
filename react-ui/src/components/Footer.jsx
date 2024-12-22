import React from 'react';
import '../index.css';

function Footer() {
    return (
        <div>
        { process.env.NODE_ENV === 'production' ?
            <p>
              This is a production build of angushally app, built from create-react-app.
            </p>
          : <p>
              This is the local enviroment, Edit <code>src/App.js</code> and save to reload.
            </p>
        }
        </div>
    );
}

export default Footer;