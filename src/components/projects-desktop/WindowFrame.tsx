'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useWindow, type WindowState } from './WindowContext';
import styles from './WindowFrame.module.css';

interface WindowFrameProps {
  window: WindowState;
  isFocused: boolean;
  title: string;
  children?: React.ReactNode;
}

const HEADER_HEIGHT = 32;
/** Min px of header that must remain visible after a drag. */
const MIN_VISIBLE = 200;
const OPEN_DURATION = 0.28;
const OPEN_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function clampPosition(
  p: { x: number; y: number },
  size: { w: number; h: number },
): { x: number; y: number } {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const minX = -size.w + MIN_VISIBLE;
  const maxX = vw - MIN_VISIBLE;
  const minY = 0; // covered by menu bar but locks the header to the top edge
  const maxY = vh - HEADER_HEIGHT;
  return {
    x: Math.max(minX, Math.min(maxX, p.x)),
    y: Math.max(minY, Math.min(maxY, p.y)),
  };
}

/**
 * Base window component: glass material, traffic-light header, drag-by-header,
 * focus-aware shadow, origin-aware open/close animation.
 *
 * Phase 4 ships this with a placeholder body. Phase 5 replaces `children` per
 * window kind (Rich, WriteUp, TerseArchived, Finder, System).
 */
export function WindowFrame({ window: win, isFocused, title, children }: WindowFrameProps) {
  const { closeWindow, focusWindow, setPosition } = useWindow();
  const [localPosition, setLocalPosition] = React.useState(win.position);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragRef = React.useRef<{
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    pointerId: number;
  } | null>(null);

  // Re-sync local position when context position changes from outside (e.g.
  // a future "snap to grid" command). Don't fight an in-progress drag.
  React.useEffect(() => {
    if (!isDragging) {
      setLocalPosition(win.position);
    }
  }, [win.position, isDragging]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't initiate drag from buttons inside the header (traffic lights).
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-drag]')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: localPosition.x,
      startY: localPosition.y,
      pointerId: e.pointerId,
    };
    setIsDragging(true);
    focusWindow(win.id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startMouseX;
    const dy = e.clientY - dragRef.current.startMouseY;
    const next = clampPosition(
      { x: dragRef.current.startX + dx, y: dragRef.current.startY + dy },
      win.size,
    );
    setLocalPosition(next);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
    } catch {
      // Pointer may have already been released by the browser; ignore.
    }
    dragRef.current = null;
    setIsDragging(false);
    setPosition(win.id, localPosition);
  };

  // Compute the icon→window centre delta so the open/close anim grows from
  // (and shrinks back to) the icon's location. Falls back to zero offset if
  // no origin was captured (e.g. opened via keyboard).
  const originDelta = React.useMemo(() => {
    if (!win.origin) return { x: 0, y: 0 };
    const iconCx = win.origin.x + win.origin.w / 2;
    const iconCy = win.origin.y + win.origin.h / 2;
    const windowCx = win.position.x + win.size.w / 2;
    const windowCy = win.position.y + win.size.h / 2;
    return { x: iconCx - windowCx, y: iconCy - windowCy };
  }, [win.origin, win.position.x, win.position.y, win.size.w, win.size.h]);

  return (
    <motion.div
      className={styles.window}
      data-focused={isFocused ? 'true' : 'false'}
      data-dragging={isDragging ? 'true' : 'false'}
      style={{
        left: localPosition.x,
        top: localPosition.y,
        width: win.size.w,
        height: win.size.h,
        zIndex: win.z,
      }}
      initial={{ opacity: 0, scale: 0.05, x: originDelta.x, y: originDelta.y }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.05, x: originDelta.x, y: originDelta.y }}
      transition={{ duration: OPEN_DURATION, ease: OPEN_EASE }}
      onMouseDownCapture={() => focusWindow(win.id)}
      role="dialog"
      aria-label={title}
    >
      <div
        className={styles.header}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className={styles.trafficLights} data-no-drag>
          <button
            type="button"
            className={`${styles.light} ${styles.lightClose}`}
            onClick={() => closeWindow(win.id)}
            aria-label="Close window"
          >
            <svg viewBox="0 0 8 8" aria-hidden>
              <path d="M2 2 L6 6 M6 2 L2 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.light} ${styles.lightMin}`}
            onClick={() => {}}
            aria-label="Minimise window (not implemented)"
            disabled
          >
            <svg viewBox="0 0 8 8" aria-hidden>
              <path d="M1.5 4 L6.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.light} ${styles.lightMax}`}
            onClick={() => {}}
            aria-label="Expand window (not implemented)"
            disabled
          >
            <svg viewBox="0 0 8 8" aria-hidden>
              <path d="M2.2 4 L5.8 4 M4 2.2 L4 5.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={styles.title}>{title}</div>
      </div>
      <div className={styles.body}>{children}</div>
    </motion.div>
  );
}

export default WindowFrame;
