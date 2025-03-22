import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@mantine/core';
import {
  IconUser,
  IconArticle,
  IconMail,
  IconRocket,
  IconMenu2,
} from '@tabler/icons-react';
import { useMediaQuery, useMounted } from '@mantine/hooks';
import '../index.css';
import '../general.css';

function Header() {
  const isPhoneSize = useMediaQuery('(max-width: 768px)');
  const mounted = useMounted();

  return (
    <div className="Header">
      <Link to="/">
        <img src="/AH-logo-no-background.ico" id="headerlogo" alt="AH Logo" />
      </Link>

      {!mounted ? null : isPhoneSize ? (
        <Menu
          width={220}
          shadow="md"
          position="bottom-start"
          withArrow
          transition="pop"
          withinPortal
          trigger="click"
          style={{ marginRight: '2em' }}
        >
          <Menu.Target>
            <div style={{ cursor: 'pointer' }}>
              <IconMenu2 size={24} />
            </div>
          </Menu.Target>

          <Menu.Dropdown tabIndex={0}>
            <Menu.Item
              leftSection={<IconRocket size={18} />}
              component={Link}
              to="/projects"
            >
              Projects
            </Menu.Item>
            
            <Menu.Item
              leftSection={<IconArticle size={18} />}
              component={Link}
              to="/blog"
            >
              Blog
            </Menu.Item>

            <Menu.Item
              leftSection={<IconUser size={18} />}
              component={Link}
              to="/about"
            >
              About
            </Menu.Item>

            <Menu.Item
              leftSection={<IconMail size={18} />}
              component={Link}
              to="/contact"
            >
              Contact
            </Menu.Item>

          </Menu.Dropdown>
        </Menu>
      ) : (
        <nav>
          <Link to="/projects">Projects</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>

        </nav>
      )}
    </div>
  );
}

export default Header;
