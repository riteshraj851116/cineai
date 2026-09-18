import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeCinematicParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check if canvas exists and WebGL is supported
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer;
    let animId;

    try {
      // Feature detect WebGL
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 20;

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // Create subtle floating film dust particles
      const particleCount = 75;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const speeds = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        speeds[i] = 0.005 + Math.random() * 0.015;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Subtle warm/silver particles
      const material = new THREE.PointsMaterial({
        color: 0xcccccc,
        size: 0.15,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Handle Resize
      const handleResize = () => {
        if (!canvas || !renderer) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      };

      window.addEventListener('resize', handleResize);

      // Render Loop
      const animate = () => {
        animId = requestAnimationFrame(animate);

        const pos = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3 + 1] += speeds[i];
          // Wrap around top/bottom
          if (pos[i * 3 + 1] > 12) {
            pos[i * 3 + 1] = -12;
          }
        }
        geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.0004;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animId) cancelAnimationFrame(animId);
        geometry.dispose();
        material.dispose();
        if (renderer) renderer.dispose();
      };
    } catch (e) {
      console.warn('Three.js cinematic particles initialization bypassed:', e);
    }
  }, []);

  return <canvas ref={canvasRef} className="cinema-particles-canvas" />;
};
