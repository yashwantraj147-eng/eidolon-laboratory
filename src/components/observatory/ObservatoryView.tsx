import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Crosshair,
  ShieldAlert,
  Zap,
  Radio,
  Eye,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';
import { Entity, Anomaly } from '../../types/simulation';

export const ObservatoryView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    zones,
    entities,
    anomalies,
    entanglementLinks,
    activeStorm,
    selectedEntityId,
    setSelectedEntityId,
    selectedAnomalyId,
    setSelectedAnomalyId,
    currentTick,
  } = useSimulation();

  const [cameraMode, setCameraMode] = useState<'FREE' | 'FOLLOW_ENTITY' | 'TOP_DOWN' | 'CORE_FOCUS' | 'CINEMATIC'>('FREE');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showEntanglements, setShowEntanglements] = useState<boolean>(true);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const entityMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const anomalyMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const zoneMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const laserLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const stormMeshRef = useRef<THREE.Group | null>(null);

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Orbit state
  const isMouseDownRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 180,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);
  const selectedAnomaly = anomalies.find((a) => a.id === selectedAnomalyId);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.0035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0x223344, 1.2);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x00f0ff, 2.5, 400);
    coreLight.position.set(0, 10, 0);
    scene.add(coreLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 1.8, 300);
    purpleLight.position.set(60, 20, 60);
    scene.add(purpleLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(300, 60, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -25;
    scene.add(gridHelper);

    // Background Starfield Particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 800;
      starPos[i + 1] = (Math.random() - 0.5) * 600;
      starPos[i + 2] = (Math.random() - 0.5) * 800;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Central Quantum Core Node
    const coreGeo = new THREE.IcosahedronGeometry(8, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      wireframe: true,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.name = 'core-mesh';
    scene.add(coreMesh);

    // Core pulsing ring
    const ringGeo = new THREE.RingGeometry(18, 19, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    scene.add(ringMesh);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Rotate core
      coreMesh.rotation.y += 0.008;
      coreMesh.rotation.x += 0.004;
      ringMesh.rotation.z -= 0.005;

      // Cinematic Camera Auto-Orbit
      if (cameraMode === 'CINEMATIC') {
        cameraSphericalRef.current.theta += 0.003;
      }

      // Camera Orbit Calculation
      const { radius, theta, phi } = cameraSphericalRef.current;
      const target = cameraTargetRef.current;

      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [cameraMode]);

  // Update Zones in 3D Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    zoneMeshesRef.current.forEach((group) => scene.remove(group));
    zoneMeshesRef.current.clear();

    if (!showZones) return;

    zones.forEach((zone) => {
      const group = new THREE.Group();
      group.position.set(zone.center.x, zone.center.y, zone.center.z);

      // Outer ring
      const ringGeo = new THREE.RingGeometry(zone.radius - 1, zone.radius, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(zone.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // Translucent cylinder column
      const cylGeo = new THREE.CylinderGeometry(zone.radius, zone.radius, 12, 32, 1, true);
      const cylMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(zone.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.08,
        wireframe: true,
      });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      group.add(cyl);

      scene.add(group);
      zoneMeshesRef.current.set(zone.id, group);
    });
  }, [zones, showZones]);

  // Update Entities in 3D Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const archetypeColors: Record<string, number> = {
      probe: 0x00f0ff,
      synthet: 0xa855f7,
      harvester: 0x10b981,
      archivist: 0xf59e0b,
      chronomancer: 0xec4899,
      'anomaly-warden': 0x3b82f6,
    };

    entities.forEach((entity) => {
      let group = entityMeshesRef.current.get(entity.id);

      if (!group) {
        group = new THREE.Group();

        const color = archetypeColors[entity.archetype] || 0x00f0ff;
        const geom =
          entity.archetype === 'probe'
            ? new THREE.ConeGeometry(1.6, 3.5, 4)
            : entity.archetype === 'harvester'
            ? new THREE.BoxGeometry(2.2, 2.2, 2.2)
            : new THREE.OctahedronGeometry(2.0);

        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.5,
          roughness: 0.2,
          metalness: 0.8,
        });

        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData = { entityId: entity.id, type: 'entity' };
        group.add(mesh);

        // Selection beacon ring
        const selectRingGeo = new THREE.RingGeometry(3.2, 3.6, 24);
        const selectRingMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
        });
        const selectRing = new THREE.Mesh(selectRingGeo, selectRingMat);
        selectRing.rotation.x = Math.PI / 2;
        selectRing.name = 'selection-ring';
        group.add(selectRing);

        scene.add(group);
        entityMeshesRef.current.set(entity.id, group);
      }

      group.position.set(entity.position.x, entity.position.y, entity.position.z);

      if (Math.abs(entity.velocity.x) > 0.01 || Math.abs(entity.velocity.z) > 0.01) {
        group.rotation.y = Math.atan2(entity.velocity.x, entity.velocity.z);
      }

      const selectRing = group.getObjectByName('selection-ring') as THREE.Mesh;
      if (selectRing) {
        const isSelected = entity.id === selectedEntityId;
        (selectRing.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.9 : 0;
        selectRing.rotation.z += 0.02;
      }
    });

    const currentEntityIds = new Set(entities.map((e) => e.id));
    entityMeshesRef.current.forEach((group, id) => {
      if (!currentEntityIds.has(id)) {
        scene.remove(group);
        entityMeshesRef.current.delete(id);
      }
    });

    if (cameraMode === 'FOLLOW_ENTITY' && selectedEntity) {
      cameraTargetRef.current.lerp(
        new THREE.Vector3(selectedEntity.position.x, selectedEntity.position.y, selectedEntity.position.z),
        0.1
      );
    }
  }, [entities, selectedEntityId, cameraMode, selectedEntity]);

  // Update 3D Quantum Entanglement Laser Links
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old lines
    laserLinesRef.current.forEach((line) => scene.remove(line));
    laserLinesRef.current.clear();

    if (!showEntanglements) return;

    entanglementLinks.forEach((link) => {
      const eA = entities.find((e) => e.id === link.entityAId);
      const eB = entities.find((e) => e.id === link.entityBId);
      if (!eA || !eB) return;

      const points = [
        new THREE.Vector3(eA.position.x, eA.position.y, eA.position.z),
        new THREE.Vector3(eB.position.x, eB.position.y, eB.position.z),
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(link.color),
        transparent: true,
        opacity: 0.6,
        linewidth: 2,
      });
      const line = new THREE.Line(geom, mat);
      scene.add(line);
      laserLinesRef.current.set(link.id, line);
    });
  }, [entanglementLinks, entities, showEntanglements]);

  // Update Chronal Storm 3D Mesh
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (stormMeshRef.current) {
      scene.remove(stormMeshRef.current);
      stormMeshRef.current = null;
    }

    if (activeStorm) {
      const group = new THREE.Group();
      group.position.set(activeStorm.center.x, activeStorm.center.y, activeStorm.center.z);

      const stormGeo = new THREE.SphereGeometry(activeStorm.radius, 24, 24);
      const stormMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      group.add(new THREE.Mesh(stormGeo, stormMat));

      const ringGeo = new THREE.RingGeometry(activeStorm.radius * 0.9, activeStorm.radius, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      scene.add(group);
      stormMeshRef.current = group;
    }
  }, [activeStorm]);

  // Update Anomalies in 3D Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    anomalies.forEach((anomaly) => {
      let group = anomalyMeshesRef.current.get(anomaly.id);

      if (!group) {
        group = new THREE.Group();

        const color = anomaly.severity === 'CRITICAL' ? 0xef4444 : anomaly.severity === 'SEVERE' ? 0xf59e0b : 0xa855f7;
        const geom = new THREE.SphereGeometry(anomaly.radius * 0.4, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: 0.65,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData = { anomalyId: anomaly.id, type: 'anomaly' };
        group.add(mesh);

        const innerGeo = new THREE.DodecahedronGeometry(anomaly.radius * 0.15);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        group.add(new THREE.Mesh(innerGeo, innerMat));

        scene.add(group);
        anomalyMeshesRef.current.set(anomaly.id, group);
      }

      group.position.set(anomaly.location.x, anomaly.location.y, anomaly.location.z);
      group.rotation.y += 0.015;
      group.rotation.x += 0.008;

      const scale = 1 + Math.sin(Date.now() * 0.004) * 0.12;
      group.scale.set(scale, scale, scale);
    });

    const currentAnomalyIds = new Set(anomalies.map((a) => a.id));
    anomalyMeshesRef.current.forEach((group, id) => {
      if (!currentAnomalyIds.has(id)) {
        scene.remove(group);
        anomalyMeshesRef.current.delete(id);
      }
    });
  }, [anomalies]);

  // Mouse Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isMouseDownRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    if (isMouseDownRef.current) {
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;

      cameraSphericalRef.current.theta -= dx * 0.006;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi - dy * 0.006)
      );

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isMouseDownRef.current = false;

    const dist = Math.hypot(e.clientX - prevMousePosRef.current.x, e.clientY - prevMousePosRef.current.y);
    if (dist < 6 && containerRef.current && cameraRef.current && sceneRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

      for (const hit of intersects) {
        if (hit.object.userData?.entityId) {
          setSelectedEntityId(hit.object.userData.entityId);
          setSelectedAnomalyId(null);
          return;
        }
        if (hit.object.userData?.anomalyId) {
          setSelectedAnomalyId(hit.object.userData.anomalyId);
          setSelectedEntityId(null);
          return;
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    cameraSphericalRef.current.radius = Math.max(
      35,
      Math.min(450, cameraSphericalRef.current.radius + e.deltaY * 0.25)
    );
  };

  const setCameraPreset = (preset: 'FREE' | 'FOLLOW_ENTITY' | 'TOP_DOWN' | 'CORE_FOCUS' | 'CINEMATIC') => {
    setCameraMode(preset);
    if (preset === 'FREE') {
      cameraTargetRef.current.set(0, 0, 0);
      cameraSphericalRef.current = { radius: 180, theta: Math.PI / 4, phi: Math.PI / 3 };
    } else if (preset === 'TOP_DOWN') {
      cameraTargetRef.current.set(0, 0, 0);
      cameraSphericalRef.current = { radius: 240, theta: 0, phi: 0.15 };
    } else if (preset === 'CORE_FOCUS') {
      cameraTargetRef.current.set(0, 0, 0);
      cameraSphericalRef.current = { radius: 45, theta: Math.PI / 6, phi: Math.PI / 2.5 };
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
        backgroundColor: '#030712',
      }}
    >
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: '100%',
          cursor: isMouseDownRef.current ? 'grabbing' : 'grab',
        }}
      />

      {/* Top Left Observatory HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          pointerEvents: 'none',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '0.6rem 1rem',
            pointerEvents: 'auto',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: 'var(--color-cyan)',
              letterSpacing: '0.06em',
            }}
          >
            REALITY OBSERVATORY // 3D NEXUS
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#94a3b8',
              marginTop: '2px',
            }}
          >
            AGENTS: {entities.length} | ANOMALIES: {anomalies.length} | ENTANGLED: {entanglementLinks.length} PAIRS
            {activeStorm && <span style={{ color: 'var(--color-purple)', marginLeft: '6px' }}>⚡ {activeStorm.name}</span>}
          </div>
        </div>

        {/* View Camera Presets Bar */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.6rem',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setCameraPreset('FREE')}
            className={`btn-tech ${cameraMode === 'FREE' ? 'btn-tech-primary' : ''}`}
            style={{ padding: '4px 7px', fontSize: '0.68rem' }}
          >
            FREE
          </button>
          <button
            onClick={() => setCameraPreset('TOP_DOWN')}
            className={`btn-tech ${cameraMode === 'TOP_DOWN' ? 'btn-tech-primary' : ''}`}
            style={{ padding: '4px 7px', fontSize: '0.68rem' }}
          >
            TACTICAL
          </button>
          <button
            onClick={() => setCameraPreset('CORE_FOCUS')}
            className={`btn-tech ${cameraMode === 'CORE_FOCUS' ? 'btn-tech-primary' : ''}`}
            style={{ padding: '4px 7px', fontSize: '0.68rem' }}
          >
            CORE
          </button>
          <button
            onClick={() => setCameraPreset('CINEMATIC')}
            className={`btn-tech ${cameraMode === 'CINEMATIC' ? 'btn-tech-primary' : ''}`}
            style={{ padding: '4px 7px', fontSize: '0.68rem' }}
          >
            FLYBY
          </button>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

          <button
            onClick={() => setShowEntanglements(!showEntanglements)}
            style={{
              background: showEntanglements ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: showEntanglements ? '#c084fc' : '#64748b',
              border: 'none',
              padding: '4px 6px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            LINKS
          </button>

          <button
            onClick={() => setShowZones(!showZones)}
            style={{
              background: showZones ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: showZones ? '#00f0ff' : '#64748b',
              border: 'none',
              padding: '4px 6px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            ZONES
          </button>
        </div>
      </div>

      {/* Selected Entity Card */}
      {selectedEntity && (
        <div
          className="glass-panel-cyan"
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            right: '1.25rem',
            width: '320px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#fff',
                }}
              >
                {selectedEntity.name}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--color-cyan)',
                  textTransform: 'uppercase',
                }}
              >
                {selectedEntity.archetype} // {selectedEntity.affiliation}
              </div>
            </div>
            <span
              className={`badge-tech ${
                selectedEntity.operationalCondition === 'optimal'
                  ? 'badge-emerald'
                  : selectedEntity.operationalCondition === 'critical'
                  ? 'badge-rose'
                  : 'badge-amber'
              }`}
            >
              {selectedEntity.operationalCondition}
            </span>
          </div>

          {/* Health & Energy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#94a3b8' }}>HULL INTEGRITY</span>
              <span style={{ color: '#fff' }}>{selectedEntity.health}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px' }}>
              <div style={{ width: `${selectedEntity.health}%`, height: '100%', backgroundColor: 'var(--color-emerald)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              <span style={{ color: '#94a3b8' }}>POWER CORE</span>
              <span style={{ color: '#fff' }}>{Math.round(selectedEntity.energy)}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px' }}>
              <div style={{ width: `${selectedEntity.energy}%`, height: '100%', backgroundColor: 'var(--color-cyan)' }} />
            </div>
          </div>

          {/* Current Goal */}
          <div
            style={{
              padding: '6px 8px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
            }}
          >
            <div style={{ color: '#64748b', fontSize: '0.62rem' }}>CURRENT UTILITY GOAL</div>
            <div style={{ color: '#00f0ff', fontWeight: 600, marginTop: '2px' }}>
              {selectedEntity.currentGoal.replace(/_/g, ' ')}
            </div>
          </div>
        </div>
      )}

      {selectedAnomaly && !selectedEntity && (
        <div
          className="glass-panel-rose"
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            right: '1.25rem',
            width: '320px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#fff',
                }}
              >
                {selectedAnomaly.name}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--color-rose)',
                  textTransform: 'uppercase',
                }}
              >
                {selectedAnomaly.classification.replace(/_/g, ' ')}
              </div>
            </div>
            <span className="badge-tech badge-rose">{selectedAnomaly.severity}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#94a3b8' }}>CONTAINMENT PROGRESS</span>
              <span style={{ color: '#fff' }}>{Math.round(selectedAnomaly.containmentProgress)}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px' }}>
              <div style={{ width: `${selectedAnomaly.containmentProgress}%`, height: '100%', backgroundColor: 'var(--color-cyan)' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
