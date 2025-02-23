import React from 'react';
import '../index.css';
import Header from '../components/Header';
import getProjectList from './projectPages/projectList';
import ProjectSnippet from './projectPages/ProjectSnippet';

function Projects() {
  const projects = getProjectList();
  // console.log('Projects.js: projects:', projects);

  return (
    <div className='Page'>
      <Header />
    <div className="main-content">
      <div className='full_stage'>
        <h1>My Projects</h1>
        <div className="grid-container">
         {projects.map((project,index) => (
            <ProjectSnippet key={index} project={project}/>
          ))}
        </div>
      </div>
    </div>
    </div>
      );
}

export default Projects;