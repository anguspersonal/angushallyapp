import React from 'react';
import '../index.css';
import { Link } from 'react-router-dom';

function Snippet(props) {
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