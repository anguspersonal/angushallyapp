import React from "react";

const Header = () => {
    return (
        <div className='header'>
        <a id='headerLogo' href='/'>Angus💡Hally</a>
        <div className='row nav-buttons'>
                <a href='/about' className='nav-link' data-emoji='👤'>About Me</a>
                <a href='/projects' className='nav-link' data-emoji='💼'>Projects</a>
                <a href='/blog' className='nav-link' data-emoji='📝'>Blog</a>
        </div>
        </div>
    );
}

export default Header;