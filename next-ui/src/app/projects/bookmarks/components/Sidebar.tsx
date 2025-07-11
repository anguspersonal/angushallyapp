'use client';

import React, { useState } from 'react';
import { 
  NavLink, 
  Box, 
  Stack,
  ThemeIcon,
  ActionIcon,
  Transition
} from '@mantine/core';
import { 
  IconHome, 
  IconBookmark, 
  IconSearch, 
  IconTag, 
  IconTrendingUp, 
  IconChartBar, 
  IconSettings,
  IconArchive,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';

type NavigationItemId = 'dashboard' | 'bookmarks' | 'search' | 'sync' | 'tags' | 'trending' | 'analytics' | 'archive' | 'settings';

interface NavigationItem {
  id: NavigationItemId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface SidebarProps {
  activeView: NavigationItemId;
  onViewChange: (view: NavigationItemId) => void;
  onSidebarToggle: (collapsed: boolean) => void;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: IconHome },
  { id: 'bookmarks', label: 'All Bookmarks', icon: IconBookmark },
  { id: 'search', label: 'Search', icon: IconSearch },
  { id: 'sync', label: 'Sync & Import', icon: IconRefresh },
  { id: 'tags', label: 'Tags', icon: IconTag },
  { id: 'trending', label: 'Trending', icon: IconTrendingUp },
  { id: 'analytics', label: 'Analytics', icon: IconChartBar },
  { id: 'archive', label: 'Archive', icon: IconArchive },
  { id: 'settings', label: 'Settings', icon: IconSettings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onSidebarToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  
  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onSidebarToggle(newCollapsedState);
  };

  return (
    <>
      {/* Toggle Button */}
      <ActionIcon
        onClick={toggleSidebar}
        size="sm"
        variant="subtle"
        color="dark"
        style={{
          position: 'fixed',
          top: 90,
          left: isCollapsed ? 10 : 220,
          zIndex: 101,
          transition: 'left 0.3s ease',
          opacity: 0.6
        }}
      >
        {isCollapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
      </ActionIcon>

      {/* Sidebar */}
      <Transition
        mounted={!isCollapsed}
        transition="slide-right"
        duration={300}
        timingFunction="ease"
      >
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: 'fixed',
              top: 80,
              left: 0,
              width: 256,
              height: 'calc(100vh - 80px)',
              backdropFilter: 'blur(10px)',
              borderRight: '1px solid rgba(233, 236, 239, 0.5)',
              padding: '16px',
              zIndex: 100,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Navigation Section */}
            <Stack gap="xs" style={{ marginTop: '40px' }}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <NavLink
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    active={isActive}
                    label={item.label}
                    leftSection={
                      <ThemeIcon 
                        variant={isActive ? 'filled' : 'light'} 
                        size="sm"
                        color={isActive ? 'primary' : 'dark'}
                      >
                        <Icon size={16} />
                      </ThemeIcon>
                    }
                    styles={{
                      root: {
                        borderRadius: 8,
                        padding: '10px 12px',
                        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        '&[data-active]': {
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          color: 'var(--mantine-color-blue-7)',
                        },
                        '&:hover:not([data-active])': {
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        }
                      },
                      label: {
                        fontWeight: 500,
                      }
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}
      </Transition>
    </>
  );
}; 