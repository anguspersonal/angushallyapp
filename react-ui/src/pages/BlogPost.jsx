import React, { useState, useEffect } from 'react';
import '../index.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Blogpost(props) {
    return (
        //Page to show a single blog post
        <div className='Page'>
            <Header />
            <h2>{props.post.title}</h2>
            <p>{props.post.content}</p>
            <Footer />
        </div>
    )};

export default Blogpost