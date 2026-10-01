import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const GalaxyBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP SCENE, CAMERA, RENDERER ---
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#030712", 0.05);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    // Position the camera slightly tilted to look down on the galaxy
    camera.position.set(0, 4, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // --- GALAXY PARAMETERS ---
    const parameters = {
      count: 128 ** 2, // 16,384 particles
      size: 15.0,
      radius: 7.0,
      branches: 3,
      spin: 1.5,
      randomness: 0.5,
      randomnessPower: 4.0,
      insideColor: "#FF521B",  // Radiant Thermodynamic Heat Orange
      outsideColor: "#00C2FF", // Deep Atmospheric Space Cyan
    };

    // --- GEOMETRY AND ATTRIBUTES ---
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count);
    const randomnessArray = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      // Position along the branch
      const i3 = i * 3;
      const radius = Math.random() * parameters.radius;
      
      // More particles close to the center for a dense hot core
      const distributionRadius = Math.pow(Math.random(), 2.0) * parameters.radius;

      const spinAngle = distributionRadius * parameters.spin;
      const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      // Randomness spread gets slightly wider as we move outward, or follows power law
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * (distributionRadius + 0.2);
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * (distributionRadius + 0.2);
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * (distributionRadius + 0.2);

      positions[i3] = Math.cos(branchAngle + spinAngle) * distributionRadius;
      positions[i3 + 1] = 0; // Baseline height is 0, randomness handles height spread
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * distributionRadius;

      randomnessArray[i3] = randomX;
      randomnessArray[i3 + 1] = randomY;
      randomnessArray[i3 + 2] = randomZ;

      // Mix colors based on center distance
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, distributionRadius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Individual scales
      scales[i] = Math.random() * 0.8 + 0.2;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute("aRandomness", new THREE.BufferAttribute(randomnessArray, 3));

    // --- SHADERS ---
    const vertexShader = `
      uniform float uTime;
      uniform float uSize;

      attribute float aScale;
      attribute vec3 aRandomness;

      varying vec3 vColor;

      void main() {
        /**
         * Position
         */
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        // Calculate slow spiral spin rotation over time
        float angle = atan(modelPosition.x, modelPosition.z);
        float distanceToCenter = length(modelPosition.xz);
        
        // Spin speed decreases as particles move further from core
        float angleOffset = (1.0 / max(distanceToCenter, 0.2)) * uTime * 0.12;
        angle += angleOffset;
        
        modelPosition.x = cos(angle) * distanceToCenter;
        modelPosition.z = sin(angle) * distanceToCenter;

        // Apply randomness
        modelPosition.xyz += aRandomness;

        // Subtle slow vertical wave overlay
        modelPosition.y += sin(uTime * 0.3 + distanceToCenter * 0.8) * 0.15;

        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectionPosition = projectionMatrix * viewPosition;
        gl_Position = projectionPosition;

        /**
         * Size
         */
        gl_PointSize = uSize * aScale;
        gl_PointSize *= (1.0 / -viewPosition.z); // Perspective attenuation

        /**
         * Color
         */
        vColor = color;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;

      void main() {
        // Glowing circular particle design (bright core, smooth fade-out)
        float strength = distance(gl_PointCoord, vec2(0.5));
        strength = 1.0 - strength;
        strength = pow(strength, 6.0);

        vec3 finalColor = mix(vec3(0.0), vColor, strength);

        // Boost core brightness slightly to feel intensely self-luminous
        finalColor += vec3(strength * 0.15);

        gl_FragColor = vec4(finalColor, strength);
      }
    `;

    const material = new THREE.ShaderMaterial({
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: parameters.size * renderer.getPixelRatio() },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    });

    // --- CREATE POINTS ---
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- INTERACTIVE MOUSE PARALLAX ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse positions between -1 and 1
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update shader time uniform
      material.uniforms.uTime.value = elapsedTime;

      // Gentle continuous rotation of the entire galaxy
      points.rotation.y = elapsedTime * 0.015;

      // Smooth camera interpolation based on mouse movement
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.3;

      // Lag the camera tilt slightly for a smooth, high-end organic feel
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (4 + targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      material.uniforms.uSize.value = parameters.size * renderer.getPixelRatio();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", handleResize);

    // --- CLEANUP ---
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(containerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      id="galaxy-background-container"
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
};
