import React from 'react';
import '../index.css';

function Home() {
  return (
    <div className='Page'>
      <div className='centre_stage'>
        <div className='photoWrapper'><img src="../angusprofile.jpg" alt="Angus Hally" id='profilePhoto' /></div>
        <h1>Welcome to Angus Hally's Website</h1>
        <p>This platform showcases my professional work and thoughts as a strategy manager and amateur developer.</p>
      </div>
    </div>
      );
}

export default Home;
