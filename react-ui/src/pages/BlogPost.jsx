import React, { useState, useEffect } from 'react';
import '../index.css';

function Blogpost(props) {
    return (
        //Page to show a single blog post
        <div className='Page'>
            <h2>{props.post.title}</h2>
            <p>{props.post.content}</p>
        </div>
    )};

export default Blogpost