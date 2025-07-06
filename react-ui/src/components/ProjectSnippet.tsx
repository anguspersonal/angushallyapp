import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import "../general.css";

interface Project {
  name: string;
  desc: string;
  route: string;
  tags?: string[];
}

interface ProjectSnippetProps {
  project: Project;
}

function ProjectSnippet({ project }: ProjectSnippetProps) {
    const { name, desc, route, tags = [] } = project;
    return (
        <Link to={route}>
        <div className='grid-item'>
            <h3 className="truncate-two-lines" >{name}</h3>
            <p className="truncate-two-lines" >{desc}</p>
            <div className="tag-container">
                {tags.map((tag) => (
                    <span key={tag} className={`tag tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}>{tag}</span>
                ))}
            </div>
        </div>
        </Link>
    )};

export default ProjectSnippet