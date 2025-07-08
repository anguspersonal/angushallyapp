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
import { useAuth } from '../contexts/AuthContext';

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

  const items = links.map((link) => (
    <Button
      key={link.label}
      component={Link}
      to={link.link}
      variant="subtle"
      color="gray"
      leftSection={<link.icon size={18} />}
    >
      {link.label}
    </Button>
  ));

  return (
    <Container size="xl" h="100%">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
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
  );
}

export default Header; 