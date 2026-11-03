"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Central Geometric Integrity Prism (Icosahedron Wireframe + Points)
    const geometry = new THREE.IcosahedronGeometry(7, 2);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x3E3C37,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const prismMesh = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(prismMesh);

    // Glowing Inner Node Lattice
    const innerGeo = new THREE.IcosahedronGeometry(5, 1);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xD97757, // Terracotta Accent
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMaterial);
    scene.add(innerMesh);

    // Floating Ambient Particles (Constellation)
    const particleCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 35;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xD97757,
      size: 0.15,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 3. Mouse Tracking Interactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove);

    // 4. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera parallax
      targetX += (mouseX * 2.5 - targetX) * 0.04;
      targetY += (mouseY * 2.5 - targetY) * 0.04;

      prismMesh.rotation.x += 0.0018;
      prismMesh.rotation.y += 0.0025;
      prismMesh.position.x = targetX * 0.5;
      prismMesh.position.y = targetY * 0.5;

      innerMesh.rotation.x -= 0.0022;
      innerMesh.rotation.y -= 0.003;
      innerMesh.position.x = targetX * 0.4;
      innerMesh.position.y = targetY * 0.4;

      particles.rotation.y += 0.0006;

      renderer.render(scene, camera);
    };

    animate();

    // 5. Responsive Resize
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-75"
    />
  );
}

