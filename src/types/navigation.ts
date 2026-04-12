import type { ComponentType } from 'react';

export interface NavigationLink {
  link: string;
  label: string;
  icon: ComponentType<Record<string, unknown>>;
}
