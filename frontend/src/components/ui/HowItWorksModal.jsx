import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { X, ShieldCheck, ArrowDown, Sparkles, Check, CheckCircle2, ChevronRight } from 'lucide-react';
import * as THREE from 'three';

// ─────────────────────────────────────────────
// 3D Canvas — Vanilla Three.js jacket renderer
// ─────────────────────────────────────────────
const ThreeJacketCanvas = ({ smoothProgress }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Groups
    const rootGroup = new THREE.Group();
    const jacketGroup = new THREE.Group();
    rootGroup.add(jacketGroup);
    scene.add(rootGroup);

    // Materials
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x141414, roughness: 0.25, metalness: 0.85, side: THREE.DoubleSide
    });
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xE8FF00, wireframe: true, transparent: true, opacity: 0.15
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd, roughness: 0.1, metalness: 0.95
    });
    const zipperMat = new THREE.MeshStandardMaterial({
      color: 0xE8FF00, roughness: 0.2, metalness: 0.9
    });

    const createDualMesh = (geometry, parent, scaleMult = 1.03) => {
      const solidMesh = new THREE.Mesh(geometry, leatherMat);
      parent.add(solidMesh);
      const wireMesh = new THREE.Mesh(geometry, wireframeMat);
      wireMesh.scale.multiplyScalar(scaleMult);
      parent.add(wireMesh);
      return { solidMesh, wireMesh };
    };

    // ── Jacket body ──────────────────────────────
    const bodyGroup = new THREE.Group();
    jacketGroup.add(bodyGroup);

    const bodyGeom = new THREE.CylinderGeometry(0.58, 0.46, 1.35, 20);
    const bodyMeshGroup = new THREE.Group();
    bodyMeshGroup.scale.set(1.15, 1.0, 0.46);
    bodyGroup.add(bodyMeshGroup);
    createDualMesh(bodyGeom, bodyMeshGroup);

    const shoulderGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const leftShoulder = new THREE.Mesh(shoulderGeom, leatherMat);
    leftShoulder.position.set(-0.64, 0.52, 0.02);
    leftShoulder.scale.set(1.0, 1.0, 0.85);
    bodyGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeom, leatherMat);
    rightShoulder.position.set(0.64, 0.52, 0.02);
    rightShoulder.scale.set(1.0, 1.0, 0.85);
    bodyGroup.add(rightShoulder);

    // ── Left sleeve ──────────────────────────────
    const leftSleevePivot = new THREE.Group();
    leftSleevePivot.position.set(-0.64, 0.52, 0.02);
    jacketGroup.add(leftSleevePivot);

    const upperArmGeom = new THREE.CylinderGeometry(0.14, 0.12, 0.55, 12);
    const leftUpperArmGroup = new THREE.Group();
    leftUpperArmGroup.position.set(0, -0.275, 0);
    leftUpperArmGroup.scale.set(1.0, 1.0, 0.8);
    leftSleevePivot.add(leftUpperArmGroup);
    createDualMesh(upperArmGeom, leftUpperArmGroup);

    const elbowGeom = new THREE.SphereGeometry(0.11, 12, 12);
    const leftElbow = new THREE.Mesh(elbowGeom, leatherMat);
    leftElbow.position.set(0, -0.55, 0);
    leftSleevePivot.add(leftElbow);

    const leftForearmPivot = new THREE.Group();
    leftForearmPivot.position.set(0, -0.55, 0);
    leftForearmPivot.rotation.set(0.25, 0, 0.15);
    leftSleevePivot.add(leftForearmPivot);

    const forearmGeom = new THREE.CylinderGeometry(0.11, 0.09, 0.55, 12);
    const leftForearmGroup = new THREE.Group();
    leftForearmGroup.position.set(0, -0.275, 0);
    leftForearmGroup.scale.set(1.0, 1.0, 0.8);
    leftForearmPivot.add(leftForearmGroup);
    createDualMesh(forearmGeom, leftForearmGroup);

    const cuffGeom = new THREE.CylinderGeometry(0.105, 0.105, 0.08, 12);
    const leftCuff = new THREE.Mesh(cuffGeom, metalMat);
    leftCuff.position.set(0, -0.55, 0);
    leftForearmPivot.add(leftCuff);

    // ── Right sleeve ─────────────────────────────
    const rightSleevePivot = new THREE.Group();
    rightSleevePivot.position.set(0.64, 0.52, 0.02);
    jacketGroup.add(rightSleevePivot);

    const rightUpperArmGroup = new THREE.Group();
    rightUpperArmGroup.position.set(0, -0.275, 0);
    rightUpperArmGroup.scale.set(1.0, 1.0, 0.8);
    rightSleevePivot.add(rightUpperArmGroup);
    createDualMesh(upperArmGeom, rightUpperArmGroup);

    const rightElbow = new THREE.Mesh(elbowGeom, leatherMat);
    rightElbow.position.set(0, -0.55, 0);
    rightSleevePivot.add(rightElbow);

    const rightForearmPivot = new THREE.Group();
    rightForearmPivot.position.set(0, -0.55, 0);
    rightForearmPivot.rotation.set(0.25, 0, -0.15);
    rightSleevePivot.add(rightForearmPivot);

    const rightForearmGroup = new THREE.Group();
    rightForearmGroup.position.set(0, -0.275, 0);
    rightForearmGroup.scale.set(1.0, 1.0, 0.8);
    rightForearmPivot.add(rightForearmGroup);
    createDualMesh(forearmGeom, rightForearmGroup);

    const rightCuff = new THREE.Mesh(cuffGeom, metalMat);
    rightCuff.position.set(0, -0.55, 0);
    rightForearmPivot.add(rightCuff);

    // ── Lapels ───────────────────────────────────
    const lapelGeom = new THREE.BoxGeometry(0.32, 0.48, 0.06);
    const leftLapel = new THREE.Mesh(lapelGeom, leatherMat);
    leftLapel.position.set(-0.22, 0.32, 0.22);
    leftLapel.rotation.set(0.12, 0.32, -0.22);
    bodyGroup.add(leftLapel);
    const leftLapelWire = new THREE.Mesh(lapelGeom, wireframeMat);
    leftLapelWire.position.copy(leftLapel.position);
    leftLapelWire.rotation.copy(leftLapel.rotation);
    leftLapelWire.scale.multiplyScalar(1.05);
    bodyGroup.add(leftLapelWire);

    const rightLapel = new THREE.Mesh(lapelGeom, leatherMat);
    rightLapel.position.set(0.22, 0.32, 0.22);
    rightLapel.rotation.set(0.12, -0.32, 0.22);
    bodyGroup.add(rightLapel);
    const rightLapelWire = new THREE.Mesh(lapelGeom, wireframeMat);
    rightLapelWire.position.copy(rightLapel.position);
    rightLapelWire.rotation.copy(rightLapel.rotation);
    rightLapelWire.scale.multiplyScalar(1.05);
    bodyGroup.add(rightLapelWire);

    // ── Belt / Buckle / Zipper ───────────────────
    const beltGeom = new THREE.BoxGeometry(0.98, 0.12, 0.25);
    const belt = new THREE.Mesh(beltGeom, leatherMat);
    belt.position.set(0, -0.58, 0.1);
    bodyGroup.add(belt);
    const beltWire = new THREE.Mesh(beltGeom, wireframeMat);
    beltWire.position.copy(belt.position);
    beltWire.scale.multiplyScalar(1.04);
    bodyGroup.add(beltWire);

    const buckleGeom = new THREE.BoxGeometry(0.18, 0.16, 0.28);
    const buckle = new THREE.Mesh(buckleGeom, metalMat);
    buckle.position.set(0, -0.58, 0.12);
    bodyGroup.add(buckle);

    const zipperGeom = new THREE.BoxGeometry(0.025, 0.95, 0.04);
    const zipper = new THREE.Mesh(zipperGeom, zipperMat);
    zipper.position.set(0, -0.05, 0.2);
    bodyGroup.add(zipper);

    // ── Epaulets ─────────────────────────────────
    const epauletGeom = new THREE.BoxGeometry(0.26, 0.03, 0.14);
    const leftEpaulet = new THREE.Mesh(epauletGeom, leatherMat);
    leftEpaulet.position.set(-0.42, 0.58, 0.05);
    leftEpaulet.rotation.z = -0.12;
    bodyGroup.add(leftEpaulet);

    const rightEpaulet = new THREE.Mesh(epauletGeom, leatherMat);
    rightEpaulet.position.set(0.42, 0.58, 0.05);
    rightEpaulet.rotation.z = 0.12;
    bodyGroup.add(rightEpaulet);

    // ── Collar & Hanger ──────────────────────────
    const collarGeom = new THREE.TorusGeometry(0.25, 0.05, 8, 24, Math.PI);
    const collarMesh = new THREE.Mesh(collarGeom, leatherMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.62, -0.02);
    bodyGroup.add(collarMesh);
    const collarWire = new THREE.Mesh(collarGeom, wireframeMat);
    collarWire.rotation.copy(collarMesh.rotation);
    collarWire.position.copy(collarMesh.position);
    collarWire.scale.multiplyScalar(1.05);
    bodyGroup.add(collarWire);

    const hangerGeom = new THREE.TorusGeometry(0.16, 0.02, 8, 16, Math.PI * 1.25);
    const hanger = new THREE.Mesh(hangerGeom, metalMat);
    hanger.position.set(0, 0.8, 0);
    hanger.rotation.z = Math.PI * 0.4;
    jacketGroup.add(hanger);

    // ── Cardboard Box ────────────────────────────
    const boxGroup = new THREE.Group();
    boxGroup.position.set(0, -4.0, 0);
    rootGroup.add(boxGroup);

    const cardboardMat = new THREE.MeshStandardMaterial({
      color: 0x9b8164, roughness: 0.95, metalness: 0.02, side: THREE.DoubleSide
    });

    const boxBaseGeom = new THREE.BoxGeometry(2.3, 1.3, 2.3);
    const boxContainer = new THREE.Mesh(boxBaseGeom, cardboardMat);
    boxGroup.add(boxContainer);

    const leftFlapPivot = new THREE.Group();
    leftFlapPivot.position.set(-1.15, 0.65, 0);
    boxGroup.add(leftFlapPivot);

    const flapGeom = new THREE.BoxGeometry(1.15, 0.04, 2.3);
    const leftFlapMesh = new THREE.Mesh(flapGeom, cardboardMat);
    leftFlapMesh.position.set(0.575, 0, 0);
    leftFlapPivot.add(leftFlapMesh);

    const rightFlapPivot = new THREE.Group();
    rightFlapPivot.position.set(1.15, 0.65, 0);
    boxGroup.add(rightFlapPivot);
    const rightFlapMesh = new THREE.Mesh(flapGeom, cardboardMat);
    rightFlapMesh.position.set(-0.575, 0, 0);
    rightFlapPivot.add(rightFlapMesh);

    const tapeGeom = new THREE.BoxGeometry(2.32, 0.06, 0.5);
    const tapeMat = new THREE.MeshStandardMaterial({
      color: 0xE8FF00, roughness: 0.4, transparent: true, opacity: 0, side: THREE.DoubleSide
    });
    const tapeMesh = new THREE.Mesh(tapeGeom, tapeMat);
    tapeMesh.position.set(0, 0.68, 0);
    boxGroup.add(tapeMesh);

    // ── Laser ────────────────────────────────────
    const laserGeom = new THREE.BoxGeometry(2.8, 0.02, 2.8);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xE8FF00, transparent: true, opacity: 0, side: THREE.DoubleSide
    });
    const laser = new THREE.Mesh(laserGeom, laserMat);
    scene.add(laser);

    // ── Grid & Lights ────────────────────────────
    const gridHelper = new THREE.GridHelper(12, 24, 0x333333, 0x181818);
    gridHelper.position.y = -2.2;
    scene.add(gridHelper);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);
    const neonRim = new THREE.DirectionalLight(0xE8FF00, 1.4);
    neonRim.position.set(-6, -2, -5);
    scene.add(neonRim);
    const fillLight = new THREE.DirectionalLight(0x00ffff, 0.35);
    fillLight.position.set(2, -4, 4);
    scene.add(fillLight);

    // ── Drag rotation ────────────────────────────
    let isDragging = false, startX = 0, startY = 0;
    let targetDragRotY = 0, targetDragRotX = 0;
    let dragRotY = 0, dragRotX = 0;

    const handleDown = (e) => {
      isDragging = true;
      startX = e.clientX ?? e.touches?.[0]?.clientX;
      startY = e.clientY ?? e.touches?.[0]?.clientY;
    };
    const handleMove = (e) => {
      if (!isDragging) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      targetDragRotY += (cx - startX) * 0.008;
      targetDragRotX += (cy - startY) * 0.008;
      targetDragRotX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetDragRotX));
      startX = cx; startY = cy;
    };
    const handleUp = () => { isDragging = false; };

    container.addEventListener('mousedown', handleDown);
    container.addEventListener('touchstart', handleDown, { passive: true });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ── Render loop ──────────────────────────────
    let animId, time = 0;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      time += 0.016;
      const p = smoothProgress.get();

      dragRotY += (targetDragRotY - dragRotY) * 0.1;
      dragRotX += (targetDragRotX - dragRotX) * 0.1;
      rootGroup.rotation.y = dragRotY;
      rootGroup.rotation.x = dragRotX;

      if (p <= 0.7) {
        jacketGroup.position.y = Math.sin(time * 2.2) * 0.07 + 0.15;
        jacketGroup.scale.setScalar(1.2);
        leftSleevePivot.rotation.z = -0.15;
        rightSleevePivot.rotation.z = 0.15;
        leftForearmPivot.rotation.set(0.25, 0, 0.15);
        rightForearmPivot.rotation.set(0.25, 0, -0.15);
        jacketGroup.rotation.y = time * 0.12 + p * Math.PI * 4;
        jacketGroup.rotation.x = 0;
        boxGroup.position.y = -4.5;
        boxGroup.rotation.y = 0;

        if (p >= 0.2 && p < 0.45) {
          laser.visible = true;
          laser.position.y = Math.sin(time * 4.5) * 1.0;
          laserMat.opacity = 0.75 + Math.sin(time * 15) * 0.15;
          wireframeMat.opacity = 0.45 + Math.sin(time * 12) * 0.25;
          leatherMat.opacity = 0.35;
        } else {
          laser.visible = false;
          wireframeMat.opacity = 0.12;
          leatherMat.opacity = 1.0;
        }
      } else if (p > 0.7 && p <= 0.9) {
        laser.visible = false;
        wireframeMat.opacity = 0.12;
        leatherMat.opacity = 1.0;
        const t = (p - 0.7) / 0.2;
        leftSleevePivot.rotation.z = -0.15 - t * 1.0;
        rightSleevePivot.rotation.z = 0.15 + t * 1.0;
        leftForearmPivot.rotation.z = 0.15 + t * 1.1;
        leftForearmPivot.rotation.x = 0.25 + t * 0.85;
        rightForearmPivot.rotation.z = -0.15 - t * 1.1;
        rightForearmPivot.rotation.x = 0.25 + t * 0.85;
        jacketGroup.scale.setScalar(1.2 - t * 0.75);
        jacketGroup.position.y = (1 - t) * (Math.sin(time * 2.2) * 0.07 + 0.15) - t * 0.45;
        jacketGroup.rotation.y *= (1 - t);
        jacketGroup.rotation.x *= (1 - t);
        boxGroup.position.y = -4.5 + t * 3.7;
        boxGroup.rotation.y = 0;
        leftFlapPivot.rotation.z = 1.9;
        rightFlapPivot.rotation.z = -1.9;
        tapeMat.opacity = 0;
      } else {
        laser.visible = false;
        const t = (p - 0.9) / 0.1;
        jacketGroup.scale.setScalar(0.45 * (1 - t));
        boxGroup.position.y = -0.8 + Math.sin(time * 1.8) * 0.03;
        leftFlapPivot.rotation.z = 1.9 * (1 - t);
        rightFlapPivot.rotation.z = -1.9 * (1 - t);
        tapeMat.opacity = t;
        boxGroup.rotation.y = time * 0.15;
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleDown);
      container.removeEventListener('touchstart', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      [beltGeom, buckleGeom, epauletGeom, cuffGeom, collarGeom, lapelGeom,
        zipperGeom, hangerGeom, boxBaseGeom, flapGeom, tapeGeom, laserGeom,
        bodyGeom, shoulderGeom, upperArmGeom, elbowGeom, forearmGeom].forEach(g => g.dispose());
      [leatherMat, wireframeMat, metalMat, zipperMat, tapeMat, cardboardMat, laserMat].forEach(m => m.dispose());
    };
  }, [smoothProgress]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing"
    />
  );
};

// ─────────────────────────────────────────────
// Step data
// ─────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    code: '01',
    phase: 'COLLECTION',
    title: 'ARCHIVE\nDISCOVERY',
    desc: 'A heavy premium vintage biker leather jacket is listed on our deck by the collector. Click and drag the 3D model to inspect its structure.',
    hint: 'Drag the jacket to rotate it freely.',
    right: {
      label: 'LISTED BY',
      items: [
        { icon: '📦', text: 'Physical drop-off at Coza HQ' },
        { icon: '📸', text: 'High-res archival photo shoot' },
        { icon: '🏷️', text: "Collector's authenticated tag attached" },
      ]
    }
  },
  {
    id: 2,
    code: '02',
    phase: 'AUTHENTICATION',
    title: 'LASER SCAN\nVERIFICATION',
    desc: 'Zippers, leather grain, and stamps are physically verified. Real-time scanning ensures zero counterfeits, unlocking the Coza Verified Label.',
    hint: 'Watch the laser sweep across the jacket.',
    right: {
      label: 'VERIFIED',
      items: [
        { icon: '🔬', text: 'Grain-level leather analysis' },
        { icon: '⚡', text: 'Hardware & zipper stress test' },
        { icon: '✅', text: 'Coza Verified seal applied' },
      ]
    }
  },
  {
    id: 3,
    code: '03',
    phase: 'LIVE BIDDING',
    title: 'TRANSPARENT\nDECK BATTLE',
    desc: 'Buyers compete live on the public deck with real-time bidding notifications. The highest bid locks the item securely.',
    hint: 'Real bids appear in real-time on the deck.',
    right: {
      label: 'LIVE BIDS',
      items: [
        { icon: '🔴', text: '@deadstock.dev — ₹3,200' },
        { icon: '🟡', text: '@thrift.mafia — ₹4,500' },
        { icon: '🟢', text: '@cyber.gully — ₹5,800 WIN' },
      ]
    }
  },
  {
    id: 4,
    code: '04',
    phase: 'SECURING',
    title: 'FOLDED &\nSHIELD PACKED',
    desc: 'The bid is claimed. Sleeves fold shut programmatically. The jacket is lowered into a double-walled box, sealed with neon caution tape.',
    hint: 'Watch the jacket fold & drop into the box.',
    right: {
      label: 'PACK SPEC',
      items: [
        { icon: '📦', text: 'Double-walled cardboard shell' },
        { icon: '🛡️', text: 'Anti-moisture inner shield' },
        { icon: '⚠️', text: 'Neon security seal applied' },
      ]
    }
  },
  {
    id: 5,
    code: '05',
    phase: 'DELIVERY',
    title: 'TRUST LOCKED\n& SHIPPED',
    desc: 'Your piece has been sanitized, steam-treated, double-boxed, and shipped with full escrow protection.',
    hint: 'Funds release only after you confirm receipt.',
    right: null // special — trust panel rendered separately
  },
];

// ─────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────
const HowItWorksModal = ({ isOpen, onClose }) => {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const touchStartRef = useRef(0);

  const motionProgress = useMotionValue(0);
  useEffect(() => { motionProgress.set(progress / 100); }, [progress, motionProgress]);

  const smoothProgress = useSpring(motionProgress, { stiffness: 70, damping: 18, restDelta: 0.001 });

  // Non-passive wheel / touch on the modal container
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e) => {
      e.preventDefault();
      setProgress(p => Math.max(0, Math.min(100, p + (e.deltaY > 0 ? 5 : -5))));
    };
    const onTouchStart = (e) => { touchStartRef.current = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      e.preventDefault();
      const dy = touchStartRef.current - e.touches[0].clientY;
      touchStartRef.current = e.touches[0].clientY;
      setProgress(p => Math.max(0, Math.min(100, p + (dy > 0 ? 4 : -4))));
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    setProgress(0);

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, [isOpen]);

  const activeStep =
    progress < 20 ? 1 :
      progress < 45 ? 2 :
        progress < 70 ? 3 :
          progress < 90 ? 4 : 5;

  const step = STEPS[activeStep - 1];

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#080808] text-[#F5F0E8] overflow-hidden select-none"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ── Background grid ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <span className="font-bebas text-xl tracking-tighter flex items-center gap-1.5">
          COZA<span className="text-[#E8FF00]">-STORE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF00] animate-pulse ml-1" />
        </span>

        <button
          onClick={onClose}
          className="p-2 border border-zinc-800 bg-[#1A1A1A] hover:bg-[#E8FF00] hover:text-black transition-colors pointer-events-auto"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Main 3-column layout ── */}
      <div className="absolute inset-0 flex flex-row items-stretch pt-16 pb-10">

        {/* ── LEFT PANEL: Step label + headline ── */}
        <div className="hidden md:flex w-[26%] flex-col justify-center px-8 xl:px-12 border-r border-zinc-900 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${activeStep}`}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-5"
            >
              {/* Phase badge */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#E8FF00] text-[10px] tracking-[0.25em] uppercase border border-[#E8FF00]/30 px-2 py-0.5">
                  {step.code}
                </span>
                <span className="font-mono text-zinc-500 text-[9px] tracking-[0.2em] uppercase">
                  {step.phase}
                </span>
              </div>

              {/* Big headline */}
              <h2 className="font-bebas text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.9] tracking-tight text-[#F5F0E8] uppercase whitespace-pre-line">
                {step.title}
              </h2>

              {/* Divider line */}
              <div className="w-10 h-px bg-[#E8FF00]" />

              {/* Description */}
              <p className="font-space text-zinc-400 text-[11px] leading-relaxed uppercase tracking-wide max-w-[240px]">
                {step.desc}
              </p>

              {/* Hint */}
              <div className="flex items-center gap-1.5 text-zinc-600">
                <ArrowDown size={10} className="animate-bounce text-[#E8FF00]" />
                <span className="font-mono text-[8px] tracking-widest uppercase">{step.hint}</span>
              </div>

              {/* Progress tracker */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between font-mono text-[8px] text-zinc-600 uppercase">
                  <span>Progress</span><span>{progress}%</span>
                </div>
                <div className="w-full h-px bg-zinc-800 relative overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-[#E8FF00]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── CENTER PANEL: 3D Canvas + overlays ── */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">

          {/* 3D WebGL canvas */}
          <div className="absolute inset-0">
            <ThreeJacketCanvas smoothProgress={smoothProgress} />
          </div>

          {/* Step 2: Laser sweep HTML overlay */}
          <AnimatePresence>
            {activeStep === 2 && (
              <motion.div
                initial={{ top: '15%', opacity: 0 }}
                animate={{ top: ['15%', '85%', '15%'], opacity: [0.5, 0.5, 0.5] }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="absolute left-[8%] right-[8%] h-px bg-[#E8FF00] shadow-[0_0_14px_3px_#E8FF00] z-20 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Step 3: Bid bubbles */}
          <AnimatePresence>
            {activeStep === 3 && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute left-[6%] top-[28%] z-20 bg-[#111] border border-zinc-800 text-xs p-2 shadow-[3px_3px_0px_#333] pointer-events-none"
                >
                  <span className="text-zinc-500 uppercase block text-[8px]">@deadstock.dev</span>
                  <span className="font-mono font-bold text-[#E8FF00]">₹3,200</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute right-[6%] top-[40%] z-20 bg-[#111] border border-[#E8FF00]/40 text-xs p-2 shadow-[3px_3px_0px_#E8FF00] pointer-events-none"
                >
                  <span className="text-[#E8FF00] uppercase block text-[8px]">@thrift.mafia</span>
                  <span className="font-mono font-bold">₹4,500</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute left-[8%] bottom-[30%] z-20 bg-[#E8FF00] text-black text-xs p-2 shadow-[3px_3px_0px_#000] font-bold pointer-events-none"
                >
                  <span className="text-black/60 uppercase block text-[8px]">@cyber.gully</span>
                  <span className="font-mono">₹5,800 🏆</span>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Step 5: Checkmark */}
          <AnimatePresence>
            {activeStep === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              >
                <div className="w-12 h-12 border border-[#E8FF00] flex items-center justify-center bg-[#111]/90 shadow-[4px_4px_0px_#000]">
                  <CheckCircle2 size={26} className="text-[#E8FF00] animate-bounce" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile: step text below canvas */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pt-8 pb-4 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mob-${activeStep}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="text-center space-y-1"
              >
                <span className="font-mono text-[#E8FF00] text-[9px] tracking-widest uppercase">{step.code} / {step.phase}</span>
                <h3 className="font-bebas text-3xl tracking-tight text-white uppercase leading-none whitespace-pre-line">{step.title}</h3>
                <p className="font-space text-zinc-400 text-[10px] uppercase leading-relaxed">{step.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT PANEL: Details / trust badges ── */}
        <div className="hidden md:flex w-[26%] flex-col justify-center px-8 xl:px-12 border-l border-zinc-900 pointer-events-none">
          <AnimatePresence mode="wait">
            {activeStep < 5 ? (
              <motion.div
                key={`right-${activeStep}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-5"
              >
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-800 pb-2 block">
                  {step.right?.label}
                </span>
                <ul className="space-y-4">
                  {step.right?.items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="flex items-start gap-3"
                    >
                      <span className="text-base leading-none mt-0.5">{item.icon}</span>
                      <span className="font-space text-[11px] uppercase text-zinc-400 leading-relaxed tracking-wide">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Step counter visual */}
                <div className="mt-6 pt-5 border-t border-zinc-900 space-y-1">
                  {STEPS.map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${s.id <= activeStep ? 'bg-[#E8FF00]' : 'bg-zinc-800'}`} />
                      <span className={`font-mono text-[8px] tracking-widest uppercase transition-colors ${s.id === activeStep ? 'text-[#E8FF00]' : s.id < activeStep ? 'text-zinc-500' : 'text-zinc-800'}`}>
                        {s.phase}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              // Step 5 — Trust panel
              <motion.div
                key="right-5"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-800 pb-2 block">
                  GUARANTEES
                </span>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="text-[#E8FF00] shrink-0 mt-0.5" size={14} />
                    <div>
                      <h4 className="font-space text-[10px] font-bold text-[#F5F0E8] uppercase tracking-wider">Coza Escrow Shield</h4>
                      <p className="font-space text-[9px] text-zinc-500 uppercase leading-relaxed mt-0.5">
                        Payment held until you confirm receipt & authenticity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t border-zinc-900 pt-3">
                    <Check className="text-[#E8FF00] shrink-0 mt-0.5" size={13} />
                    <div>
                      <h4 className="font-space text-[10px] font-bold text-[#F5F0E8] uppercase tracking-wider">Multi-Point Inspection</h4>
                      <p className="font-space text-[9px] text-zinc-500 uppercase leading-relaxed mt-0.5">
                        Hardware check, dry-clean & high-temp sanitization.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t border-zinc-900 pt-3">
                    <Sparkles className="text-[#E8FF00] shrink-0 mt-0.5" size={13} />
                    <div>
                      <h4 className="font-space text-[10px] font-bold text-[#F5F0E8] uppercase tracking-wider">Tamper-Proof Packaging</h4>
                      <p className="font-space text-[9px] text-zinc-500 uppercase leading-relaxed mt-0.5">
                        Double-walled box + anti-moisture shield + neon seal.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="pointer-events-auto mt-2 w-full py-2.5 bg-[#E8FF00] text-black font-extrabold tracking-widest text-[10px] uppercase hover:bg-white transition-colors shadow-[3px_3px_0px_#fff] hover:shadow-[3px_3px_0px_#E8FF00] flex items-center justify-center gap-1"
                >
                  ENTER DECK <ChevronRight size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom scroll hint ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-none">
        <ArrowDown size={9} className="text-zinc-700 animate-bounce" />
        <span className="font-mono text-[7px] text-zinc-700 tracking-widest uppercase">Scroll to advance</span>
        <ArrowDown size={9} className="text-zinc-700 animate-bounce" />
      </div>
    </div>
  );
};

export default HowItWorksModal;
