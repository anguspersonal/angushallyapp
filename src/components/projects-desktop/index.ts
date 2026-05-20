/**
 * Public surface for the macOS desktop redesign of /projects.
 * See docs/projects-mac-desktop-plan.md for the full plan.
 *
 * Phase 0: glass-tile primitives + per-project icon mapping.
 * Phase 1: route shell + wallpaper.
 * Phase 2: menu bar + live clock.
 * Phase 3: dock + dock icons + desktop icons (static visual).
 * Phase 4: window manager engine (context, frame, drag, focus, animations).
 * Phase 5: window types (RichProject, WriteUp, TerseArchived, Finder, System).
 * Phase 6: boot intro (MacBootIntro with 5-phase animation).
 * Phase 7: mobile (iOS Home Screen with sheets and folders).
 */

export {
  AppIcon,
  ProjectAppIcon,
  FolderIcon,
  DocumentIcon,
  AHMonogram,
} from './IconTile';

export { Wallpaper } from './Wallpaper';

export { MacDesktop } from './MacDesktop';

export { MenuBar } from './MenuBar';

export { LiveClock } from './LiveClock';

export { Dock } from './Dock';

export { DockIcon } from './DockIcon';

export { DesktopIcon, desktopSlot } from './DesktopIcon';

export {
  WindowProvider,
  useWindow,
  windowIdFor,
  type WindowKind,
  type WindowId,
  type WindowState,
  type WindowContextValue,
  type OriginRect,
} from './WindowContext';

export { WindowFrame } from './WindowFrame';

export { WindowManager } from './WindowManager';

export {
  PROJECT_ICONS,
  getProjectIcon,
  type ProjectIconConfig,
} from './iconMapping';

// Phase 5 window types
export { RichProjectWindow } from './RichProjectWindow';

export { WriteUpWindow } from './WriteUpWindow';

export { TerseArchivedWindow } from './TerseArchivedWindow';

export { FinderWindow } from './FinderWindow';

export { SystemWindow } from './SystemWindow';

// Phase 6 boot intro
export { MacBootIntro } from './MacBootIntro';

// Phase 7 mobile
export { MobileHomeScreen } from './MobileHomeScreen';

export { MobileProjectSheet } from './MobileProjectSheet';

export { MobileArchiveFolder } from './MobileArchiveFolder';

export { MobileBootIntro } from './MobileBootIntro';

export { useMobileBreakpoint } from './useMobileBreakpoint';
