import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Lock3DHeroProps {
  compact?: boolean;
}

export default function Lock3DHero({ compact = false }: Lock3DHeroProps) {
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

    // 1. Scene & Environment setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, compact ? 15 : 18);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lighting setup (Studio Key, Fill, and Rim lights)
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.2);
    scene.add(ambientLight);

    // Studio Key Light (Top Right Cyan/White)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(10, 15, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Soft Cyan Fill Light
    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.8);
    fillLight.position.set(-12, -5, 10);
    scene.add(fillLight);

    // Blue Rim Light (Backlight)
    const rimLight = new THREE.PointLight(0x3b82f6, 3, 30);
    rimLight.position.set(0, 8, -10);
    scene.add(rimLight);

    // Light Sweep Point Light
    const sweepLight = new THREE.PointLight(0x38bdf8, 2.5, 25);
    sweepLight.position.set(0, 2, 8);
    scene.add(sweepLight);

    // Keyhole Point Light (Soft Volumetric Glow)
    const keyholeGlowLight = new THREE.PointLight(0x38bdf8, 2, 8);
    keyholeGlowLight.position.set(0, -0.6, 1.8);
    scene.add(keyholeGlowLight);

    // Root Group for Lock
    const lockGroup = new THREE.Group();

    // ==========================================
    // A. ROUNDED SHACKLE (Royal Blue)
    // ==========================================
    const shackleRadius = 2.1;
    const shackleTube = 0.55;
    const shackleLegHeight = 1.6;

    const shackleGroup = new THREE.Group();

    // Top Arc of Shackle (Half Torus)
    const topArcGeo = new THREE.TorusGeometry(shackleRadius, shackleTube, 32, 64, Math.PI);
    const shackleMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8, // Royal Blue matching reference image
      roughness: 0.18,
      metalness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });
    const topArcMesh = new THREE.Mesh(topArcGeo, shackleMat);
    topArcMesh.rotation.z = Math.PI; // Arch pointing upwards
    topArcMesh.position.y = shackleLegHeight;
    shackleGroup.add(topArcMesh);

    // Left Leg of Shackle
    const legGeo = new THREE.CylinderGeometry(shackleTube, shackleTube, shackleLegHeight, 32);
    const leftLegMesh = new THREE.Mesh(legGeo, shackleMat);
    leftLegMesh.position.set(-shackleRadius, shackleLegHeight / 2, 0);
    shackleGroup.add(leftLegMesh);

    // Right Leg of Shackle
    const rightLegMesh = new THREE.Mesh(legGeo, shackleMat);
    rightLegMesh.position.set(shackleRadius, shackleLegHeight / 2, 0);
    shackleGroup.add(rightLegMesh);

    shackleGroup.position.y = 1.3;
    lockGroup.add(shackleGroup);

    // ==========================================
    // B. WIDE CYAN & TURQUOISE LOCK BODY
    // ==========================================
    // Construct rounded rectangular body shape with curved bottom corners
    const bodyWidth = 6.2;
    const bodyHeight = 4.6;
    const bodyDepth = 1.6;
    const cornerRadius = 1.2;

    const shape = new THREE.Shape();
    const x = -bodyWidth / 2;
    const y = -bodyHeight / 2;

    // Start top-left
    shape.moveTo(x + cornerRadius, y + bodyHeight);
    // Top line
    shape.lineTo(x + bodyWidth - cornerRadius, y + bodyHeight);
    // Top-right corner
    shape.absarc(x + bodyWidth - cornerRadius, y + bodyHeight - cornerRadius, cornerRadius, Math.PI / 2, 0, true);
    // Right line
    shape.lineTo(x + bodyWidth, y + cornerRadius);
    // Bottom-right rounded corner
    shape.absarc(x + bodyWidth - cornerRadius, y + cornerRadius, cornerRadius, 0, -Math.PI / 2, true);
    // Bottom line
    shape.lineTo(x + cornerRadius, y);
    // Bottom-left rounded corner
    shape.absarc(x + cornerRadius, y + cornerRadius, cornerRadius, -Math.PI / 2, -Math.PI, true);
    // Left line
    shape.lineTo(x, y + bodyHeight - cornerRadius);
    // Top-left corner
    shape.absarc(x + cornerRadius, y + bodyHeight - cornerRadius, cornerRadius, Math.PI, Math.PI / 2, true);

    const extrudeSettings = {
      depth: bodyDepth,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.35,
      bevelThickness: 0.35,
    };

    const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeo.center(); // Center geometry around origin

    // Cyan / Turquoise Glossy Material matching reference image
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9, // Bright cyan/turquoise
      emissive: 0x0284c7,
      emissiveIntensity: 0.1,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transmission: 0.05, // Subtle volumetric glass effect
      ior: 1.4,
      reflectivity: 0.95
    });

    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    lockGroup.add(bodyMesh);

    // ==========================================
    // C. CENTERED KEYHOLE WITH SOFT GLOW
    // ==========================================
    const keyholeGroup = new THREE.Group();

    // Top Circle of Keyhole
    const keyCircleGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.2, 32);
    const keyholeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.0
    });

    const keyCircle = new THREE.Mesh(keyCircleGeo, keyholeMat);
    keyCircle.rotation.x = Math.PI / 2;
    keyCircle.position.set(0, 0.25, bodyDepth / 2 + 0.18);
    keyholeGroup.add(keyCircle);

    // Bottom Slot/Trapezoid of Keyhole
    const keySlotGeo = new THREE.CylinderGeometry(0.32, 0.48, 0.75, 32);
    const keySlot = new THREE.Mesh(keySlotGeo, keyholeMat);
    keySlot.rotation.x = Math.PI / 2;
    keySlot.position.set(0, -0.3, bodyDepth / 2 + 0.18);
    keyholeGroup.add(keySlot);

    // Dark Inner Keyhole Inset (Depth effect)
    const keyholeBackMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const keyBackCircle = new THREE.Mesh(keyCircleGeo, keyholeBackMat);
    keyBackCircle.rotation.x = Math.PI / 2;
    keyBackCircle.position.set(0, 0.25, bodyDepth / 2 + 0.05);
    keyholeGroup.add(keyBackCircle);

    const keyBackSlot = new THREE.Mesh(keySlotGeo, keyholeBackMat);
    keyBackSlot.rotation.x = Math.PI / 2;
    keyBackSlot.position.set(0, -0.3, bodyDepth / 2 + 0.05);
    keyholeGroup.add(keyBackSlot);

    keyholeGroup.position.y = -0.2;
    lockGroup.add(keyholeGroup);

    // Position Lock Group centered in scene
    lockGroup.position.set(0, -0.4, 0);
    scene.add(lockGroup);

    // ==========================================
    // D. AMBIENT PARTICLES (Security Grid)
    // ==========================================
    const particleCount = compact ? 80 : 160;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 30;
      particlePositions[i + 1] = (Math.random() - 0.5) * 24;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.2,
      transparent: true,
      opacity: 0.5
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ==========================================
    // E. ANIMATION LOOP
    // ==========================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating / hovering motion
      lockGroup.position.y = -0.4 + Math.sin(elapsedTime * 1.5) * 0.35;

      // Controlled, slow rotation to reveal 3D depth smoothly
      lockGroup.rotation.y = Math.sin(elapsedTime * 0.7) * 0.38; // ~22 degrees left and right
      lockGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08; // Subtle tilt up/down

      // Light sweep across lock body surface
      sweepLight.position.x = Math.sin(elapsedTime * 1.2) * 8;
      sweepLight.position.y = Math.cos(elapsedTime * 0.8) * 4 + 2;

      // Soft pulsating keyhole glow
      keyholeGlowLight.intensity = 1.8 + Math.sin(elapsedTime * 2.5) * 0.6;

      // Rotate particle backdrop
      particleSystem.rotation.y = elapsedTime * 0.04;

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
  }, [compact]);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center bg-slate-900/80 rounded-2xl border border-cyan-500/20 p-8 text-center space-y-3">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-white tracking-wide">FORENZIQ Security Shield</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Multi-source forensic verification active. SHA-256 evidence protection enabled.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${compact ? 'min-h-[300px]' : 'min-h-[420px]'} rounded-2xl overflow-hidden`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Ambient Lighting Overlay Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-cyan-500/10 via-transparent to-transparent opacity-60" />

      {/* Floating Status Badge */}
      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur border border-cyan-500/30 flex items-center space-x-2 text-[10px] font-mono text-cyan-400 shadow-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>3D LOCK ENGINE • ACTIVE</span>
      </div>
    </div>
  );
}
