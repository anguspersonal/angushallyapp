import React from 'react';
import { Link } from 'react-router-dom';


function Header() {
    return (
        <div className='Header'>
            <Link to="/"><h1>Angus Hally</h1></Link>

            <nav>
                <Link to="/about">About</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/contact">Contact</Link>
            </nav>


        </div>
    );
}

export default Header;