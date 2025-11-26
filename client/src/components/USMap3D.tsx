import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { statesData, type StateData } from "@shared/schema";

interface USMap3DProps {
  onStateClick?: (state: StateData) => void;
}

const stateColors: Record<string, string> = {
  high: "#e55c2b",
  medium: "#f5a623", 
  low: "#22c55e",
  ineligible: "#6b7280",
};

const statePaths: Record<string, string> = {
  AL: "M 718.31301,344.84758 720.06014,385.42 725.01043,415.31 730,445 L 740,450 750,440 770,433 L 765,410 755,375 740,335 Z",
  AK: "M 150,480 L 130,520 140,560 180,570 220,550 260,560 280,540 250,500 200,480 Z",
  AZ: "M 280,300 L 250,380 260,420 320,450 370,440 380,380 360,320 Z",
  AR: "M 580,320 L 560,380 600,400 650,385 660,340 620,310 Z",
  CA: "M 120,200 L 100,280 120,360 160,420 200,400 220,320 200,240 160,180 Z",
  CO: "M 340,240 L 330,320 400,330 470,320 480,240 400,230 Z",
  CT: "M 870,160 L 855,175 870,190 890,180 Z",
  DE: "M 840,220 L 835,240 850,250 855,230 Z",
  FL: "M 750,420 L 730,480 760,530 810,540 850,500 840,450 800,420 Z",
  GA: "M 750,340 L 730,400 760,440 810,430 830,380 800,330 Z",
  HI: "M 300,500 L 280,530 310,550 350,540 360,510 330,490 Z",
  ID: "M 220,100 L 200,180 240,240 290,220 300,140 270,80 Z",
  IL: "M 620,200 L 600,280 630,340 670,320 680,240 650,180 Z",
  IN: "M 670,200 L 655,270 680,320 720,300 730,230 700,180 Z",
  IA: "M 540,180 L 520,240 570,270 620,250 630,190 580,160 Z",
  KS: "M 420,280 L 400,340 480,350 560,340 570,280 490,270 Z",
  KY: "M 680,280 L 660,320 720,350 780,340 790,300 740,270 Z",
  LA: "M 580,400 L 560,460 600,490 660,470 670,420 620,390 Z",
  ME: "M 900,80 L 880,130 910,160 940,140 950,100 920,60 Z",
  MD: "M 820,230 L 800,260 840,280 870,260 860,220 Z",
  MA: "M 880,150 L 865,165 885,180 910,170 Z",
  MI: "M 660,120 L 640,180 680,200 730,180 740,140 700,100 Z",
  MN: "M 540,80 L 520,160 570,200 620,180 640,100 590,60 Z",
  MS: "M 640,340 L 620,420 660,460 700,440 710,370 670,330 Z",
  MO: "M 560,260 L 540,340 600,370 660,350 670,280 610,250 Z",
  MT: "M 280,60 L 260,120 340,140 420,120 430,60 350,40 Z",
  NE: "M 420,200 L 400,260 480,270 560,260 570,200 490,190 Z",
  NV: "M 180,200 L 160,300 200,360 250,340 260,240 220,180 Z",
  NH: "M 890,100 L 880,140 900,160 920,140 Z",
  NJ: "M 850,190 L 840,220 860,240 875,220 Z",
  NM: "M 320,320 L 300,400 360,430 420,410 430,330 370,300 Z",
  NY: "M 820,120 L 790,180 840,200 880,180 890,130 850,100 Z",
  NC: "M 780,300 L 760,340 820,360 880,340 890,300 840,280 Z",
  ND: "M 440,80 L 420,140 480,160 540,140 550,80 490,60 Z",
  OH: "M 720,200 L 700,260 740,290 790,270 800,210 760,180 Z",
  OK: "M 440,320 L 420,380 500,400 570,380 580,330 500,300 Z",
  OR: "M 120,100 L 100,160 160,200 220,180 230,120 180,80 Z",
  PA: "M 780,180 L 760,220 810,250 860,230 870,180 820,160 Z",
  RI: "M 890,165 L 885,175 895,180 Z",
  SC: "M 780,340 L 760,380 800,400 840,380 850,340 810,320 Z",
  SD: "M 440,140 L 420,200 480,220 540,200 550,140 490,120 Z",
  TN: "M 680,320 L 660,350 740,370 820,350 830,320 750,300 Z",
  TX: "M 380,360 L 340,480 420,540 540,520 580,420 520,340 Z",
  UT: "M 260,200 L 240,280 290,320 340,300 350,220 300,180 Z",
  VT: "M 880,100 L 870,130 890,150 910,130 Z",
  VA: "M 780,260 L 760,300 820,320 880,300 890,260 840,240 Z",
  WA: "M 160,40 L 140,100 200,130 260,110 270,50 220,20 Z",
  WV: "M 760,240 L 740,280 780,300 820,280 830,240 790,220 Z",
  WI: "M 600,120 L 580,180 620,210 670,190 680,130 640,100 Z",
  WY: "M 320,140 L 300,200 360,220 420,200 430,140 370,120 Z",
  DC: "M 830,250 L 825,260 840,265 845,255 Z",
};

const statePositions: Record<string, { x: number; y: number }> = {
  AL: { x: 0.42, y: 0.62 },
  AK: { x: -0.6, y: 0.8 },
  AZ: { x: -0.35, y: 0.5 },
  AR: { x: 0.22, y: 0.55 },
  CA: { x: -0.55, y: 0.35 },
  CO: { x: -0.15, y: 0.4 },
  CT: { x: 0.72, y: 0.22 },
  DE: { x: 0.68, y: 0.32 },
  FL: { x: 0.52, y: 0.78 },
  GA: { x: 0.48, y: 0.62 },
  HI: { x: -0.4, y: 0.9 },
  ID: { x: -0.38, y: 0.12 },
  IL: { x: 0.32, y: 0.38 },
  IN: { x: 0.4, y: 0.38 },
  IA: { x: 0.22, y: 0.28 },
  KS: { x: 0.05, y: 0.45 },
  KY: { x: 0.42, y: 0.45 },
  LA: { x: 0.25, y: 0.72 },
  ME: { x: 0.78, y: 0.02 },
  MD: { x: 0.65, y: 0.35 },
  MA: { x: 0.75, y: 0.18 },
  MI: { x: 0.42, y: 0.18 },
  MN: { x: 0.22, y: 0.1 },
  MS: { x: 0.35, y: 0.65 },
  MO: { x: 0.22, y: 0.45 },
  MT: { x: -0.22, y: 0.05 },
  NE: { x: 0.02, y: 0.3 },
  NV: { x: -0.48, y: 0.28 },
  NH: { x: 0.75, y: 0.1 },
  NJ: { x: 0.7, y: 0.28 },
  NM: { x: -0.18, y: 0.55 },
  NY: { x: 0.68, y: 0.18 },
  NC: { x: 0.58, y: 0.48 },
  ND: { x: 0.02, y: 0.08 },
  OH: { x: 0.48, y: 0.32 },
  OK: { x: 0.05, y: 0.52 },
  OR: { x: -0.52, y: 0.08 },
  PA: { x: 0.62, y: 0.25 },
  RI: { x: 0.76, y: 0.2 },
  SC: { x: 0.55, y: 0.55 },
  SD: { x: 0.02, y: 0.18 },
  TN: { x: 0.42, y: 0.5 },
  TX: { x: -0.02, y: 0.68 },
  UT: { x: -0.32, y: 0.35 },
  VT: { x: 0.72, y: 0.08 },
  VA: { x: 0.6, y: 0.4 },
  WA: { x: -0.48, y: -0.02 },
  WV: { x: 0.55, y: 0.38 },
  WI: { x: 0.32, y: 0.18 },
  WY: { x: -0.15, y: 0.2 },
  DC: { x: 0.64, y: 0.36 },
};

const stateSizes: Record<string, number> = {
  TX: 1.8, CA: 1.5, MT: 1.3, AZ: 1.2, NV: 1.1, CO: 1.1, NM: 1.1,
  OR: 1.0, WY: 1.0, MI: 0.95, UT: 0.9, ID: 0.9, KS: 0.9, NE: 0.9,
  SD: 0.85, ND: 0.85, MN: 0.95, OK: 0.9, MO: 0.85, WA: 0.85,
  GA: 0.8, FL: 0.85, IL: 0.8, IA: 0.75, WI: 0.75, NY: 0.8,
  NC: 0.8, PA: 0.75, OH: 0.7, VA: 0.7, TN: 0.7, KY: 0.65,
  IN: 0.6, ME: 0.6, SC: 0.55, WV: 0.5, LA: 0.6, MS: 0.6,
  AL: 0.6, AR: 0.55, MD: 0.4, VT: 0.35, NH: 0.35, MA: 0.4,
  NJ: 0.35, CT: 0.3, DE: 0.25, RI: 0.2, DC: 0.15, HI: 0.5, AK: 1.0,
};

export default function USMap3D({ onStateClick }: USMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const statesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const targetPositionsRef = useRef<Map<string, number>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const hoveredStateRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);

  const getStateColor = useCallback((abbreviation: string): string => {
    const state = statesData.find(s => s.abbreviation === abbreviation);
    if (!state) return stateColors.ineligible;
    if (!state.isEligible) return stateColors.ineligible;
    if (state.loanVolume >= 50000000) return stateColors.high;
    if (state.loanVolume >= 10000000) return stateColors.medium;
    return stateColors.low;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xe55c2b, 0.5, 20);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    Object.entries(statePositions).forEach(([abbr, pos]) => {
      const size = stateSizes[abbr] || 0.5;
      const color = getStateColor(abbr);
      
      const geometry = new THREE.BoxGeometry(size * 0.5, size * 0.4, 0.15);
      
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        shininess: 30,
        specular: new THREE.Color(0x444444),
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      const sphereRadius = 4;
      const x = pos.x * 3;
      const y = -pos.y * 2.5 + 1.2;
      
      const distFromCenter = Math.sqrt(x * x + y * y);
      const curveAmount = Math.pow(distFromCenter / 4, 2) * 0.8;
      const z = -curveAmount;

      mesh.position.set(x, y, z);
      
      const lookAtPoint = new THREE.Vector3(x * 0.3, y * 0.3, 5);
      mesh.lookAt(lookAtPoint);
      mesh.rotateX(Math.PI * 0.1);

      mesh.userData = { abbreviation: abbr, baseZ: z };
      
      statesRef.current.set(abbr, mesh);
      targetPositionsRef.current.set(abbr, z);
      scene.add(mesh);
    });

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(Array.from(statesRef.current.values()));
      
      if (intersects.length > 0) {
        const abbr = intersects[0].object.userData.abbreviation;
        if (hoveredStateRef.current !== abbr) {
          hoveredStateRef.current = abbr;
          const state = statesData.find(s => s.abbreviation === abbr);
          setHoveredState(state || null);
        }
      } else {
        if (hoveredStateRef.current !== null) {
          hoveredStateRef.current = null;
          setHoveredState(null);
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / width) * 2 - 1,
        -((event.clientY - rect.top) / height) * 2 + 1
      );
      
      raycasterRef.current.setFromCamera(mouse, camera);
      const intersects = raycasterRef.current.intersectObjects(Array.from(statesRef.current.values()));
      
      if (intersects.length > 0 && onStateClick) {
        const abbr = intersects[0].object.userData.abbreviation;
        const state = statesData.find(s => s.abbreviation === abbr);
        if (state) {
          onStateClick(state);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const mouse3D = new THREE.Vector3(mouseRef.current.x * 4, mouseRef.current.y * 3, 2);

      statesRef.current.forEach((mesh, abbr) => {
        const baseZ = mesh.userData.baseZ;
        const distance = mesh.position.distanceTo(mouse3D);
        
        const magnetStrength = 1.2;
        const magnetRadius = 2.5;
        
        let targetZ = baseZ;
        if (distance < magnetRadius) {
          const influence = Math.pow(1 - distance / magnetRadius, 2);
          targetZ = baseZ + influence * magnetStrength;
        }
        
        if (hoveredStateRef.current === abbr) {
          targetZ += 0.3;
        }

        const currentZ = mesh.position.z;
        const newZ = currentZ + (targetZ - currentZ) * 0.08;
        mesh.position.z = newZ;

        const material = mesh.material as THREE.MeshPhongMaterial;
        if (hoveredStateRef.current === abbr) {
          material.emissive = new THREE.Color(0xe55c2b);
          material.emissiveIntensity = 0.3;
        } else {
          material.emissive = new THREE.Color(0x000000);
          material.emissiveIntensity = 0;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 500;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameRef.current);
      
      statesRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      statesRef.current.clear();
      
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [getStateColor, onStateClick]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="w-full h-[500px] rounded-lg overflow-hidden cursor-pointer"
        data-testid="map-3d-container"
      />
      
      {hoveredState && (
        <div 
          className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg pointer-events-none z-10"
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
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm border rounded-lg p-3 text-sm" data-testid="map-legend">
        <p className="font-medium mb-2">Loan Volume</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stateColors.high }} />
            <span className="text-xs">$50M+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stateColors.medium }} />
            <span className="text-xs">$10M - $50M</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stateColors.low }} />
            <span className="text-xs">Under $10M</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stateColors.ineligible }} />
            <span className="text-xs">Not Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
