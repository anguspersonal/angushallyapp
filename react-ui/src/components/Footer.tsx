import React from 'react';
import '../index.css';
import "../general.css";

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear();
  const buildInfo: string = process.env.REACT_APP_BUILD_NUMBER || 'dev';
  
  return (
    <div className='Footer'>
      {process.env.NODE_ENV === 'production' ? (
        <p>
          Build: {buildInfo}
        </p>
      ) : (
        <p>
          This is the local environment, Edit <code>src/App.js</code> and save to reload.
        </p>
      )}
      <p>© {currentYear} Angus Hally. All rights reserved.</p>
    </div>
  );
};

export default Footer;