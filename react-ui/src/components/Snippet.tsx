import React from 'react';
import '../index.css';
import "../general.css";
import { Link } from 'react-router-dom';

interface SnippetProps {
  excerpt: string;
  id: string;
  slug: string;
  title: string;
  link?: string;
}

function Snippet(props: SnippetProps) {
    const { excerpt, id, slug, title, link = `/blog/${slug}` } = props; // Default link if not provided
    
    return (
        <Link key={id} to={link} className="blog-link" aria-label={`Read more about ${title}`}>
            <div className='grid-item'>
                <h3 className="truncate-two-lines">{title}</h3>
                <p className="truncate-two-lines">{excerpt}</p>
            </div>
        </Link>
    );
}


export default Snippet;