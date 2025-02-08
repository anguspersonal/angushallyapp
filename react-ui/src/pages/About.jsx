import React from 'react';
import '../index.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function About() {
    return (
        <div className='Page'>
            <Header />
            <div className='full_stage'>
                <div className='centre_stage'>
            <h1>About me</h1>
            <div className='photoWrapper'><img src="../angusprofile.jpg" alt="Angus Hally" id='profilePhoto' /></div>
            <p>Hi, I'm Angus Hally. I'm a strategy manager and
                amateur developer. I've worked in the technology
                industry for over a decade, and I'm passionate
                about the intersection of technology, business,
                and society. I'm currently working on a number
                of projects, including a blog and a portfolio
                of my work. I'm excited to share my thoughts and
                work with you. Thanks for visiting my website!</p>
                </div>
                </div>
        </div>
    );
}

export default About;