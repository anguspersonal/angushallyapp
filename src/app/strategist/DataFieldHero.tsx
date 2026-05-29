'use client';

/**
 * `/strategist` hero — "Structure in the noise".
 *
 * An instanced field of steel spheres on a lattice. At rest the field is
 * chaos (each ball orbits a random centre); hitting the Clarity toggle eases
 * every ball home to its ordered lattice position and fades the linking
 * filaments in. The strategist's pitch made literal: find the order already
 * inside the noise, and make it hold.
 *
 * Ported from the design-brief mockup (three.js) into a self-contained,
 * cleanup-safe React client component. Mounted via next/dynamic ssr:false.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './strategist.module.css';

const DataFieldHero = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const fpsRef = useRef<HTMLSpanElement>(null);
    const stateRef = useRef<HTMLDivElement>(null);
    /** Render loop reads this; React state drives the toggle's visual only. */
    const clarityTargetRef = useRef(0);
    const [on, setOn] = useState(false);
    const [counts, setCounts] = useState<{ nodes: number; links: number }>({ nodes: 0, links: 0 });

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.set(0, 0, 7.6);

        // ── studio environment for metallic reflections ──
        const envCanvas = document.createElement('canvas');
        envCanvas.width = 512;
        envCanvas.height = 256;
        const ex = envCanvas.getContext('2d')!;
        const eg = ex.createLinearGradient(0, 0, 0, 256);
        eg.addColorStop(0.0, '#ffffff');
        eg.addColorStop(0.42, '#e9e9ec');
        eg.addColorStop(0.5, '#ffffff');
        eg.addColorStop(0.6, '#dcdce0');
        eg.addColorStop(1.0, '#bfc0c5');
        ex.fillStyle = eg;
        ex.fillRect(0, 0, 512, 256);
        ex.fillStyle = 'rgba(255,255,255,0.95)';
        ex.fillRect(0, 36, 512, 22);
        ex.fillStyle = 'rgba(255,255,255,0.5)';
        ex.fillRect(0, 150, 512, 10);
        const envTex = new THREE.CanvasTexture(envCanvas);
        envTex.mapping = THREE.EquirectangularReflectionMapping;
        envTex.colorSpace = THREE.SRGBColorSpace;
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const env = pmrem.fromEquirectangular(envTex).texture;
        scene.environment = env;

        const ambient = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(ambient);
        const key = new THREE.DirectionalLight(0xffffff, 2.2);
        key.position.set(5, 8, 6);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xdfe2ea, 0.8);
        fill.position.set(-6, -3, 4);
        scene.add(fill);

        const pivot = new THREE.Group();
        scene.add(pivot);

        // ── lattice homes + per-ball chaos params ──
        const G = 15, SIZE = 4.6, DROP = 0.3, LINK = 0.18;
        const idx = (ix: number, iy: number, iz: number) => (iz * G + iy) * G + ix;
        const cellArr = new Int32Array(G * G * G).fill(-1);
        const bx: number[] = [], by: number[] = [], bz: number[] = [];
        const span = (i: number) => (i / (G - 1) - 0.5) * SIZE;
        for (let iz = 0; iz < G; iz++)
            for (let iy = 0; iy < G; iy++)
                for (let ix = 0; ix < G; ix++) {
                    if (Math.random() < DROP) continue;
                    cellArr[idx(ix, iy, iz)] = bx.length;
                    bx.push(span(ix));
                    by.push(span(iy));
                    bz.push(span(iz));
                }
        const M = bx.length;

        const cx = new Float32Array(M), cy = new Float32Array(M), cz = new Float32Array(M);
        const fx = new Float32Array(M), fy = new Float32Array(M), fz = new Float32Array(M);
        const phx = new Float32Array(M), phy = new Float32Array(M), phz = new Float32Array(M);
        const ax = new Float32Array(M), ay = new Float32Array(M), az = new Float32Array(M);
        const delay = new Float32Array(M);
        const rnd = (a: number, b: number) => a + Math.random() * (b - a);
        const SPREAD = SIZE * 0.62;
        for (let i = 0; i < M; i++) {
            cx[i] = rnd(-SPREAD, SPREAD); cy[i] = rnd(-SPREAD, SPREAD); cz[i] = rnd(-SPREAD, SPREAD);
            fx[i] = rnd(2.6, 5.6); fy[i] = rnd(2.6, 5.6); fz[i] = rnd(2.6, 5.6);
            phx[i] = rnd(0, 6.28); phy[i] = rnd(0, 6.28); phz[i] = rnd(0, 6.28);
            ax[i] = rnd(0.28, 0.6); ay[i] = rnd(0.28, 0.6); az[i] = rnd(0.28, 0.6);
            delay[i] = Math.random() * 0.32;
        }

        const ballGeo = new THREE.SphereGeometry(1, 16, 16);
        const steel = new THREE.MeshStandardMaterial({ color: 0xb9bdc4, metalness: 0.96, roughness: 0.28, envMapIntensity: 1.15 });
        const balls = new THREE.InstancedMesh(ballGeo, steel, M);
        balls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        pivot.add(balls);
        const RAD = 0.052;
        const dummy = new THREE.Object3D();
        const cur = new Float32Array(M * 3);

        const pairs: number[] = [];
        const nb = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        for (let iz = 0; iz < G; iz++)
            for (let iy = 0; iy < G; iy++)
                for (let ix = 0; ix < G; ix++) {
                    const a = cellArr[idx(ix, iy, iz)];
                    if (a < 0) continue;
                    for (const [dx, dy, dz] of nb) {
                        const nx = ix + dx, ny = iy + dy, nz = iz + dz;
                        if (nx >= G || ny >= G || nz >= G) continue;
                        const b = cellArr[idx(nx, ny, nz)];
                        if (b < 0) continue;
                        if (Math.random() < LINK) pairs.push(a, b);
                    }
                }
        const L = pairs.length / 2;
        const lpos = new Float32Array(L * 6);
        const lg = new THREE.BufferGeometry();
        lg.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
        const lineMat = new THREE.LineBasicMaterial({ color: 0xb4b1a8, transparent: true, opacity: 0.1, depthWrite: false });
        const lines = new THREE.LineSegments(lg, lineMat);
        pivot.add(lines);

        setCounts({ nodes: M, links: L });

        // ── interaction state ──
        let clarity = 0;
        let dragging = false, lx = 0, ly = 0, velX = 0, velY = 0, rotX = 0, rotY = 0;
        const onPointerDown = (e: PointerEvent) => {
            dragging = true;
            mount.classList.add(styles.dragging);
            lx = e.clientX; ly = e.clientY;
            mount.setPointerCapture(e.pointerId);
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) return;
            velY = (e.clientX - lx) * 0.01;
            velX = (e.clientY - ly) * 0.01;
            rotY += velY; rotX += velX;
            lx = e.clientX; ly = e.clientY;
        };
        const stop = () => {
            dragging = false;
            mount.classList.remove(styles.dragging);
        };
        mount.addEventListener('pointerdown', onPointerDown);
        mount.addEventListener('pointermove', onPointerMove);
        mount.addEventListener('pointerup', stop);
        mount.addEventListener('pointercancel', stop);
        mount.addEventListener('pointerleave', stop);

        const resize = () => {
            const r = mount.getBoundingClientRect();
            renderer.setSize(r.width, r.height, false);
            renderer.domElement.style.width = r.width + 'px';
            renderer.domElement.style.height = r.height + 'px';
            camera.aspect = r.width / Math.max(1, r.height);
            camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(mount);

        const smooth = (e: number) => e * e * (3 - 2 * e);
        const clock = new THREE.Clock();
        let acc = 0, frames = 0;
        let raf = 0;

        const tick = () => {
            const dt = clock.getDelta();
            const t = clock.getElapsedTime();
            acc += dt; frames++;
            if (acc >= 0.5) {
                if (fpsRef.current) fpsRef.current.textContent = String(Math.round(frames / acc));
                acc = 0; frames = 0;
            }

            const clarityTarget = clarityTargetRef.current;
            clarity += (clarityTarget - clarity) * (1 - Math.exp(-dt * 3.0));
            if (Math.abs(clarityTarget - clarity) < 0.004) clarity = clarityTarget;

            if (stateRef.current) stateRef.current.textContent = clarity > 0.5 ? '— clarity —' : '— noise —';
            lineMat.opacity = 0.1 + 0.42 * clarity;

            const tt = t * 0.3;
            const tf = t;
            for (let i = 0; i < M; i++) {
                let ci = (clarity - delay[i]) / (1 - 0.32);
                ci = ci < 0 ? 0 : ci > 1 ? 1 : ci;
                const e = smooth(ci);

                const nx = cx[i] + Math.sin(tf * fx[i] + phx[i]) * ax[i];
                const ny = cy[i] + Math.sin(tf * fy[i] + phy[i]) * ay[i];
                const nz = cz[i] + Math.sin(tf * fz[i] + phz[i]) * az[i];

                const X = bx[i], Y = by[i], Z = bz[i];
                const ox = Math.sin(Z * 0.9 + tt) * 0.18 + Math.sin(Y * 0.6 - tt * 0.7) * 0.1;
                const oy = Math.sin(X * 0.9 - tt * 0.8) * 0.18 + Math.sin(Z * 0.6 + tt * 0.5) * 0.1;
                const oz = Math.sin(Y * 0.9 + tt * 0.6) * 0.18 + Math.sin(X * 0.6 - tt * 0.4) * 0.1;
                const sx = X + ox, sy = Y + oy, sz = Z + oz;

                const px = nx + (sx - nx) * e;
                const py = ny + (sy - ny) * e;
                const pz = nz + (sz - nz) * e;
                cur[i * 3] = px; cur[i * 3 + 1] = py; cur[i * 3 + 2] = pz;

                dummy.position.set(px, py, pz);
                dummy.scale.setScalar(RAD);
                dummy.updateMatrix();
                balls.setMatrixAt(i, dummy.matrix);
            }
            balls.instanceMatrix.needsUpdate = true;

            for (let k = 0; k < L; k++) {
                const a = pairs[k * 2], b = pairs[k * 2 + 1], o = k * 6;
                lpos[o] = cur[a * 3]; lpos[o + 1] = cur[a * 3 + 1]; lpos[o + 2] = cur[a * 3 + 2];
                lpos[o + 3] = cur[b * 3]; lpos[o + 4] = cur[b * 3 + 1]; lpos[o + 5] = cur[b * 3 + 2];
            }
            lg.attributes.position.needsUpdate = true;

            if (!dragging) {
                velX *= 0.94; velY *= 0.94;
                rotY += velY * 0.4; rotX += velX * 0.4;
            }
            pivot.rotation.y += dt * (0.12 - 0.07 * clarity);
            camera.position.x = Math.sin(rotY) * 7.6;
            camera.position.z = Math.cos(rotY) * 7.6;
            camera.position.y = Math.max(-4, Math.min(4, rotX * 2.4));
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        };
        tick();

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            mount.removeEventListener('pointerdown', onPointerDown);
            mount.removeEventListener('pointermove', onPointerMove);
            mount.removeEventListener('pointerup', stop);
            mount.removeEventListener('pointercancel', stop);
            mount.removeEventListener('pointerleave', stop);
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
            ballGeo.dispose();
            steel.dispose();
            lg.dispose();
            lineMat.dispose();
            envTex.dispose();
            env.dispose();
            pmrem.dispose();
            renderer.dispose();
        };
    }, []);

    const toggleClarity = () => {
        setOn((prev) => {
            const next = !prev;
            clarityTargetRef.current = next ? 1 : 0;
            return next;
        });
    };

    return (
        <div className={styles.heroStage}>
            <div ref={mountRef} className={styles.canvasMount} />

            <div className={styles.heroCopy}>
                <span className={`${styles.lbl} ${styles.eyebrow}`}>Longitudinal data · raw</span>
                <h1 className={styles.heroTitle}>
                    Structure<br />in the noise.
                </h1>
                <p className={styles.heroLede}>
                    Every bearing a signal, scattering. My work is finding the order already
                    inside it — and making it hold. Data valuation that survives contact with
                    engineering reality.
                </p>
            </div>

            <div className={styles.heroMeta}>
                <div className={styles.lbl}>Field · <span className={styles.metaV}>{counts.nodes.toLocaleString()}</span> nodes</div>
                <div className={styles.lbl}><span className={styles.metaV}>{counts.links.toLocaleString()}</span> links</div>
                <div className={styles.lbl}>fps <span className={styles.metaV} ref={fpsRef}>60</span></div>
                <div className={`${styles.lbl} ${styles.metaState}`} ref={stateRef}>— noise —</div>
            </div>

            <div className={styles.control}>
                <button
                    type="button"
                    className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
                    aria-pressed={on}
                    onClick={toggleClarity}
                >
                    <span className={styles.toggleT}>Clarity</span>
                    <span className={styles.track}><span className={styles.knob} /></span>
                </button>
                <span className={styles.lbl}>
                    {on ? 'Structure held · drag to rotate' : 'Click to bring structure · drag to rotate'}
                </span>
            </div>
        </div>
    );
};

export default DataFieldHero;
