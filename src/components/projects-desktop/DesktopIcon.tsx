'use client';

import * as React from 'react';
import type { OriginRect } from './WindowContext';
import styles from './DesktopIcon.module.css';

interface DesktopIconProps {
  /** Visible label rendered beneath the tile. */
  label: string;
  /**
   * Click handler. Receives the icon's bounding rect in viewport coords so the
   * window manager can animate the open transition from icon → window.
   */
  onClick?: (origin: OriginRect) => void;
  /** The IconTile element to render — DocumentIcon, FolderIcon, AppIcon, etc. */
  children: React.ReactNode;
  /**
   * Optional class applied to the outer button. Used by the parent surface to
   * position the icon on the desktop (see `styles.slotResume` for the default
   * Resume.pdf slot, top-right of the desktop area). Once the user drags the
   * icon, an inline `left/top` overrides the slot class's positioning.
   */
  className?: string;
  /**
   * Optional localStorage key — when set, the icon's dragged position
   * persists across page reloads. Position is read on mount and written
   * after each drag-end. The stored value is re-clamped to the current
   * viewport on hydrate so a position saved on a wide screen still lands
   * visibly on a narrower one.
   */
  storageKey?: string;
}

// Pixels the pointer must travel before a press becomes a drag (rather than a
// click). Below this threshold, pointerup fires `onClick` like a normal button.
const DRAG_THRESHOLD = 4;

// Reserve space below the menu bar (28px tall) so dragged icons can't slip
// under it. A few pixels of breathing room above keeps the icon legible.
const MIN_TOP = 36;

interface DragState {
  startPointer: { x: number; y: number };
  startPosition: { x: number; y: number };
  size: { w: number; h: number };
  moved: boolean;
}

/**
 * Generic icon-with-label primitive for items that live directly on the
 * desktop (rather than inside the dock). The icon stays where the slot class
 * places it until the user drags it; once dragged, position is held in local
 * state and clamped to the viewport (below the menu bar).
 *
 * Click vs. drag is decided by a 4px pointer-movement threshold. Below that
 * threshold, pointerup fires the normal `onClick` (so keyboard Enter/Space
 * activation also still works through React's synthetic click).
 */
export function DesktopIcon({
  label,
  onClick,
  children,
  className,
  storageKey,
}: DesktopIconProps) {
  const elRef = React.useRef<HTMLButtonElement>(null);
  const dragRef = React.useRef<DragState | null>(null);
  // Set on pointerup whenever a drag actually moved. The next synthetic click
  // sees the flag and bails so dragging doesn't double-trigger as a click.
  const justDraggedRef = React.useRef(false);
  // Mirrors `position` state so handlePointerEnd can read the final value
  // without waiting for a re-render before writing to localStorage.
  const positionRef = React.useRef<{ x: number; y: number } | null>(null);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Hydrate from localStorage on mount. Re-clamp to the current viewport so a
  // stored position from a wider screen still lands visibly on a narrower one.
  React.useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    let stored: { x: unknown; y: unknown } | null = null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      stored = raw ? (JSON.parse(raw) as { x: unknown; y: unknown }) : null;
    } catch {
      // Malformed JSON or storage access denied — ignore.
      return;
    }
    if (
      !stored ||
      typeof stored.x !== 'number' ||
      typeof stored.y !== 'number' ||
      !Number.isFinite(stored.x) ||
      !Number.isFinite(stored.y)
    ) {
      return;
    }
    // Wait one frame so the slot class has rendered the icon at its default
    // location; we use the rendered size as the clamping reference.
    const id = window.requestAnimationFrame(() => {
      const rect = elRef.current?.getBoundingClientRect();
      const w = rect?.width ?? 96;
      const h = rect?.height ?? 96;
      const x = clamp(stored!.x as number, 0, window.innerWidth - w);
      const y = clamp(stored!.y as number, MIN_TOP, window.innerHeight - h);
      const next = { x, y };
      positionRef.current = next;
      setPosition(next);
    });
    return () => window.cancelAnimationFrame(id);
  }, [storageKey]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only react to primary mouse button / touch / pen.
    if (e.button !== undefined && e.button !== 0) return;
    const el = elRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    dragRef.current = {
      startPointer: { x: e.clientX, y: e.clientY },
      startPosition: position ?? { x: rect.left, y: rect.top },
      size: { w: rect.width, h: rect.height },
      moved: false,
    };
    justDraggedRef.current = false;
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = e.clientX - drag.startPointer.x;
    const dy = e.clientY - drag.startPointer.y;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!drag.moved) {
      drag.moved = true;
      setIsDragging(true);
    }

    const nextX = clamp(drag.startPosition.x + dx, 0, window.innerWidth - drag.size.w);
    const nextY = clamp(
      drag.startPosition.y + dy,
      MIN_TOP,
      window.innerHeight - drag.size.h,
    );
    const next = { x: nextX, y: nextY };
    positionRef.current = next;
    setPosition(next);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (elRef.current?.hasPointerCapture(e.pointerId)) {
      elRef.current.releasePointerCapture(e.pointerId);
    }
    if (drag.moved) {
      justDraggedRef.current = true;
      setIsDragging(false);
      // Persist the final position. Single write per drag (not per move) so
      // localStorage isn't hammered while the user is mid-drag.
      if (storageKey && positionRef.current && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(positionRef.current));
        } catch {
          // localStorage can throw in private browsing or when quota is full.
          // The drag still works in-session — only persistence is lost.
        }
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (justDraggedRef.current) {
      // Suppress the synthetic click that follows a drag-release.
      justDraggedRef.current = false;
      e.preventDefault();
      return;
    }
    if (!onClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onClick({ x: rect.x, y: rect.y, w: rect.width, h: rect.height });
  };

  const style: React.CSSProperties | undefined = position
    ? { left: position.x, top: position.y, right: 'auto' }
    : undefined;

  return (
    <button
      ref={elRef}
      type="button"
      className={`${styles.icon} ${className ?? ''}`.trim()}
      style={style}
      data-dragging={isDragging ? 'true' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClick={handleClick}
      aria-label={`Open ${label}`}
    >
      <span className={styles.iconWrap}>{children}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/** Pre-configured class names for the canonical desktop slots. */
export const desktopSlot = {
  resume: styles.slotResume,
  dvg: styles.slotDvg,
} as const;

export default DesktopIcon;
