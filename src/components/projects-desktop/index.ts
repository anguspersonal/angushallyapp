/**
 * Public surface for the macOS desktop redesign of /projects.
 * See docs/projects-mac-desktop-plan.md for the full plan.
 *
 * Phase 0: glass-tile primitives + per-project icon mapping.
 * Phase 1: route shell + wallpaper.
 * Phase 2: menu bar + live clock.
 * Phase 3: dock + dock icons + desktop icons (static visual; click wiring in Phase 4).
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
  PROJECT_ICONS,
  getProjectIcon,
  type ProjectIconConfig,
} from './iconMapping';
