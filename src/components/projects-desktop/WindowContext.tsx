'use client';

import * as React from 'react';
import { projectList } from '@/data/projectList';

/**
 * Window manager context for the macOS desktop redesign of `/projects`.
 *
 * Phase 4 ships the engine: state machine, cascade positioning, focus + z-index,
 * Esc-to-close keybinding. Phase 5 plugs the actual window-type components into
 * `<WindowManager>` based on `kind`. The provider is mounted by `<MacDesktop>`
 * so every chrome surface (dock, menu bar, desktop icons) reaches the same
 * `useWindow()` hook.
 *
 * See `docs/projects-mac-desktop-plan.md` for the build plan.
 */

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type WindowKind =
  | { type: 'project'; projectId: number }
  | { type: 'archive-folder' }
  | { type: 'about' }
  | { type: 'resume' };

export type WindowId = string;

export interface OriginRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowState {
  id: WindowId;
  kind: WindowKind;
  position: { x: number; y: number };
  size: { w: number; h: number };
  z: number;
  /** Optional source rect for the open/close animation (icon → window). */
  origin?: OriginRect;
}

export interface WindowContextValue {
  windows: WindowState[];
  /** ID of the topmost (focused) window, or null if none open. */
  focusedId: WindowId | null;
  openWindow(kind: WindowKind, origin?: OriginRect): void;
  closeWindow(id: WindowId): void;
  focusWindow(id: WindowId): void;
  setPosition(id: WindowId, position: { x: number; y: number }): void;
  // Convenience wrappers — call sites use these; switching window kinds at
  // call-site avoids repeating the kind discriminator object literal.
  openProject(projectId: number, origin?: OriginRect): void;
  openArchiveFolder(origin?: OriginRect): void;
  openAbout(origin?: OriginRect): void;
  openResume(origin?: OriginRect): void;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function windowIdFor(kind: WindowKind): WindowId {
  switch (kind.type) {
    case 'project':
      return `project:${kind.projectId}`;
    case 'archive-folder':
      return 'archive-folder';
    case 'about':
      return 'about';
    case 'resume':
      return 'resume';
  }
}

/**
 * Default size per window kind. Matches the targets in Phase 5 of the plan so
 * cascade math is correct from the engine's first paint — Phase 5 just swaps
 * the body content, not the frame dimensions.
 *
 * Per-phase-5 spec:
 * - RichProjectWindow (DVG + Timeline with hero screenshots): 720×540
 * - WriteUpWindow (Strava + AI Text, active but no hero): 580×440
 * - TerseArchivedWindow (archived projects): 520×360
 * - FinderWindow (archive folder): 720×500
 * - SystemWindow (About): 640×480
 * - SystemWindow (Resume): 720×540
 */
function defaultSizeFor(kind: WindowKind): { w: number; h: number } {
  switch (kind.type) {
    case 'project': {
      const project = projectList.find((p) => p.id === kind.projectId);
      // Archived projects get the smaller terse window
      if (project?.status === 'archived') {
        return { w: 520, h: 360 };
      }
      // Active projects without screenshots get write-up-only size
      if (project && !project.screenshot) {
        return { w: 580, h: 440 };
      }
      // Projects with screenshots get rich window size
      return { w: 720, h: 540 };
    }
    case 'archive-folder':
      return { w: 720, h: 500 };
    case 'about':
      return { w: 640, h: 480 };
    case 'resume':
      return { w: 720, h: 540 };
  }
}

const BASE_Z = 30;
const CASCADE_OFFSET = 30;
const CASCADE_WRAP = 5;

function getViewport(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 1440, h: 900 };
  return { w: window.innerWidth, h: window.innerHeight };
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

interface ProviderState {
  windows: Map<WindowId, WindowState>;
  /** Monotonic counter for cascade index (mod CASCADE_WRAP). Never decrements. */
  openCount: number;
  /** Highest z-index in use; new windows + focus bump this. */
  topZ: number;
}

type ProviderAction =
  | { type: 'open'; kind: WindowKind; origin?: OriginRect; viewport: { w: number; h: number } }
  | { type: 'close'; id: WindowId }
  | { type: 'focus'; id: WindowId }
  | { type: 'setPosition'; id: WindowId; position: { x: number; y: number } };

function reducer(state: ProviderState, action: ProviderAction): ProviderState {
  switch (action.type) {
    case 'open': {
      const id = windowIdFor(action.kind);
      const existing = state.windows.get(id);
      if (existing) {
        // Already open — re-focus, do not cascade or re-position.
        if (existing.z === state.topZ) return state;
        const z = state.topZ + 1;
        const next = new Map(state.windows);
        next.set(id, { ...existing, z });
        return { ...state, windows: next, topZ: z };
      }
      const size = defaultSizeFor(action.kind);
      const cascadeIdx = state.openCount % CASCADE_WRAP;
      // Slightly left of centre so the cascade reads "stack growing right".
      const baseX = Math.max(40, (action.viewport.w - size.w) / 2 - 60);
      const baseY = 60; // clear of the 28px menu bar
      const position = {
        x: Math.round(baseX + cascadeIdx * CASCADE_OFFSET),
        y: Math.round(baseY + cascadeIdx * CASCADE_OFFSET),
      };
      const z = state.topZ + 1;
      const next = new Map(state.windows);
      next.set(id, {
        id,
        kind: action.kind,
        position,
        size,
        z,
        origin: action.origin,
      });
      return {
        windows: next,
        openCount: state.openCount + 1,
        topZ: z,
      };
    }

    case 'close': {
      if (!state.windows.has(action.id)) return state;
      const next = new Map(state.windows);
      next.delete(action.id);
      return { ...state, windows: next };
    }

    case 'focus': {
      const existing = state.windows.get(action.id);
      if (!existing) return state;
      if (existing.z === state.topZ) return state;
      const z = state.topZ + 1;
      const next = new Map(state.windows);
      next.set(action.id, { ...existing, z });
      return { ...state, windows: next, topZ: z };
    }

    case 'setPosition': {
      const existing = state.windows.get(action.id);
      if (!existing) return state;
      const next = new Map(state.windows);
      next.set(action.id, { ...existing, position: action.position });
      return { ...state, windows: next };
    }
  }
}

// -----------------------------------------------------------------------------
// Context + Provider
// -----------------------------------------------------------------------------

const WindowContext = React.createContext<WindowContextValue | null>(null);

export function useWindow(): WindowContextValue {
  const ctx = React.useContext(WindowContext);
  if (!ctx) {
    throw new Error('useWindow must be used inside <WindowProvider>');
  }
  return ctx;
}

interface WindowProviderProps {
  children: React.ReactNode;
}

export function WindowProvider({ children }: WindowProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, undefined, () => ({
    windows: new Map<WindowId, WindowState>(),
    openCount: 0,
    topZ: BASE_Z,
  }));

  const openWindow = React.useCallback((kind: WindowKind, origin?: OriginRect) => {
    dispatch({ type: 'open', kind, origin, viewport: getViewport() });
  }, []);

  const closeWindow = React.useCallback((id: WindowId) => {
    // The reducer removes the window immediately. <AnimatePresence> in
    // <WindowManager> keeps the DOM node alive for the exit transition.
    dispatch({ type: 'close', id });
  }, []);

  const focusWindow = React.useCallback((id: WindowId) => {
    dispatch({ type: 'focus', id });
  }, []);

  const setPosition = React.useCallback(
    (id: WindowId, position: { x: number; y: number }) => {
      dispatch({ type: 'setPosition', id, position });
    },
    [],
  );

  const openProject = React.useCallback(
    (projectId: number, origin?: OriginRect) => {
      openWindow({ type: 'project', projectId }, origin);
    },
    [openWindow],
  );

  const openArchiveFolder = React.useCallback(
    (origin?: OriginRect) => {
      openWindow({ type: 'archive-folder' }, origin);
    },
    [openWindow],
  );

  const openAbout = React.useCallback(
    (origin?: OriginRect) => {
      openWindow({ type: 'about' }, origin);
    },
    [openWindow],
  );

  const openResume = React.useCallback(
    (origin?: OriginRect) => {
      openWindow({ type: 'resume' }, origin);
    },
    [openWindow],
  );

  // Sorted by z so render order matches stacking; focused window is last.
  const windows = React.useMemo(
    () => Array.from(state.windows.values()).sort((a, b) => a.z - b.z),
    [state.windows],
  );

  const focusedId = windows.length > 0 ? windows[windows.length - 1].id : null;

  // Esc → close focused window. Skip when the user is typing in a field so
  // form Escape behaviour (e.g. Mantine select close) is not hijacked.
  React.useEffect(() => {
    if (!focusedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      closeWindow(focusedId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedId, closeWindow]);

  const value = React.useMemo<WindowContextValue>(
    () => ({
      windows,
      focusedId,
      openWindow,
      closeWindow,
      focusWindow,
      setPosition,
      openProject,
      openArchiveFolder,
      openAbout,
      openResume,
    }),
    [
      windows,
      focusedId,
      openWindow,
      closeWindow,
      focusWindow,
      setPosition,
      openProject,
      openArchiveFolder,
      openAbout,
      openResume,
    ],
  );

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>;
}
