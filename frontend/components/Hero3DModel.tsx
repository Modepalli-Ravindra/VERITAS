"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Rotate3D, Sparkles } from "lucide-react";

export default function Hero3DModel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 21;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0x2A2421, 2.5);
    scene.add(ambientLight);

    // Key Light (Warm Terracotta Accent)
    const keyLight = new THREE.DirectionalLight(0xD97757, 4.0);
    keyLight.position.set(12, 16, 14);
    scene.add(keyLight);

    // Fill Rim Light (Soft Moonlight / Titanium)
    const fillLight = new THREE.DirectionalLight(0xECE8E1, 2.0);
    fillLight.position.set(-14, -10, -10);
    scene.add(fillLight);

    // Core Point Light
    const corePointLight = new THREE.PointLight(0xE28768, 3.0, 30);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // 3. Central Model Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Inner Glowing Core (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(2.2, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xD97757,
      emissive: 0xB85739,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.6,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // Faceted Crystal Shell (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(4.0, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x36342F,
      roughness: 0.25,
      metalness: 0.85,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    rootGroup.add(crystalMesh);

    // Outer Geometric Cage (Fine Wireframe Lattice)
    const wireGeo = new THREE.IcosahedronGeometry(4.8, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xD97757,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    rootGroup.add(wireMesh);

    // Gyroscopic Orbital Ring 1
    const ring1Geo = new THREE.TorusGeometry(6.6, 0.08, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xC86A4B,
      metalness: 0.9,
      roughness: 0.15,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    rootGroup.add(ring1);

    // Gyroscopic Orbital Ring 2 (Orthogonal counter-ring)
    const ring2Geo = new THREE.TorusGeometry(8.0, 0.06, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x6E6B65,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    rootGroup.add(ring2);

    // Orbiting Satellite Node
    const satGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const satMat = new THREE.MeshBasicMaterial({ color: 0xECE8E1 });
    const satMesh = new THREE.Mesh(satGeo, satMat);
    ring1.add(satMesh);
    satMesh.position.set(6.6, 0, 0);

    // Ambient Constellation Dust Particles
    const particleCount = 200;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 36;
      particlePositions[i + 1] = (Math.random() - 0.5) * 28;
      particlePositions[i + 2] = (Math.random() - 0.5) * 24;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xD97757,
      size: 0.12,
      transparent: true,
      opacity: 0.45,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // 4. Mouse Tracking & Free Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotSpeedX = 0;
    let rotSpeedY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      setIsInteracting(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        rotSpeedY = deltaX * 0.006;
        rotSpeedX = deltaY * 0.006;
        rootGroup.rotation.y += rotSpeedY;
        rootGroup.rotation.x += rotSpeedX;
        prevMouseX = clientX;
        prevMouseY = clientY;
      }

      // Parallax effect
      const rect = mount.getBoundingClientRect();
      const relX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const relY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetParallaxX = relX * 1.5;
      targetParallaxY = relY * 1.5;
    };

    const onPointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    const dom = renderer.domElement;
    dom.style.cursor = "grab";
    dom.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Continuous harmonic auto-rotation when not dragging
      if (!isDragging) {
        rootGroup.rotation.y += 0.004;
        rootGroup.rotation.x += 0.0018;
      } else {
        // Inertia damping
        rotSpeedX *= 0.94;
        rotSpeedY *= 0.94;
        rootGroup.rotation.x += rotSpeedX;
        rootGroup.rotation.y += rotSpeedY;
      }

      // Inner and outer differential spins
      coreMesh.rotation.y = -time * 0.4;
      coreMesh.rotation.z = time * 0.2;

      wireMesh.rotation.y = time * 0.15;
      wireMesh.rotation.x = -time * 0.1;

      ring1.rotation.z = time * 0.35;
      ring2.rotation.z = -time * 0.25;

      // Gentle breathing scale on the crystal
      const breathe = 1 + Math.sin(time * 1.5) * 0.025;
      crystalMesh.scale.set(breathe, breathe, breathe);

      // Subtle parallax camera lag
      camera.position.x += (targetParallaxX - camera.position.x) * 0.05;
      camera.position.y += (targetParallaxY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Particle subtle orbital drift
      particleField.rotation.y = time * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize handling
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", onResize);

    return () => {
      dom.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      dom.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[500px] rounded-2xl bg-[#0E4745] border border-[#1A6360] overflow-hidden flex items-center justify-center group shadow-2xl">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Interactive Instruction Pill */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B3D3B] border border-[#1A6360] text-[11px] font-mono text-[#8AC7C2] pointer-events-none transition-opacity">
        <Rotate3D className="w-3.5 h-3.5 text-claude-primary" />
        <span>Drag to rotate 3D core</span>
      </div>

      {/* Subtle Corner Pedestal Accent */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[11px] font-mono text-[#6E6B65] pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-claude-primary"></span>
        <span>VERITAS Crystalline Model</span>
      </div>
    </div>
  );
}

