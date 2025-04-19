import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import "../general.css";

function ProjectSnippet({ project }) {
    const { name, desc, route } = project;
    return (
        <Link to={route}>
        <div className='grid-item'>
            <h3 className="truncate-two-lines" >{name}</h3>
            <p className="truncate-two-lines" >{desc}</p>
        </div>
        </Link>
    )};

export default ProjectSnippet