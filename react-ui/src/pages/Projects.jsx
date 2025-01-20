import React from 'react';
import '../index.css';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Projects() {
  return (
    <div className='Page'>
      <Header />
    <div className="main-content">
      <div className='centre_stage'>
        <h1>My Projects</h1>
        <div className="grid-container">
          <ul><li><Link to="/projects/EatSafeUK">Eat Safe UK</Link></li></ul>
          <ul><li><Link to="/projects/DataValueGame">Data Value Game</Link></li></ul>
        </div>
      </div>
    </div>
    <Footer />
    </div>
      );
}

export default Projects;