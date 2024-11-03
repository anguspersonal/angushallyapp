import React from 'react';

const Home = () => {
  return (
    <div className='centre_stage'>
      <div className='centre_stage'>
        <div className='photoWrapper'><img src="../angusprofile.jpg" alt="Angus Hally" id='profilePhoto'/></div>
        <h1>Welcome to Angus Hally's Website</h1>
        <p>This platform showcases my professional work and thoughts as a strategy manager and amateur developer.</p>
        <div className='row'>
          <a href='/about' className='button'>About Me</a>
          <a href='/projects'className='button'>Projects</a>
          <a href='/blog'className='button'>Blog</a>
      </div>
      </div>
    </div>
  );
};

export default Home;
