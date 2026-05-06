'use client';

import { MacDesktop } from '@/components/projects-desktop';

/**
 * `/projects` — full-bleed macOS desktop redesign.
 *
 * Phase 1: route shell only. The desktop renders the wallpaper and acts as
 * the stage for chrome layered on in later phases (menu bar, dock, desktop
 * icons, window manager). See `docs/projects-mac-desktop-plan.md`.
 *
 * Site header, footer, AppShell, and GradientRoot are suppressed for this
 * route via the `'projects'` surface in `ClientLayout`.
 */
export default function ProjectsPage() {
  return <MacDesktop />;
}
