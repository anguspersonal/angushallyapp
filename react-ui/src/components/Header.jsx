import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Button, Container, Group, Burger } from '@mantine/core';
import {
  IconUser,
  IconArticle,
  IconRocket,
  IconFolder,
  IconLogout,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import '../general.css';
import { useAuth } from '../contexts/AuthContext.jsx';

const links = [
  { link: '/projects', label: 'Projects', icon: IconFolder },
  { link: '/blog', label: 'Blog', icon: IconArticle },
  { link: '/about', label: 'About', icon: IconUser },
  { link: '/collab', label: 'Collab', icon: IconRocket },
];

function Header() {
  const [opened, { toggle }] = useDisclosure(false);
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

  const items = links.map((link) => {
    const Icon = link.icon;
    
    return (
      <Link
        key={link.label}
        to={link.link}
        style={{
          textDecoration: 'none',
          color: 'var(--text-color)',
          fontWeight: 500,
          fontSize: '1.1em',
          transition: 'color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => {
          e.target.style.color = 'var(--primary-color)';
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = 'var(--text-color)';
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Icon size={18} />
        {link.label}
      </Link>
    );
  });

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'var(--background-color)',
        borderBottom: '1px solid rgba(233, 236, 239, 0.5)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        minHeight: '80px',
      }}
    >
      <Container size="xl">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 0',
            height: '80px',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
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

          {/* Desktop Navigation */}
          <Group gap={5} visibleFrom="sm">
            {items}
            {renderAuthButton()}
          </Group>

          {/* Mobile Burger Menu */}
          <Menu
            width={220}
            shadow="md"
            position="bottom-end"
            withArrow
            transition="pop"
            withinPortal
            opened={opened}
            onClose={() => toggle()}
          >
            <Menu.Target>
              <Burger 
                opened={opened} 
                onClick={toggle} 
                size="sm" 
                hiddenFrom="sm"
                style={{ cursor: 'pointer' }}
              />
            </Menu.Target>

            <Menu.Dropdown>
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Menu.Item
                    key={link.label}
                    leftSection={<Icon size={18} />}
                    component={Link}
                    to={link.link}
                    onClick={() => toggle()}
                  >
                    {link.label}
                  </Menu.Item>
                );
              })}
              
              <Menu.Divider />
              
              {user ? (
                <Menu.Item
                  leftSection={<IconLogout size={18} />}
                  onClick={() => {
                    handleLogout();
                    toggle();
                  }}
                >
                  Logout
                </Menu.Item>
              ) : (
                <Menu.Item
                  leftSection={<IconUser size={18} />}
                  component={Link}
                  to="/login"
                  onClick={() => toggle()}
                >
                  Login
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </div>
      </Container>
    </header>
  );
}

export default Header;
