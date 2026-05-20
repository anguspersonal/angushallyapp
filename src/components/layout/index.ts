/**
 * Layout primitives (ADR 0032).
 *
 * Column-first universal layout. Mobile is the base case; horizontal
 * layouts are an explicit opt-in by component.
 *
 * - Stack    — flex column with token gap. The default.
 * - Section  — Stack + Container + token vertical padding. One per page section.
 * - Cluster  — flex row that wraps. For pills, link rows, footer columns.
 * - Switcher — row above content threshold, column below (no media query).
 * - Sidebar  — content + side rail with explicit collapse.
 */
export { Stack } from './Stack';
export type { StackProps } from './Stack';

export { Section } from './Section';
export type { SectionProps, SectionWidth, SectionPadY } from './Section';

export { Cluster } from './Cluster';
export type { ClusterProps, ClusterAlign, ClusterJustify } from './Cluster';

export { Switcher } from './Switcher';
export type { SwitcherProps } from './Switcher';

export { Sidebar } from './Sidebar';
export type { SidebarProps } from './Sidebar';

export type { GapToken } from './shared';
