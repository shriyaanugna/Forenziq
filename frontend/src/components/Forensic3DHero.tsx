import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Forensic3DHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090e, 0.02);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 28);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 3, 50);
    cyanPointLight.position.set(10, 15, 10);
    scene.add(cyanPointLight);

    const emeraldPointLight = new THREE.PointLight(0x10b981, 2, 50);
    emeraldPointLight.position.set(-10, -10, -10);
    scene.add(emeraldPointLight);

    // 5. Central Forensic Analysis Core (Wireframe Octahedron + Inner Core)
    const coreGroup = new THREE.Group();

    // Outer Octahedron
    const outerGeo = new THREE.OctahedronGeometry(5, 0);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: true,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.8
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerMesh);

    // Inner Icosahedron
    const innerGeo = new THREE.IcosahedronGeometry(2.8, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x10b981,
      emissiveIntensity: 0.5
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Core Glowing Sphere
    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    coreGroup.add(centerSphere);

    scene.add(coreGroup);

    // 6. Scanning Laser Beam Effect
    const beamGeo = new THREE.CylinderGeometry(6.5, 6.5, 0.08, 32);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const scanBeam = new THREE.Mesh(beamGeo, beamMat);
    scanBeam.rotation.x = Math.PI / 2;
    scene.add(scanBeam);

    // 7. Floating Evidence Data Particles
    const particleCount = 250;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 45;
      particlePositions[i + 1] = (Math.random() - 0.5) * 35;
      particlePositions[i + 2] = (Math.random() - 0.5) * 30;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.25,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Orbiting Satellite Nodes (Representing Evidence Types)
    const satellites: THREE.Mesh[] = [];
    const satelliteGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const satelliteMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.4
    });

    for (let i = 0; i < 4; i++) {
      const sat = new THREE.Mesh(satelliteGeo, satelliteMat);
      satellites.push(sat);
      scene.add(sat);
    }

    // Animation variables
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate core
      coreGroup.rotation.y = elapsedTime * 0.25;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15;

      innerMesh.rotation.y = -elapsedTime * 0.4;
      innerMesh.rotation.z = elapsedTime * 0.2;

      // Scanning beam up and down motion
      scanBeam.position.y = Math.sin(elapsedTime * 1.5) * 4.5;

      // Orbit satellites around core
      satellites.forEach((sat, i) => {
        const angle = elapsedTime * 0.6 + (i * Math.PI) / 2;
        const radius = 8.5;
        sat.position.x = Math.cos(angle) * radius;
        sat.position.z = Math.sin(angle) * radius;
        sat.position.y = Math.sin(elapsedTime * 2 + i) * 1.2;
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.02;
      });

      // Slowly rotate particle field
      particleSystem.rotation.y = elapsedTime * 0.03;

      // Gentle camera sway
      camera.position.x = Math.sin(elapsedTime * 0.15) * 1.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full min-h-[420px] flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl border border-cyan-500/20 p-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white tracking-wide">FORENZIQ AI Core Active</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Multi-source evidence ingestion engine operational. SHA-256 chain verification active.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-slate-950/60 to-slate-900/80 backdrop-blur-xl shadow-2xl shadow-cyan-950/30">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Status Badge Overlays */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur border border-cyan-500/30 flex items-center space-x-2 text-[11px] font-mono text-cyan-400 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>3D ENGINE ACTIVE • GROQ / GEMINI CORE</span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
        Interactive 3D Simulation
      </div>
    </div>
  );
}
