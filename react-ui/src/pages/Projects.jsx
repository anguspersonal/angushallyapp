import React from 'react';
import '../index.css';
import { Link } from 'react-router-dom';

function Projects() {
  return (
    <div className="main-content">
      <div className='centre_stage'>
        <h1>My Projects</h1>
        <div className="grid-container">
          <ul><li><Link to="/projects/EatSafeUK">Eat Safe UK</Link></li></ul>
        </div>
      </div>
    </div>
      );
}

export default Projects;