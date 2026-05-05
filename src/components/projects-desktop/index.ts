/**
 * Phase 0 design primitives for the macOS desktop redesign of /projects.
 * See docs/projects-mac-desktop-plan.md for the full plan.
 *
 * Phase 1 will compose these into the route shell. Phase 3 will add dock-
 * specific concerns (status indicators, magnification, focus animations).
 */

export {
  AppIcon,
  ProjectAppIcon,
  FolderIcon,
  DocumentIcon,
  AHMonogram,
} from './IconTile';

export { Wallpaper } from './Wallpaper';

export {
  PROJECT_ICONS,
  getProjectIcon,
  type ProjectIconConfig,
} from './iconMapping';
