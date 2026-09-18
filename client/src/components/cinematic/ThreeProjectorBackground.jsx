import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const ThreeProjectorBackground = () => {
  const mountRef = useRef(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    // 1. Check WebGL support & reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setWebGLSupported(false);
      return;
    }

    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    };

    if (!checkWebGL()) {
      setWebGLSupported(false);
      return;
    }

    const currentMount = mountRef.current;
    if (!currentMount) return;

    let scene, camera, renderer, particles, animationFrameId;

    try {
      const width = currentMount.clientWidth || window.innerWidth;
      const height = currentMount.clientHeight || window.innerHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.z = 80;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      currentMount.appendChild(renderer.domElement);

      // Create floating cinema dust particles reflecting projector light
      const particleCount = 140;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorCyan = new THREE.Color('#00F0FF');
      const colorGold = new THREE.Color('#F59E0B');

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 160;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

        const mixedColor = Math.random() > 0.4 ? colorCyan : colorGold;
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        particles.rotation.y += 0.0008;
        particles.rotation.x += 0.0004;
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!currentMount) return;
        const w = currentMount.clientWidth || window.innerWidth;
        const h = currentMount.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (currentMount && renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    } catch (err) {
      console.warn('[Three.js] Fallback triggered:', err.message);
      setWebGLSupported(false);
    }
  }, []);

  if (!webGLSupported) {
    // Pure CSS High-End Projector Fallback
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 60% 30%, rgba(0, 240, 255, 0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <div
      ref={mountRef}
      className="three-canvas-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
};
