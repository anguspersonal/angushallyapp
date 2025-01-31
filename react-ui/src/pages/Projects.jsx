import React from 'react';
import '../index.css';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import getProjectList from './projectPages/projectList';
import ProjectSnippet from './projectPages/ProjectSnippet';

function Projects() {
  const projects = getProjectList();
  console.log('Projects.js: projects:', projects);

  return (
    <div className='Page'>
      <Header />
    <div className="main-content">
      <div className='centre_stage'>
        <h1>My Projects</h1>
        <div className="grid-container">
         {projects.map((project,index) => (
            <ProjectSnippet key={index} project={project}/>
          ))} 
        </div>
      </div>
    </div>
    <Footer />
    </div>
      );
}

export default Projects;