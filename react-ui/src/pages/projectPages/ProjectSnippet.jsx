import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../index.css';

function ProjectSnippet(props) {
    return (
        <Link to={props.project.pRoute}>
        <div className='grid-item'>
            <h3 className="truncate-two-lines" >{props.project.pName}</h3>
            <p className="truncate-two-lines" >{props.project.pDesc}</p>
        </div>
        </Link>
    )};

export default ProjectSnippet