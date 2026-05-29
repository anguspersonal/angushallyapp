/**
 * Single source of truth for route-level visual "surfaces".
 *
 * Surface is orthogonal to colour-scheme: components that care (Glass,
 * GradientRoot) read the data-surface attribute independently.
 *
 * To add a persona / route-level visual system, append ONE entry here. You
 * should not need to touch ClientLayout. The persona page itself owns its
 * fonts (src/app/<route>/fonts.ts), styles (<route>.module.css), and any
 * bespoke nav / hero / footer.
 *
 *  kind "editorial" -> flat editorial chrome (BlogHeader + editorial footer + GradientRoot)
 *  kind "fullBleed" -> page owns the whole viewport; site chrome + GradientRoot suppressed
 *  no entry          -> default site chrome (Mantine AppShell + Glass header + Footer)
 */
export type SurfaceKind = 'editorial' | 'fullBleed';

export interface SurfaceDef {
  /** value written to data-surface */
  surface: string;
  kind: SurfaceKind;
  /** true when this surface owns the given pathname */
  match: (pathname: string) => boolean;
}

export const SURFACES: SurfaceDef[] = [
  { surface: 'blog', kind: 'editorial', match: (p) => p === '/blog' || p.startsWith('/blog/') },
  { surface: 'projects', kind: 'fullBleed', match: (p) => p === '/projects' },
  { surface: 'dev', kind: 'fullBleed', match: (p) => p === '/dev' },
];

export function resolveSurface(pathname: string | null | undefined): SurfaceDef | undefined {
  if (!pathname) return undefined;
  return SURFACES.find((s) => s.match(pathname));
}
