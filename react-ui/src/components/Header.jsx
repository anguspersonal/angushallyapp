import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <div className='Header'>
            <Link to="/">
                <img src="/AH-logo-no-background.ico" id="headerlogo" alt='AH Logo'></img>
            </Link>

            <nav className='row row-right'>
                <Link to="/about">About</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/projects">Projects</Link>
            </nav>
        </div>
    );
}

export default Header;