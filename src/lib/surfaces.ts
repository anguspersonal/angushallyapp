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
  // `/projects` is exact-match: its sub-routes (e.g. /projects/foo) keep default
  // site chrome. Project pages are individual destinations, not a persona subtree.
  { surface: 'projects', kind: 'fullBleed', match: (p) => p === '/projects' },
  // Persona surfaces own their whole subtree (index + anything beneath), so a
  // sub-page like /<persona>/privacy renders in the persona's chrome. `/dev` is
  // the reference persona surface; further personas should follow this prefix
  // matcher (`p === '/<persona>' || p.startsWith('/<persona>/')`).
  { surface: 'dev', kind: 'fullBleed', match: (p) => p === '/dev' || p.startsWith('/dev/') },
  { surface: 'strategist', kind: 'fullBleed', match: (p) => p === '/strategist' || p.startsWith('/strategist/') },
  { surface: 'ai-pm', kind: 'fullBleed', match: (p) => p === '/ai-pm' || p.startsWith('/ai-pm/') },
  { surface: 'teacher', kind: 'fullBleed', match: (p) => p === '/teacher' || p.startsWith('/teacher/') },
];

export function resolveSurface(pathname: string | null | undefined): SurfaceDef | undefined {
  if (!pathname) return undefined;
  return SURFACES.find((s) => s.match(pathname));
}
