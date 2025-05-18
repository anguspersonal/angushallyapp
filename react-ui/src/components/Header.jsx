import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Box, Button } from '@mantine/core';
import {
  IconUser,
  IconArticle,
  IconRocket,
  IconMenu2,
  IconFolder,
  IconLogout,
} from '@tabler/icons-react';
import { useMediaQuery, useMounted } from '@mantine/hooks';
import '../general.css';
import { useAuth } from '../contexts/AuthContext.jsx';

function Header() {
  const isPhoneSize = useMediaQuery('(max-width: 768px)');
  const mounted = useMounted();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderAuthButton = () => {
    if (user) {
      return (
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconLogout size={18} />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      );
    }
    return (
      <Button
        variant="subtle"
        color="gray"
        component={Link}
        to="/login"
      >
        Login
      </Button>
    );
  };

  return (
    <Box
      className="Header"
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1em',
        minHeight: '80px',
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        [`@media (max-width: ${theme.breakpoints.sm})`]: {
          padding: '0.5em',
          minHeight: '60px'
        }
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Link to="/">
          <img 
            src="/AH-logo-no-background.ico" 
            alt="AH Logo" 
            style={{
              height: 'clamp(40px, 5vw, 60px)',
              width: 'auto',
              transition: 'height 0.3s ease'
            }}
          />
        </Link>
      </Box>

      {!mounted ? null : isPhoneSize ? (
        <Menu
          width={220}
          shadow="md"
          position="bottom-start"
          withArrow
          transition="pop"
          withinPortal
          trigger="click"
          style={{ marginLeft: 'auto' }}
        >
          <Menu.Target>
            <div style={{ cursor: 'pointer' }}>
              <IconMenu2 size={24} />
            </div>
          </Menu.Target>

          <Menu.Dropdown tabIndex={0}>
            <Menu.Item
              leftSection={<IconFolder size={18} />}
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
              leftSection={<IconRocket size={18} />}
              component={Link}
              to="/collab"
            >
              Collab
            </Menu.Item>

            {user ? (
              <Menu.Item
                leftSection={<IconLogout size={18} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            ) : (
              <Menu.Item
                leftSection={<IconUser size={18} />}
                component={Link}
                to="/login"
              >
                Login
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      ) : (
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/projects">Projects</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/about">About</Link>
          <Link to="/collab">Collab</Link>
          {renderAuthButton()}
        </nav>
      )}
    </Box>
  );
}

export default Header;
