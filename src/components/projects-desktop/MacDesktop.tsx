'use client';

import * as React from 'react';
import { Wallpaper } from './Wallpaper';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { DesktopIcon, desktopSlot } from './DesktopIcon';
import { DocumentIcon, ProjectAppIcon } from './IconTile';
import { WindowProvider, useWindow } from './WindowContext';
import { WindowManager } from './WindowManager';
import { MacBootIntro } from './MacBootIntro';
import { MobileBootIntro } from './MobileBootIntro';
import { MobileHomeScreen } from './MobileHomeScreen';
import { MobileProjectSheet } from './MobileProjectSheet';
import { MobileArchiveFolder } from './MobileArchiveFolder';
import { useMobileBreakpoint } from './useMobileBreakpoint';
import { projectList } from '@/data/projectList';
import styles from './MacDesktop.module.css';
import mobileStyles from './MacDesktopMobile.module.css';

interface MacDesktopProps {
  /**
   * Optional extra content rendered on the desktop surface. Most chrome
   * (wallpaper, menu bar, dock, Resume.pdf icon, window manager) is mounted
   * internally so the page surface stays a single `<MacDesktop />`.
   */
  children?: React.ReactNode;
}

/**
 * Full-viewport macOS desktop shell for `/projects`.
 *
 * Layering (z-axis, bottom → top):
 *   Wallpaper → DesktopIcon(s) → Windows (z=31..) → Dock (z=90) → MenuBar (z=100)
 *
 * Windows live below both the dock and the menu bar so the chrome stays
 * persistent (matches macOS conceptually — the menu bar is always on top, and
 * here the dock joins it as system chrome rather than a clickable overlay).
 *
 * The component is split into a thin outer that mounts `<WindowProvider>` and
 * an inner that consumes `useWindow()`. That lets the Resume desktop icon's
 * `onClick` call into the same context used by the dock and menu bar.
 */
export function MacDesktop({ children }: MacDesktopProps) {
  return (
    <WindowProvider>
      <MacDesktopInner>{children}</MacDesktopInner>
    </WindowProvider>
  );
}

/**
 * Desktop layout (macOS) - full window manager with drag, multi-window, etc.
 */
function DesktopLayout({ children }: MacDesktopProps) {
  const { openResume, openProject, reduceMotion } = useWindow();

  return (
    <div
      className={styles.root}
      data-reduce-motion={reduceMotion ? 'true' : 'false'}
    >
      {/* Desktop boot intro */}
      <MacBootIntro />

      <Wallpaper />
      <MenuBar />

      <DesktopIcon
        label="Resume.pdf"
        className={desktopSlot.resume}
        storageKey="projects-desktop:resume-position"
        onClick={(origin) => openResume(origin)}
      >
        <DocumentIcon size={64} label="Resume.pdf" badge="PDF" />
      </DesktopIcon>

      <DesktopIcon
        label="Data Value Game"
        className={desktopSlot.dvg}
        storageKey="projects-desktop:dvg-position"
        onClick={(origin) => openProject(0, origin)}
      >
        <ProjectAppIcon projectId={0} size={64} label="Data Value Game" />
      </DesktopIcon>

      <Dock />

      <WindowManager />

      {children}
    </div>
  );
}

/**
 * Mobile layout (iOS Home Screen) - single sheet UI, no drag, no multi-window.
 */
function MobileLayout() {
  const [selectedProjectId, setSelectedProjectId] = React.useState<number | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);

  const selectedProject = React.useMemo(() => {
    if (selectedProjectId === null) return null;
    return projectList.find((p) => p.id === selectedProjectId) ?? null;
  }, [selectedProjectId]);

  const handleOpenProject = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

  const handleCloseProject = () => {
    setSelectedProjectId(null);
  };

  const handleOpenArchive = () => {
    setIsArchiveOpen(true);
  };

  const handleCloseArchive = () => {
    setIsArchiveOpen(false);
  };

  return (
    <div className={mobileStyles.root}>
      {/* Mobile boot intro */}
      <MobileBootIntro />

      <Wallpaper />

      {/* Mobile menu bar - simplified */}
      <div className={mobileStyles.mobileHeader}>
        <span className={mobileStyles.mobileTitle}>Projects</span>
      </div>

      {/* iOS Home Screen grid */}
      <div className={mobileStyles.homeScreen}>
        <MobileHomeScreen
          onOpenProject={handleOpenProject}
          onOpenArchive={handleOpenArchive}
        />
      </div>

      {/* Project sheet (opens when project tapped) */}
      <MobileProjectSheet
        project={selectedProject}
        isOpen={selectedProjectId !== null}
        onClose={handleCloseProject}
      />

      {/* Archive folder (iOS folder pattern) */}
      <MobileArchiveFolder
        isOpen={isArchiveOpen}
        onClose={handleCloseArchive}
        onOpenProject={handleOpenProject}
      />
    </div>
  );
}

function MacDesktopInner({ children }: MacDesktopProps) {
  const isMobile = useMobileBreakpoint();

  if (isMobile) {
    return <MobileLayout />;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}

export default MacDesktop;
