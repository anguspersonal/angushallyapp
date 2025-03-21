import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Burger, HoverCard } from '@mantine/core';
import { useMediaQuery, useHover } from '@mantine/hooks';
import '../index.css';
import "../general.css";

function Header() {
    const [opened, setOpened] = useState(false); // State to control the Burger menu
    const isPhoneSize = useMediaQuery('(max-width: 768px)'); // Media query for phone size
    const { isHovered, ref } = useHover(); // Hover state for the HoverCard.Target

    return (
        <div className='Header'>
            <Link to="/">
                <img src="/AH-logo-no-background.ico" id="headerlogo" alt='AH Logo'></img>
            </Link>

            {isPhoneSize ? (
                <>
                    {/* Burger menu with HoverCard for small screens */}
                    <HoverCard
                        width={200}
                        shadow="md"
                        position="bottom-start"
                        opened={isHovered || opened} // Open on hover or click
                        onOpen={() => setOpened(true)}
                        onClose={() => setOpened(false)}
                    >
                        <HoverCard.Target>
                            <div ref={ref}>
                                <Burger
                                    opened={opened}
                                    onClick={() => setOpened((o) => !o)} // Toggle on click
                                    aria-label={opened ? 'Close navigation' : 'Open navigation'}
                                />
                            </div>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <nav className='column'>
                                <Link to="/about" onClick={() => setOpened(false)}>About</Link>
                                <Link to="/blog" onClick={() => setOpened(false)}>Blog</Link>
                                <Link to="/contact" onClick={() => setOpened(false)}>Contact</Link>
                                <Link to="/projects" onClick={() => setOpened(false)}>Projects</Link>
                            </nav>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </>
            ) : (
                // Regular navigation for larger screens
                <nav>
                    <Link to="/about">About</Link>
                    <Link to="/blog">Blog</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/projects">Projects</Link>
                </nav>
            )}
        </div>
    );
}

export default Header;