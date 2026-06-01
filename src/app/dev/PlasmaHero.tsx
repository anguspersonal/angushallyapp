'use client';

/**
 * WebGL plasma blob for the `/dev` hero — a draggable, noise-displaced
 * icosahedron with a fresnel plasma shader, wireframe shell, and particle
 * halo. Code-split out of the route via `next/dynamic({ ssr: false })` so
 * three.js never enters the server bundle or the initial client payload.
 *
 * Renders only the two absolutely-positioned layers (canvas mount + drag
 * handle); the surrounding hero chrome and text live in page.tsx and stay
 * server-rendered. Telemetry spans are owned by page.tsx and updated here
 * via the passed refs.
 */

import React from 'react';
import * as THREE from 'three';
import styles from './dev.module.css';

interface PlasmaHeroProps {
    fpsRef: React.RefObject<HTMLSpanElement | null>;
    msRef: React.RefObject<HTMLSpanElement | null>;
}

const PlasmaHero = ({ fpsRef, msRef }: PlasmaHeroProps) => {
    const mountRef = React.useRef<HTMLDivElement>(null);
    const handleRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const mount = mountRef.current;
        const handle = handleRef.current;
        if (!mount || !handle) return;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
            return; // No WebGL — hero text still renders, blob is skipped.
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 4.2);

        const coreGeom = new THREE.IcosahedronGeometry(1.1, 48);
        const coreMat = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uColorA: { value: new THREE.Color('#ff3df7') },
                uColorB: { value: new THREE.Color('#22d3ff') },
                uColorC: { value: new THREE.Color('#9b5cff') },
                uColorD: { value: new THREE.Color('#7cffb2') },
                uDispAmp: { value: 0.32 },
                uFresPow: { value: 2.2 },
            },
            vertexShader: `
                uniform float uTime; uniform vec2 uMouse; uniform float uDispAmp;
                varying vec3 vNormal; varying vec3 vPos; varying float vDisp;
                vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
                vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
                vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
                vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
                float snoise(vec3 v){
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0,0.5,1.0,2.0);
                    vec3 i  = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
                    vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    float n_ = 0.142857142857; vec3 ns = n_*D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
                    vec4 x = x_*ns.x + ns.yyyy; vec4 y = y_*ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
                    vec4 s0 = floor(b0)*2.0+1.0; vec4 s1 = floor(b1)*2.0+1.0; vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
                    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0); m=m*m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
                }
                void main(){
                    vec3 p = position; float t = uTime * 0.5;
                    float n1 = snoise(p*1.4 + vec3(0.0, t, 0.0));
                    float n2 = snoise(p*2.7 + vec3(t*0.7, 0.0, n1));
                    float n3 = snoise(p*5.1 + vec3(0.0, 0.0, t*1.3));
                    float disp = n1*0.6 + n2*0.3 + n3*0.15;
                    vec3 mDir = normalize(vec3(uMouse, 0.6));
                    float pull = max(0.0, dot(normalize(p), mDir));
                    disp += pow(pull, 4.0) * 0.35;
                    vec3 displaced = p + normal * disp * uDispAmp;
                    vPos = p; vDisp = disp;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime; uniform vec3 uColorA, uColorB, uColorC, uColorD; uniform float uFresPow;
                varying vec3 vNormal; varying vec3 vPos; varying float vDisp;
                void main(){
                    vec3 V = vec3(0.0, 0.0, 1.0);
                    float fres = pow(1.0 - max(0.0, dot(normalize(vNormal), V)), uFresPow);
                    float phase = vDisp * 2.4 + uTime * 0.35;
                    vec3 cAB = mix(uColorA, uColorB, 0.5 + 0.5*sin(phase));
                    vec3 cCD = mix(uColorC, uColorD, 0.5 + 0.5*sin(phase*1.3 + 1.7));
                    vec3 plasma = mix(cAB, cCD, 0.5 + 0.5*sin(phase*0.6));
                    vec3 core = mix(vec3(0.04, 0.03, 0.08), plasma, fres);
                    float hot = smoothstep(0.35, 0.85, vDisp);
                    core += plasma * hot * 0.9;
                    float strip = 0.5 + 0.5*sin(vPos.y * 80.0 + uTime * 2.0);
                    core *= mix(0.92, 1.0, strip);
                    float alpha = clamp(fres + hot*0.7 + 0.15, 0.0, 1.0);
                    gl_FragColor = vec4(core, alpha);
                }
            `,
        });
        const core = new THREE.Mesh(coreGeom, coreMat);
        scene.add(core);

        const wireGeom = new THREE.IcosahedronGeometry(1.55, 3);
        const wireMat = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: 0x22d3ff,
            transparent: true,
            opacity: 0.35,
        });
        const wire = new THREE.Mesh(wireGeom, wireMat);
        scene.add(wire);

        const PCOUNT = 1100;
        const pPos = new Float32Array(PCOUNT * 3);
        for (let i = 0; i < PCOUNT; i++) {
            const t = i / (PCOUNT - 1);
            const phi = Math.acos(1 - 2 * t);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const r = 1.85 + Math.random() * 0.7;
            pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pPos[i * 3 + 2] = r * Math.cos(phi);
        }
        const pg = new THREE.BufferGeometry();
        pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({
            size: 0.022,
            color: 0xff3df7,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const particles = new THREE.Points(pg, pMat);
        scene.add(particles);

        // drag interactivity
        let dragging = false;
        let lx = 0,
            ly = 0;
        let velX = 0,
            velY = 0;
        let rotX = -0.2,
            rotY = 0;

        const onPointerDown = (e: PointerEvent) => {
            dragging = true;
            handle.classList.add(styles.dragging);
            mount.classList.add(styles.dragging);
            lx = e.clientX;
            ly = e.clientY;
            handle.setPointerCapture(e.pointerId);
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) return;
            const dx = e.clientX - lx;
            const dy = e.clientY - ly;
            velY = dx * 0.008;
            velX = dy * 0.008;
            rotY += velY;
            rotX += velX;
            lx = e.clientX;
            ly = e.clientY;
        };
        const onStop = () => {
            dragging = false;
            handle.classList.remove(styles.dragging);
            mount.classList.remove(styles.dragging);
        };
        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onStop);
        handle.addEventListener('pointercancel', onStop);
        handle.addEventListener('pointerleave', onStop);

        const tm = { x: 0, y: 0 };
        const em = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
            tm.x = (e.clientX / window.innerWidth) * 2 - 1;
            tm.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('mousemove', onMouseMove);

        const resize = () => {
            const r = mount.getBoundingClientRect();
            renderer.setSize(r.width, r.height, false);
            renderer.domElement.style.width = `${r.width}px`;
            renderer.domElement.style.height = `${r.height}px`;
            camera.aspect = r.width / Math.max(1, r.height);
            camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(mount);

        const clock = new THREE.Clock();
        let fps = 60;
        let acc = 0,
            frames = 0;
        let raf = 0;

        const tick = () => {
            const dt = clock.getDelta();
            const t = clock.getElapsedTime();
            acc += dt;
            frames++;
            if (acc >= 0.5) {
                fps = Math.round(frames / acc);
                acc = 0;
                frames = 0;
                if (fpsRef.current) fpsRef.current.textContent = String(fps);
                if (msRef.current) msRef.current.textContent = String(Math.round(1000 / Math.max(1, fps)));
            }
            em.x += (tm.x - em.x) * Math.min(1, dt * 4);
            em.y += (tm.y - em.y) * Math.min(1, dt * 4);

            if (!dragging) {
                velY *= 0.95;
                velX *= 0.95;
                rotY += velY * 0.5;
                rotX += velX * 0.5;
                rotY += dt * 0.18;
            }
            core.rotation.y = rotY + em.x * 0.3;
            core.rotation.x = rotX + em.y * 0.2;
            wire.rotation.y = -rotY * 0.4;
            wire.rotation.x = rotX * 0.3;
            particles.rotation.y = t * 0.02;

            coreMat.uniforms.uTime.value = t;
            (coreMat.uniforms.uMouse.value as THREE.Vector2).set(em.x, em.y);
            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        };
        tick();

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener('mousemove', onMouseMove);
            handle.removeEventListener('pointerdown', onPointerDown);
            handle.removeEventListener('pointermove', onPointerMove);
            handle.removeEventListener('pointerup', onStop);
            handle.removeEventListener('pointercancel', onStop);
            handle.removeEventListener('pointerleave', onStop);
            coreGeom.dispose();
            coreMat.dispose();
            wireGeom.dispose();
            wireMat.dispose();
            pg.dispose();
            pMat.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, [fpsRef, msRef]);

    return (
        <>
            <div className={styles.three} ref={mountRef} />
            <div className={styles.dragHandle} ref={handleRef} />
        </>
    );
};

export default PlasmaHero;
