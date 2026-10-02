import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Lock3DHeroProps {
  compact?: boolean;
}

// Continuous smooth 3D curve for the U-shaped shackle
class ShackleCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    public radius: number = 1.35,
    public legHeight: number = 1.75
  ) {
    super();
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const legFrac = 0.35;
    const archFrac = 0.30;

    if (t < legFrac) {
      // Left leg going up from 0 to legHeight
      const p = t / legFrac;
      return optionalTarget.set(-this.radius, p * this.legHeight, 0);
    } else if (t <= legFrac + archFrac) {
      // Top arch semi-circle from PI to 0
      const p = (t - legFrac) / archFrac;
      const angle = Math.PI - p * Math.PI;
      const x = Math.cos(angle) * this.radius;
      const y = this.legHeight + Math.sin(angle) * this.radius;
      return optionalTarget.set(x, y, 0);
    } else {
      // Right leg going down from legHeight to 0
      const p = (t - legFrac - archFrac) / legFrac;
      return optionalTarget.set(this.radius, this.legHeight * (1 - p), 0);
    }
  }
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
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, compact ? 13.5 : 14.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    scene.add(ambientLight);

    // Main Key Light (Top Right White/Cyan)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(8, 12, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Soft Cyan Fill Light (Left Bottom)
    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.6);
    fillLight.position.set(-10, -4, 8);
    scene.add(fillLight);

    // Deep Blue Backlight / Rim Light
    const rimLight = new THREE.PointLight(0x2563eb, 3.5, 30);
    rimLight.position.set(0, 6, -8);
    scene.add(rimLight);

    // Surface Light Sweep
    const sweepLight = new THREE.PointLight(0x38bdf8, 1.8, 20);
    sweepLight.position.set(0, 2, 6);
    scene.add(sweepLight);

    // Root Group for Entire Lock
    const lockGroup = new THREE.Group();

    // ==========================================
    // A. THICK U-SHAPED SHACKLE (Royal Blue)
    // ==========================================
    const shackleRadius = 1.45;
    const shackleLegHeight = 2.4;
    const shackleTubeRadius = 0.48;

    const shackleCurve = new ShackleCurve(shackleRadius, shackleLegHeight);
    const shackleGeo = new THREE.TubeGeometry(shackleCurve, 64, shackleTubeRadius, 32, false);

    const shackleMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8, // Rich Royal Blue
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95
    });

    const shackleMesh = new THREE.Mesh(shackleGeo, shackleMat);
    shackleMesh.castShadow = true;
    // Position shackle so its high U-arch extends prominently above the body top
    shackleMesh.position.set(0, 0.4, 0.0);
    lockGroup.add(shackleMesh);

    // ==========================================
    // B. LOCK BODY WITH CURVED BOTTOM & BEVELS
    // ==========================================
    // Matching the reference lock silhouette:
    // Upper body width around 4.8, rounded upper corners, tapering downward to a smooth curved bottom.
    const bodyShape = new THREE.Shape();

    const topW = 2.4; // half width at top (total width = 4.8)
    const topY = 1.1;
    const midY = 0.0;
    const bottomY = -1.8;
    const topCornerR = 0.5;

    // Outer counter-clockwise shape
    bodyShape.moveTo(0, topY);
    bodyShape.lineTo(topW - topCornerR, topY);
    bodyShape.absarc(topW - topCornerR, topY - topCornerR, topCornerR, Math.PI / 2, 0, true);
    bodyShape.lineTo(topW, midY);
    bodyShape.bezierCurveTo(topW, midY - 1.0, topW * 0.55, bottomY, 0, bottomY);
    bodyShape.bezierCurveTo(-topW * 0.55, bottomY, -topW, midY - 1.0, -topW, midY);
    bodyShape.lineTo(-topW, topY - topCornerR);
    bodyShape.absarc(-topW + topCornerR, topY - topCornerR, topCornerR, Math.PI, Math.PI / 2, true);

    const bodyDepth = 0.85;
    const extrudeSettings = {
      depth: bodyDepth,
      bevelEnabled: true,
      bevelSegments: 10,
      steps: 2,
      bevelSize: 0.25,
      bevelThickness: 0.25,
    };

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeo.center(); // Center geometry around origin

    // Bright Cyan / Turquoise Glossy Material
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // Vibrant Sky Cyan / Turquoise
      emissive: 0x0369a1,
      emissiveIntensity: 0.1,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.98
    });

    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    lockGroup.add(bodyMesh);

    // ==========================================
    // C. CRISP ICE-WHITE KEYHOLE SILHOUETTE
    // ==========================================
    // Classic keyhole shape: round top head + straight tapering stem + rounded bottom
    const keyholeShape = new THREE.Shape();
    const headRadius = 0.38;
    const headCenterY = 0.22;
    const stemBottomY = -0.65;
    const stemWidth = 0.20;

    // Head circle arc
    keyholeShape.absarc(0, headCenterY, headRadius, -0.4, Math.PI + 0.4, false);
    // Right side stem line
    keyholeShape.lineTo(stemWidth, stemBottomY);
    // Stem bottom arc
    keyholeShape.absarc(0, stemBottomY, stemWidth, 0, Math.PI, true);
    // Left side stem line back to head
    const leftStartX = -headRadius * Math.cos(0.4);
    const leftStartY = headCenterY - headRadius * Math.sin(0.4);
    keyholeShape.lineTo(leftStartX, leftStartY);

    const keyholeExtrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    const keyholeGeo = new THREE.ExtrudeGeometry(keyholeShape, keyholeExtrudeSettings);
    keyholeGeo.center();

    // Clean crisp Ice-White Material with subtle emissive, avoiding washed-out bloom
    const keyholeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xbae6fd,
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.1,
    });

    const keyholeMesh = new THREE.Mesh(keyholeGeo, keyholeMat);
    // Position keyhole exactly on the front face of the lock body
    const frontZ = bodyDepth / 2 + 0.25;
    keyholeMesh.position.set(0, -0.25, frontZ + 0.02);
    lockGroup.add(keyholeMesh);

    // Center lock group vertically
    lockGroup.position.set(0, -0.1, 0);
    scene.add(lockGroup);

    // ==========================================
    // D. BACKGROUND DIGITAL SECURITY PARTICLES
    // ==========================================
    const particleCount = compact ? 70 : 140;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 28;
      particlePositions[i + 1] = (Math.random() - 0.5) * 22;
      particlePositions[i + 2] = (Math.random() - 0.5) * 18;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.45
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

      // Gentle vertical floating motion
      lockGroup.position.y = -0.1 + Math.sin(elapsedTime * 1.4) * 0.24;

      // Controlled, smooth Y-axis oscillation (~16 degrees rotation left and right)
      lockGroup.rotation.y = Math.sin(elapsedTime * 0.65) * 0.28;

      // Subtle fixed X-axis tilt to display top bevels and 3D volume
      lockGroup.rotation.x = 0.06 + Math.sin(elapsedTime * 0.4) * 0.03;

      // Light sweep movement across surfaces
      sweepLight.position.x = Math.sin(elapsedTime * 1.1) * 7;
      sweepLight.position.y = Math.cos(elapsedTime * 0.7) * 3 + 1;

      // Slow particle field drift
      particleSystem.rotation.y = elapsedTime * 0.03;

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

      {/* Ambient Radial Highlight */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-cyan-500/10 via-transparent to-transparent opacity-60" />

      {/* Floating Status Badge */}
      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur border border-cyan-500/30 flex items-center space-x-2 text-[10px] font-mono text-cyan-400 shadow-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>3D LOCK ENGINE • ACTIVE</span>
      </div>
    </div>
  );
}
