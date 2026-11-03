"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function LiveHero3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let animationFrameId: number;
    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090604); // Pure luxury deep espresso black

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);

    // Root 3D world group
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Depth-separated groups for authentic 3D GSAP parallax
    const silkGroup = new THREE.Group();
    silkGroup.position.z = -0.4;
    worldGroup.add(silkGroup);

    const rubyGroup = new THREE.Group();
    rubyGroup.position.z = 0.2;
    worldGroup.add(rubyGroup);

    const goldGroup = new THREE.Group();
    goldGroup.position.z = 0.6;
    worldGroup.add(goldGroup);

    // 2. High-End Studio Lighting (Warm Gold & Ruby Accents)
    const ambientLight = new THREE.AmbientLight(0x22140c, 2.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff2e2, 2.0);
    dirLight.position.set(0, 5, 6);
    scene.add(dirLight);

    // Point lights for specular silk reflections
    const pLightTL = new THREE.PointLight(0xe4bd78, 3.5, 14);
    pLightTL.position.set(-4.5, 2.8, 3.0);
    scene.add(pLightTL);

    const pLightTR = new THREE.PointLight(0xc49a58, 2.8, 14);
    pLightTR.position.set(4.5, 2.8, 3.0);
    scene.add(pLightTR);

    const pLightBL = new THREE.PointLight(0xe4bd78, 3.2, 16);
    pLightBL.position.set(-2.5, -2.6, 3.0);
    scene.add(pLightBL);

    const pLightBR = new THREE.PointLight(0xff3b30, 4.0, 16);
    pLightBR.position.set(3.8, -2.2, 3.2);
    scene.add(pLightBR);

    // 3. Ultra-Smooth Mathematical Ribbon Generator
    // Guaranteed ZERO twists, ZERO kinks, with 2D in-plane normal extrusions
    function createPlanarRibbon(
      points: THREE.Vector2[],
      width: number,
      segments: number = 140,
      zOffset: number = 0,
      isTapered: boolean = true
    ) {
      const curve = new THREE.SplineCurve(points);
      const pts = curve.getPoints(segments);
      const positions: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const pt = pts[i];

        let tangent: THREE.Vector2;
        if (i === 0) {
          tangent = new THREE.Vector2().subVectors(pts[1], pts[0]).normalize();
        } else if (i === segments) {
          tangent = new THREE.Vector2().subVectors(pts[segments], pts[segments - 1]).normalize();
        } else {
          tangent = new THREE.Vector2().subVectors(pts[i + 1], pts[i - 1]).normalize();
        }

        // Uniquely defined in-plane perpendicular unit normal (-ty, tx)
        const normal = new THREE.Vector2(-tangent.y, tangent.x);

        const taper = isTapered ? Math.sin(u * Math.PI) : 1.0;
        const halfW = (width * 0.5) * (0.4 + 0.6 * taper);

        positions.push(pt.x - normal.x * halfW, pt.y - normal.y * halfW, zOffset);
        positions.push(pt.x + normal.x * halfW, pt.y + normal.y * halfW, zOffset);

        uvs.push(u, 0);
        uvs.push(u, 1);

        if (i < segments) {
          const base = i * 2;
          indices.push(base, base + 1, base + 2);
          indices.push(base + 1, base + 3, base + 2);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    }

    // 4. Materials
    // A. Dark Bronze Silk Plane Material (Deep, satiny clearcoat)
    const bronzeSilkMat = new THREE.MeshPhysicalMaterial({
      color: 0x24140b,
      emissive: 0x0a0503,
      metalness: 0.88,
      roughness: 0.32,
      clearcoat: 0.85,
      clearcoatRoughness: 0.22,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });

    const mochaSilkMat = new THREE.MeshPhysicalMaterial({
      color: 0x180d07,
      emissive: 0x080402,
      metalness: 0.85,
      roughness: 0.38,
      clearcoat: 0.65,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });

    // B. Luminous Gold Filament Materials (Multi-tier bloom)
    const goldMatHalo = new THREE.MeshBasicMaterial({
      color: 0xe4bd78,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const goldMatMid = new THREE.MeshBasicMaterial({
      color: 0xfff0d0,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const goldMatCore = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    // C. Radiant Ruby Filament Materials (Multi-tier bloom)
    const rubyMatHalo = new THREE.MeshBasicMaterial({
      color: 0xff281e,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const rubyMatMid = new THREE.MeshBasicMaterial({
      color: 0xff9085,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const rubyMatCore = new THREE.MeshBasicMaterial({
      color: 0xfff0f0,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    // Helper to build a complete multi-tier glowing ribbon
    function addGlowingRibbon(
      targetGroup: THREE.Group,
      points: THREE.Vector2[],
      haloMat: THREE.Material,
      midMat: THREE.Material,
      coreMat: THREE.Material,
      haloWidth: number,
      midWidth: number,
      coreWidth: number
    ) {
      const gHalo = createPlanarRibbon(points, haloWidth, 140, 0.0);
      const mHalo = new THREE.Mesh(gHalo, haloMat);
      targetGroup.add(mHalo);

      const gMid = createPlanarRibbon(points, midWidth, 140, 0.02);
      const mMid = new THREE.Mesh(gMid, midMat);
      targetGroup.add(mMid);

      const gCore = createPlanarRibbon(points, coreWidth, 140, 0.04);
      const mCore = new THREE.Mesh(gCore, coreMat);
      targetGroup.add(mCore);
    }

    // ========================================================
    // 5. FOUR-CORNER & EDGE GEOMETRY (EXACT MATHEMATICAL HARMONY)
    // ========================================================

    // --------------------------------------------------------
    // CORNER 1: TOP-LEFT
    // --------------------------------------------------------
    // Silk Wave Shape
    const tlShape = new THREE.Shape();
    tlShape.moveTo(-5.8, 3.4);
    tlShape.lineTo(-2.2, 3.4);
    tlShape.bezierCurveTo(-3.2, 2.5, -4.4, 2.0, -5.8, 1.65);
    tlShape.closePath();
    const tlSilkMesh = new THREE.Mesh(new THREE.ShapeGeometry(tlShape, 48), bronzeSilkMat);
    silkGroup.add(tlSilkMesh);

    // Glowing Gold Top-Left Ribbon
    const tlGoldPoints = [
      new THREE.Vector2(-2.2, 3.2),
      new THREE.Vector2(-3.3, 2.45),
      new THREE.Vector2(-4.4, 1.95),
      new THREE.Vector2(-5.8, 1.68),
    ];
    addGlowingRibbon(goldGroup, tlGoldPoints, goldMatHalo, goldMatMid, goldMatCore, 0.20, 0.065, 0.020);

    // Glowing Ruby Under-Fold Ribbon (nestled in top-left)
    const tlRubyPoints = [
      new THREE.Vector2(-5.8, 1.35),
      new THREE.Vector2(-4.6, 0.95),
      new THREE.Vector2(-4.4, 0.15),
      new THREE.Vector2(-4.9, -0.65),
      new THREE.Vector2(-5.8, -1.05),
    ];
    addGlowingRibbon(rubyGroup, tlRubyPoints, rubyMatHalo, rubyMatMid, rubyMatCore, 0.22, 0.075, 0.022);

    // --------------------------------------------------------
    // CORNER 2: TOP-RIGHT (100% Equal Geometric Counterpart to Top-Left)
    // --------------------------------------------------------
    // Symmetrical Silk Wave Shape
    const trShape = new THREE.Shape();
    trShape.moveTo(5.8, 3.4);
    trShape.lineTo(2.2, 3.4);
    trShape.bezierCurveTo(3.2, 2.5, 4.4, 2.0, 5.8, 1.65);
    trShape.closePath();
    const trSilkMesh = new THREE.Mesh(new THREE.ShapeGeometry(trShape, 48), bronzeSilkMat);
    silkGroup.add(trSilkMesh);

    // Symmetrical Glowing Gold Top-Right Ribbon
    const trGoldPoints = [
      new THREE.Vector2(2.2, 3.2),
      new THREE.Vector2(3.3, 2.45),
      new THREE.Vector2(4.4, 1.95),
      new THREE.Vector2(5.8, 1.68),
    ];
    addGlowingRibbon(goldGroup, trGoldPoints, goldMatHalo, goldMatMid, goldMatCore, 0.20, 0.065, 0.020);

    // Symmetrical Glowing Ruby/Mocha Under-Fold Ribbon
    const trRubyPoints = [
      new THREE.Vector2(5.8, 1.35),
      new THREE.Vector2(4.6, 0.95),
      new THREE.Vector2(4.4, 0.15),
      new THREE.Vector2(4.9, -0.65),
      new THREE.Vector2(5.8, -1.05),
    ];
    addGlowingRibbon(rubyGroup, trRubyPoints, rubyMatHalo, rubyMatMid, rubyMatCore, 0.20, 0.070, 0.020);

    // --------------------------------------------------------
    // CORNER 3: BOTTOM-LEFT & BOTTOM HORIZON SWEEP
    // --------------------------------------------------------
    // Bottom-Left Silk Plane
    const blShape = new THREE.Shape();
    blShape.moveTo(-5.8, -3.4);
    blShape.lineTo(0.0, -3.4);
    blShape.lineTo(0.0, -2.52);
    blShape.bezierCurveTo(-1.8, -2.55, -3.8, -2.15, -5.8, -1.35);
    blShape.closePath();
    const blSilkMesh = new THREE.Mesh(new THREE.ShapeGeometry(blShape, 48), mochaSilkMat);
    silkGroup.add(blSilkMesh);

    // Continuous Flowing Liquid Gold Horizon Ribbon
    const blGoldPoints = [
      new THREE.Vector2(-5.8, -1.35),
      new THREE.Vector2(-4.0, -2.15),
      new THREE.Vector2(-2.0, -2.55),
      new THREE.Vector2(0.0, -2.52),
      new THREE.Vector2(2.0, -2.25),
      new THREE.Vector2(4.0, -1.70),
      new THREE.Vector2(5.8, -0.95),
    ];
    addGlowingRibbon(goldGroup, blGoldPoints, goldMatHalo, goldMatMid, goldMatCore, 0.22, 0.075, 0.022);

    // --------------------------------------------------------
    // CORNER 4: BOTTOM-RIGHT (100% Equal Geometric Depth & Flame Sweep)
    // --------------------------------------------------------
    // Bottom-Right Silk Plane
    const brShape = new THREE.Shape();
    brShape.moveTo(5.8, -3.4);
    brShape.lineTo(0.0, -3.4);
    brShape.lineTo(0.0, -2.52);
    brShape.bezierCurveTo(1.8, -2.55, 3.8, -2.15, 5.8, -1.35);
    brShape.closePath();
    const brSilkMesh = new THREE.Mesh(new THREE.ShapeGeometry(brShape, 48), bronzeSilkMat);
    silkGroup.add(brSilkMesh);

    // Radiant Glowing Ruby Flame Ribbon
    const brRubyPoints = [
      new THREE.Vector2(5.8, -0.90),
      new THREE.Vector2(4.2, -1.70),
      new THREE.Vector2(2.2, -2.35),
      new THREE.Vector2(0.2, -2.58),
      new THREE.Vector2(-1.8, -2.48),
      new THREE.Vector2(-3.8, -2.00),
      new THREE.Vector2(-5.8, -1.20),
    ];
    addGlowingRibbon(rubyGroup, brRubyPoints, rubyMatHalo, rubyMatMid, rubyMatCore, 0.24, 0.080, 0.024);

    // 6. Interactive GSAP Mouse Parallax with Multi-Layer Differential Depth
    let normX = 0;
    let normY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      normX = (e.clientX / window.innerWidth) * 2 - 1;
      normY = -(e.clientY / window.innerHeight) * 2 + 1;

      // 1. Camera Tilt & Pan
      gsap.to(camera.position, {
        x: normX * 0.25,
        y: normY * 0.18,
        duration: 1.4,
        ease: "power2.out",
        overwrite: "auto",
      });

      // 2. Global World 3D Rotation
      gsap.to(worldGroup.rotation, {
        x: -normY * 0.035,
        y: normX * 0.045,
        duration: 1.4,
        ease: "power2.out",
        overwrite: "auto",
      });

      // 3. Multi-Layer Differential Parallax (True 3D Depth)
      gsap.to(silkGroup.position, {
        x: normX * 0.03,
        y: normY * 0.02,
        duration: 1.5,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(rubyGroup.position, {
        x: normX * 0.06,
        y: normY * 0.045,
        duration: 1.3,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(goldGroup.position, {
        x: normX * 0.09,
        y: normY * 0.07,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 7. Responsive Aspect Scaling (Corners pinned to viewport borders on any screen)
    const updateGeometryScale = () => {
      if (!mount) return;
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;

      const currentAspect = width / height;
      camera.aspect = currentAspect;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Standard desktop design target: aspect ~ 1.777 (16:9)
      const targetAspect = 16 / 9;
      if (currentAspect >= targetAspect) {
        // Ultra-wide display: stretch X so corners embrace outer edges
        worldGroup.scale.set(currentAspect / targetAspect, 1, 1);
        camera.position.z = 7.0;
      } else {
        // Tablet / Mobile / Portrait: pull camera back slightly so central void remains wide open
        const factor = targetAspect / currentAspect;
        worldGroup.scale.set(1, 1, 1);
        camera.position.z = 7.0 + (factor - 1) * 2.5;
      }
    };

    updateGeometryScale();
    window.addEventListener("resize", updateGeometryScale);

    // 8. Continuous Subtle Breathing & Shimmer Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Gentle organic breathing undulation
      worldGroup.position.y = Math.sin(elapsedTime * 0.45) * 0.03;
      worldGroup.position.x = Math.cos(elapsedTime * 0.35) * 0.02;

      // Soft living pulse on light halos
      goldMatHalo.opacity = 0.38 + Math.sin(elapsedTime * 1.6) * 0.08;
      rubyMatHalo.opacity = 0.42 + Math.cos(elapsedTime * 1.3) * 0.09;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup on Unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateGeometryScale);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ background: "#090604" }}
    />
  );
}
