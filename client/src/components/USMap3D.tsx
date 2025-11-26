import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { statesData, type StateData } from "@shared/schema";
import USMap from "./USMap";

interface USMap3DProps {
  onStateClick?: (state: StateData) => void;
}

const stateColors = {
  high: "#e55c2b",
  medium: "#f5a623", 
  low: "#22c55e",
  ineligible: "#6b7280",
};

const statePositions: Record<string, { x: number; y: number; scale: number }> = {
  WA: { x: -0.75, y: 0.85, scale: 0.9 },
  OR: { x: -0.8, y: 0.65, scale: 0.85 },
  CA: { x: -0.85, y: 0.35, scale: 1.1 },
  NV: { x: -0.65, y: 0.45, scale: 0.8 },
  ID: { x: -0.55, y: 0.7, scale: 0.75 },
  MT: { x: -0.35, y: 0.85, scale: 0.95 },
  WY: { x: -0.3, y: 0.65, scale: 0.8 },
  UT: { x: -0.5, y: 0.45, scale: 0.7 },
  AZ: { x: -0.55, y: 0.2, scale: 0.85 },
  CO: { x: -0.25, y: 0.45, scale: 0.8 },
  NM: { x: -0.35, y: 0.2, scale: 0.8 },
  ND: { x: -0.05, y: 0.85, scale: 0.7 },
  SD: { x: -0.05, y: 0.7, scale: 0.7 },
  NE: { x: -0.05, y: 0.55, scale: 0.75 },
  KS: { x: -0.05, y: 0.4, scale: 0.75 },
  OK: { x: -0.05, y: 0.25, scale: 0.75 },
  TX: { x: -0.1, y: 0.0, scale: 1.3 },
  MN: { x: 0.15, y: 0.8, scale: 0.8 },
  IA: { x: 0.2, y: 0.6, scale: 0.65 },
  MO: { x: 0.22, y: 0.42, scale: 0.7 },
  AR: { x: 0.22, y: 0.22, scale: 0.6 },
  LA: { x: 0.25, y: 0.02, scale: 0.6 },
  WI: { x: 0.35, y: 0.75, scale: 0.65 },
  IL: { x: 0.38, y: 0.52, scale: 0.65 },
  MI: { x: 0.48, y: 0.75, scale: 0.75 },
  IN: { x: 0.48, y: 0.5, scale: 0.55 },
  OH: { x: 0.58, y: 0.55, scale: 0.6 },
  KY: { x: 0.52, y: 0.38, scale: 0.6 },
  TN: { x: 0.48, y: 0.28, scale: 0.65 },
  MS: { x: 0.38, y: 0.12, scale: 0.55 },
  AL: { x: 0.48, y: 0.12, scale: 0.55 },
  GA: { x: 0.58, y: 0.15, scale: 0.65 },
  FL: { x: 0.65, y: -0.1, scale: 0.85 },
  SC: { x: 0.68, y: 0.25, scale: 0.5 },
  NC: { x: 0.72, y: 0.35, scale: 0.65 },
  VA: { x: 0.72, y: 0.45, scale: 0.55 },
  WV: { x: 0.62, y: 0.45, scale: 0.45 },
  PA: { x: 0.72, y: 0.6, scale: 0.6 },
  NY: { x: 0.78, y: 0.72, scale: 0.7 },
  VT: { x: 0.85, y: 0.85, scale: 0.35 },
  NH: { x: 0.9, y: 0.82, scale: 0.35 },
  ME: { x: 0.95, y: 0.88, scale: 0.55 },
  MA: { x: 0.92, y: 0.72, scale: 0.4 },
  RI: { x: 0.95, y: 0.68, scale: 0.25 },
  CT: { x: 0.88, y: 0.65, scale: 0.3 },
  NJ: { x: 0.82, y: 0.55, scale: 0.35 },
  DE: { x: 0.82, y: 0.48, scale: 0.25 },
  MD: { x: 0.78, y: 0.48, scale: 0.4 },
  DC: { x: 0.76, y: 0.46, scale: 0.15 },
  HI: { x: -0.6, y: -0.35, scale: 0.5 },
  AK: { x: -0.85, y: -0.25, scale: 0.8 },
};

export default function USMap3D({ onStateClick }: USMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const statesRef = useRef<Map<string, THREE.Group>>(new Map());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(10, 10));
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const hoveredStateRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number>(0);
  const basePositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebGLSupported(!!gl);
  }, []);

  if (webGLSupported === false) {
    return <USMap onStateClick={onStateClick} />;
  }

  if (webGLSupported === null) {
    return (
      <div className="w-full h-[550px] rounded-xl bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Loading 3D map...</div>
      </div>
    );
  }

  const getStateColor = useCallback((abbreviation: string): string => {
    const state = statesData.find(s => s.abbreviation === abbreviation);
    if (!state) return stateColors.ineligible;
    if (!state.isEligible) return stateColors.ineligible;
    if (state.loanVolume >= 50000000) return stateColors.high;
    if (state.loanVolume >= 10000000) return stateColors.medium;
    return stateColors.low;
  }, []);

  const createStateShape = useCallback((scale: number): THREE.Shape => {
    const shape = new THREE.Shape();
    const s = scale * 0.18;
    
    shape.moveTo(-s, -s * 0.7);
    shape.lineTo(-s * 0.8, -s);
    shape.lineTo(s * 0.8, -s);
    shape.lineTo(s, -s * 0.7);
    shape.lineTo(s, s * 0.7);
    shape.lineTo(s * 0.8, s);
    shape.lineTo(-s * 0.8, s);
    shape.lineTo(-s, s * 0.7);
    shape.closePath();
    
    return shape;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 6);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4a90d9, 0.3);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xe55c2b, 0.5, 15);
    rimLight.position.set(0, 3, 3);
    scene.add(rimLight);

    const sphereRadius = 8;
    const mapCenterX = 0;
    const mapCenterY = 0.3;

    Object.entries(statePositions).forEach(([abbr, pos]) => {
      const color = getStateColor(abbr);
      const stateScale = pos.scale;
      
      const shape = createStateShape(stateScale);
      const extrudeSettings = {
        depth: 0.08,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.015,
        bevelSegments: 2,
      };
      
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();
      
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.1,
        roughness: 0.6,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.05,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      const x = (pos.x - 0.05) * 3.2 + mapCenterX;
      const y = (pos.y - 0.4) * 2.8 + mapCenterY;
      
      const distFromCenter = Math.sqrt(x * x + y * y);
      const normalizedDist = distFromCenter / 3;
      const curveAmount = Math.pow(normalizedDist, 2) * 1.2;
      const baseZ = -curveAmount;
      
      const tiltX = -y * 0.08;
      const tiltY = x * 0.08;
      
      const group = new THREE.Group();
      group.add(mesh);
      group.position.set(x, y, baseZ);
      group.rotation.set(tiltX, tiltY, 0);
      
      group.userData = { 
        abbreviation: abbr, 
        baseZ: baseZ,
        basePosition: new THREE.Vector3(x, y, baseZ),
      };
      
      basePositionsRef.current.set(abbr, new THREE.Vector3(x, y, baseZ));
      statesRef.current.set(abbr, group);
      scene.add(group);
    });

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(statesRef.current.values()).flatMap(g => g.children)
      );
      
      if (intersects.length > 0) {
        const parent = intersects[0].object.parent;
        if (parent) {
          const abbr = parent.userData.abbreviation;
          if (hoveredStateRef.current !== abbr) {
            hoveredStateRef.current = abbr;
            const state = statesData.find(s => s.abbreviation === abbr);
            setHoveredState(state || null);
            container.style.cursor = 'pointer';
          }
        }
      } else {
        if (hoveredStateRef.current !== null) {
          hoveredStateRef.current = null;
          setHoveredState(null);
          container.style.cursor = 'default';
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.set(10, 10);
      hoveredStateRef.current = null;
      setHoveredState(null);
      container.style.cursor = 'default';
    };

    const handleClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / width) * 2 - 1,
        -((event.clientY - rect.top) / height) * 2 + 1
      );
      
      raycasterRef.current.setFromCamera(mouse, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(statesRef.current.values()).flatMap(g => g.children)
      );
      
      if (intersects.length > 0 && onStateClick) {
        const parent = intersects[0].object.parent;
        if (parent) {
          const abbr = parent.userData.abbreviation;
          const state = statesData.find(s => s.abbreviation === abbr);
          if (state) {
            onStateClick(state);
          }
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const mouse3D = new THREE.Vector3(
        mouseRef.current.x * 3.5,
        mouseRef.current.y * 2.5 + 0.3,
        3
      );

      statesRef.current.forEach((group, abbr) => {
        const basePos = basePositionsRef.current.get(abbr);
        if (!basePos) return;
        
        const baseZ = group.userData.baseZ;
        const statePos = new THREE.Vector3(group.position.x, group.position.y, 0);
        const mousePos2D = new THREE.Vector3(mouse3D.x, mouse3D.y, 0);
        const distance = statePos.distanceTo(mousePos2D);
        
        const magnetStrength = 1.8;
        const magnetRadius = 2.0;
        const falloffPower = 2.5;
        
        let targetZ = baseZ;
        let targetScale = 1;
        
        if (distance < magnetRadius) {
          const influence = Math.pow(1 - distance / magnetRadius, falloffPower);
          targetZ = baseZ + influence * magnetStrength;
          targetScale = 1 + influence * 0.15;
        }
        
        const isHovered = hoveredStateRef.current === abbr;
        if (isHovered) {
          targetZ += 0.4;
          targetScale += 0.1;
        }

        const lerpSpeed = 0.12;
        const currentZ = group.position.z;
        const newZ = currentZ + (targetZ - currentZ) * lerpSpeed;
        group.position.z = newZ;
        
        const currentScale = group.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * lerpSpeed;
        group.scale.setScalar(newScale);

        const mesh = group.children[0] as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        
        const elevation = newZ - baseZ;
        const glowIntensity = Math.min(elevation * 0.15, 0.3);
        material.emissiveIntensity = 0.05 + glowIntensity;
        
        if (isHovered) {
          material.emissive = new THREE.Color(0xffffff);
          material.emissiveIntensity = 0.25;
        } else {
          material.emissive = new THREE.Color(getStateColor(abbr));
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 550;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameRef.current);
      
      statesRef.current.forEach((group) => {
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      });
      statesRef.current.clear();
      basePositionsRef.current.clear();
      
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [getStateColor, createStateShape, onStateClick]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="w-full h-[550px] rounded-xl overflow-hidden shadow-2xl"
        data-testid="map-3d-container"
      />
      
      {hoveredState && (
        <div 
          className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg p-4 shadow-xl pointer-events-none z-10"
          data-testid="state-tooltip"
        >
          <h3 className="font-bold text-lg">{hoveredState.name}</h3>
          <p className="text-sm text-muted-foreground">{hoveredState.abbreviation}</p>
          {hoveredState.isEligible ? (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-green-500 font-medium">Eligible for Lending</p>
              {hoveredState.loanVolume > 0 && (
                <p className="text-muted-foreground">
                  Volume: ${(hoveredState.loanVolume / 1000000).toFixed(1)}M
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Not currently lending in this state</p>
          )}
          <p className="mt-2 text-xs text-primary">Click to view details</p>
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm border rounded-lg p-3 text-sm shadow-lg" data-testid="map-legend">
        <p className="font-medium mb-2">Loan Volume</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: stateColors.high }} />
            <span className="text-xs">$50M+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: stateColors.medium }} />
            <span className="text-xs">$10M - $50M</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: stateColors.low }} />
            <span className="text-xs">Under $10M</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: stateColors.ineligible }} />
            <span className="text-xs">Not Available</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg">
        Move mouse to interact
      </div>
    </div>
  );
}
