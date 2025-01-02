import React, { useState, useEffect } from 'react';
import '../index.css';

function BlogSnippet(props) {
    return (
        //Page to show a single blog post
        <div className='grid-item'>
            <h3 className="truncate-two-lines" >{props.post.title}</h3>
            <p className="truncate-two-lines" >{props.post.content}</p>
        </div>
    )};

export default BlogSnippet