import { useState, useEffect, useMemo, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { STATE_BOUNDARIES } from "@/data/stateBoundaries";
import type { MarketDetail } from "@/data/marketDetails";

export interface MarkerPosition {
  market: MarketDetail;
  x: number;
  y: number;
  screenX?: number;
  screenY?: number;
}

export interface StateMapGlobeHandle {
  getMarkerScreenPosition: (marketName: string) => { x: number; y: number } | null;
}

interface StateMapGlobeProps {
  stateSlug: string;
  stateName: string;
  markets?: MarketDetail[];
  selectedMarket?: MarketDetail | null;
  hoveredMarket?: MarketDetail | null;
  onMarkerClick?: (market: MarketDetail) => void;
  onMarkerHover?: (market: MarketDetail | null) => void;
  onMarkerPositionsUpdate?: (positions: MarkerPosition[]) => void;
  className?: string;
}

export const StateMapGlobe = forwardRef<StateMapGlobeHandle, StateMapGlobeProps>(function StateMapGlobe({
  stateSlug,
  stateName,
  markets = [],
  selectedMarket,
  hoveredMarket,
  onMarkerClick,
  onMarkerHover,
  className = "",
}, ref) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const markerRefs = useRef<Map<string, SVGGElement>>(new Map());

  const getMarkerScreenPosition = useCallback((marketName: string) => {
    const markerElement = markerRefs.current.get(marketName);
    if (!markerElement || !svgRef.current) return null;

    const svgRect = svgRef.current.getBoundingClientRect();
    const markerRect = markerElement.getBoundingClientRect();
    
    return {
      x: markerRect.left + markerRect.width / 2,
      y: markerRect.top + markerRect.height / 2,
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getMarkerScreenPosition,
  }), [getMarkerScreenPosition]);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    const loadTimer = setTimeout(() => setHasLoaded(true), 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  const boundary = STATE_BOUNDARIES[stateSlug];

  const { pathData, viewBox, markerPositions, bounds, overlappingMarkers } = useMemo(() => {
    if (!boundary || !boundary.coordinates || boundary.coordinates.length === 0) {
      return { pathData: "", viewBox: "0 0 100 100", markerPositions: [], bounds: null, overlappingMarkers: new Set<string>() };
    }

    const coords = boundary.coordinates;
    
    const lats = coords.map(c => c.lat);
    const lngs = coords.map(c => c.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    
    const padding = 0.2;
    const paddedLatRange = latRange * (1 + padding * 2);
    const paddedLngRange = lngRange * (1 + padding * 2);
    const paddedMinLat = minLat - latRange * padding;
    const paddedMinLng = minLng - lngRange * padding;
    
    const width = 500;
    const height = 500 * (paddedLatRange / paddedLngRange);
    
    const toSvgX = (lng: number) => ((lng - paddedMinLng) / paddedLngRange) * width;
    const toSvgY = (lat: number) => height - ((lat - paddedMinLat) / paddedLatRange) * height;
    
    const pathPoints = coords.map((c, i) => {
      const x = toSvgX(c.lng);
      const y = toSvgY(c.lat);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    pathPoints.push("Z");
    
    // Calculate initial marker positions
    const initialMarkerPos = markets.map(market => ({
      market,
      x: toSvgX(market.lng),
      y: toSvgY(market.lat),
    }));

    // Collision resolution - simple iterative push-apart algorithm
    const minDistance = 32; // Minimum center-to-center distance
    const markerPadding = 18; // Padding from edges
    const resolvedPositions = [...initialMarkerPos];
    
    // Helper to clamp positions within bounds
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
    
    // Sort by position to process consistently
    const indices = resolvedPositions.map((_, i) => i);
    
    // Iterative separation - push overlapping markers apart
    for (let iterations = 0; iterations < 50; iterations++) {
      let moved = false;
      
      for (let i = 0; i < resolvedPositions.length; i++) {
        for (let j = i + 1; j < resolvedPositions.length; j++) {
          const dx = resolvedPositions[j].x - resolvedPositions[i].x;
          const dy = resolvedPositions[j].y - resolvedPositions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < minDistance && distance > 0.01) {
            moved = true;
            const overlap = minDistance - distance;
            const moveAmount = overlap * 0.6; // Move more than half to converge faster
            
            // Unit vector from i to j
            const ux = dx / distance;
            const uy = dy / distance;
            
            // Try to move j away from i (positive direction)
            const newJx = clamp(resolvedPositions[j].x + ux * moveAmount, markerPadding, width - markerPadding);
            const newJy = clamp(resolvedPositions[j].y + uy * moveAmount, markerPadding, height - markerPadding);
            
            // Calculate how much j actually moved
            const jMovedX = newJx - resolvedPositions[j].x;
            const jMovedY = newJy - resolvedPositions[j].y;
            const jMoved = Math.sqrt(jMovedX * jMovedX + jMovedY * jMovedY);
            
            resolvedPositions[j].x = newJx;
            resolvedPositions[j].y = newJy;
            
            // If j didn't move enough (hit boundary), move i the other way
            if (jMoved < moveAmount * 0.5) {
              const remainingMove = moveAmount - jMoved;
              resolvedPositions[i].x = clamp(resolvedPositions[i].x - ux * remainingMove, markerPadding, width - markerPadding);
              resolvedPositions[i].y = clamp(resolvedPositions[i].y - uy * remainingMove, markerPadding, height - markerPadding);
            }
          } else if (distance <= 0.01) {
            // Markers at same position - push apart in arbitrary direction
            moved = true;
            resolvedPositions[j].x = clamp(resolvedPositions[j].x + minDistance * 0.7, markerPadding, width - markerPadding);
            if (resolvedPositions[j].x === resolvedPositions[i].x) {
              resolvedPositions[j].y = clamp(resolvedPositions[j].y + minDistance * 0.7, markerPadding, height - markerPadding);
            }
          }
        }
      }
      
      if (!moved) break;
    }
    
    // Final enforcement: exhaustive search for valid positions
    const directions = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }
    ];
    
    for (let pass = 0; pass < 5; pass++) {
      let resolved = true;
      
      for (let i = 0; i < resolvedPositions.length; i++) {
        for (let j = i + 1; j < resolvedPositions.length; j++) {
          const dx = resolvedPositions[j].x - resolvedPositions[i].x;
          const dy = resolvedPositions[j].y - resolvedPositions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < minDistance) {
            resolved = false;
            
            // Try moving both markers in opposite directions
            let bestSeparation = distance;
            let bestIx = resolvedPositions[i].x;
            let bestIy = resolvedPositions[i].y;
            let bestJx = resolvedPositions[j].x;
            let bestJy = resolvedPositions[j].y;
            
            // Try all combinations of directions for both markers
            for (const dirI of directions) {
              for (const dirJ of directions) {
                const halfMove = minDistance / 2;
                const testIx = clamp(resolvedPositions[i].x + dirI.x * halfMove, markerPadding, width - markerPadding);
                const testIy = clamp(resolvedPositions[i].y + dirI.y * halfMove, markerPadding, height - markerPadding);
                const testJx = clamp(resolvedPositions[j].x + dirJ.x * halfMove, markerPadding, width - markerPadding);
                const testJy = clamp(resolvedPositions[j].y + dirJ.y * halfMove, markerPadding, height - markerPadding);
                
                const newDx = testJx - testIx;
                const newDy = testJy - testIy;
                const newDist = Math.sqrt(newDx * newDx + newDy * newDy);
                
                if (newDist > bestSeparation) {
                  bestSeparation = newDist;
                  bestIx = testIx;
                  bestIy = testIy;
                  bestJx = testJx;
                  bestJy = testJy;
                }
              }
            }
            
            // Apply best found positions
            resolvedPositions[i].x = bestIx;
            resolvedPositions[i].y = bestIy;
            resolvedPositions[j].x = bestJx;
            resolvedPositions[j].y = bestJy;
          }
        }
      }
      
      if (resolved) break;
    }
    
    // Phase 3: Slack-based separation with inward-normal release
    // Helper: calculate available slack (how far marker can move in direction before hitting boundary)
    const availableSlack = (x: number, y: number, dirX: number, dirY: number, pad: number): number => {
      let maxT = Infinity;
      if (Math.abs(dirX) > 0.001) {
        if (dirX > 0) maxT = Math.min(maxT, (width - pad - x) / dirX);
        else maxT = Math.min(maxT, (pad - x) / dirX);
      }
      if (Math.abs(dirY) > 0.001) {
        if (dirY > 0) maxT = Math.min(maxT, (height - pad - y) / dirY);
        else maxT = Math.min(maxT, (pad - y) / dirY);
      }
      return Math.max(0, maxT);
    };
    
    // Helper: get inward normal for a position (direction toward center from boundary)
    const getInwardNormal = (x: number, y: number, pad: number): { nx: number; ny: number } => {
      let nx = 0, ny = 0;
      const epsilon = 1;
      if (x <= pad + epsilon) nx = 1;
      else if (x >= width - pad - epsilon) nx = -1;
      if (y <= pad + epsilon) ny = 1;
      else if (y >= height - pad - epsilon) ny = -1;
      const len = Math.sqrt(nx * nx + ny * ny);
      if (len > 0) { nx /= len; ny /= len; }
      return { nx, ny };
    };
    
    // Main separation loop with slack distribution
    for (let iteration = 0; iteration < 30; iteration++) {
      let anyOverlap = false;
      
      for (let i = 0; i < resolvedPositions.length; i++) {
        for (let j = i + 1; j < resolvedPositions.length; j++) {
          const dx = resolvedPositions[j].x - resolvedPositions[i].x;
          const dy = resolvedPositions[j].y - resolvedPositions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < minDistance) {
            anyOverlap = true;
            const needed = minDistance - distance + 1; // Safety margin to ensure >= minDistance
            
            // Get separation direction
            let dirX: number, dirY: number;
            if (distance > 0.01) {
              dirX = dx / distance;
              dirY = dy / distance;
            } else {
              // Coincident markers - use diagonal
              dirX = 0.707;
              dirY = 0.707;
            }
            
            // Calculate slack: i moves in -dir, j moves in +dir
            const slackI = availableSlack(resolvedPositions[i].x, resolvedPositions[i].y, -dirX, -dirY, markerPadding);
            const slackJ = availableSlack(resolvedPositions[j].x, resolvedPositions[j].y, dirX, dirY, markerPadding);
            const totalSlack = slackI + slackJ;
            
            if (totalSlack >= needed) {
              // Sufficient slack - distribute proportionally
              const ratioI = totalSlack > 0 ? slackI / totalSlack : 0.5;
              const moveI = Math.min(slackI, needed * ratioI);
              const moveJ = Math.min(slackJ, needed * (1 - ratioI));
              
              resolvedPositions[i].x = clamp(resolvedPositions[i].x - dirX * moveI, markerPadding, width - markerPadding);
              resolvedPositions[i].y = clamp(resolvedPositions[i].y - dirY * moveI, markerPadding, height - markerPadding);
              resolvedPositions[j].x = clamp(resolvedPositions[j].x + dirX * moveJ, markerPadding, width - markerPadding);
              resolvedPositions[j].y = clamp(resolvedPositions[j].y + dirY * moveJ, markerPadding, height - markerPadding);
            } else {
              // Insufficient slack - release pinned markers by moving inward
              const release = (needed - totalSlack) / 2 + 2;
              
              const normI = getInwardNormal(resolvedPositions[i].x, resolvedPositions[i].y, markerPadding);
              const normJ = getInwardNormal(resolvedPositions[j].x, resolvedPositions[j].y, markerPadding);
              
              // Move markers inward along their boundary normals
              if (normI.nx !== 0 || normI.ny !== 0) {
                resolvedPositions[i].x = clamp(resolvedPositions[i].x + normI.nx * release, markerPadding, width - markerPadding);
                resolvedPositions[i].y = clamp(resolvedPositions[i].y + normI.ny * release, markerPadding, height - markerPadding);
              }
              if (normJ.nx !== 0 || normJ.ny !== 0) {
                resolvedPositions[j].x = clamp(resolvedPositions[j].x + normJ.nx * release, markerPadding, width - markerPadding);
                resolvedPositions[j].y = clamp(resolvedPositions[j].y + normJ.ny * release, markerPadding, height - markerPadding);
              }
              
              // If both markers have no inward normal (not at boundary), use direct separation
              if ((normI.nx === 0 && normI.ny === 0) && (normJ.nx === 0 && normJ.ny === 0)) {
                resolvedPositions[i].x = clamp(resolvedPositions[i].x - dirX * needed / 2, markerPadding, width - markerPadding);
                resolvedPositions[i].y = clamp(resolvedPositions[i].y - dirY * needed / 2, markerPadding, height - markerPadding);
                resolvedPositions[j].x = clamp(resolvedPositions[j].x + dirX * needed / 2, markerPadding, width - markerPadding);
                resolvedPositions[j].y = clamp(resolvedPositions[j].y + dirY * needed / 2, markerPadding, height - markerPadding);
              }
            }
          }
        }
      }
      
      if (!anyOverlap) break;
    }

    // Phase 4: Fallback with relaxed padding if still overlapping
    for (let relaxedPad = markerPadding - 4; relaxedPad >= 4; relaxedPad -= 4) {
      let resolved = true;
      for (let i = 0; i < resolvedPositions.length; i++) {
        for (let j = i + 1; j < resolvedPositions.length; j++) {
          const dx = resolvedPositions[j].x - resolvedPositions[i].x;
          const dy = resolvedPositions[j].y - resolvedPositions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < minDistance) {
            resolved = false;
            const needed = minDistance - distance + 1;
            let dirX = distance > 0.01 ? dx / distance : 0.707;
            let dirY = distance > 0.01 ? dy / distance : 0.707;
            resolvedPositions[i].x = clamp(resolvedPositions[i].x - dirX * needed / 2, relaxedPad, width - relaxedPad);
            resolvedPositions[i].y = clamp(resolvedPositions[i].y - dirY * needed / 2, relaxedPad, height - relaxedPad);
            resolvedPositions[j].x = clamp(resolvedPositions[j].x + dirX * needed / 2, relaxedPad, width - relaxedPad);
            resolvedPositions[j].y = clamp(resolvedPositions[j].y + dirY * needed / 2, relaxedPad, height - relaxedPad);
          }
        }
      }
      if (resolved) break;
    }

    // Phase 5: Final check - any remaining overlaps get visual fallback
    const overlappingMarkers = new Set<string>();
    for (let i = 0; i < resolvedPositions.length; i++) {
      for (let j = i + 1; j < resolvedPositions.length; j++) {
        const dx = resolvedPositions[j].x - resolvedPositions[i].x;
        const dy = resolvedPositions[j].y - resolvedPositions[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          overlappingMarkers.add(resolvedPositions[i].market.name);
          overlappingMarkers.add(resolvedPositions[j].market.name);
        }
      }
    }

    return {
      pathData: pathPoints.join(" "),
      viewBox: `0 0 ${width} ${height}`,
      markerPositions: resolvedPositions,
      bounds: { width, height },
      overlappingMarkers,
    };
  }, [boundary, markets, stateSlug]);

  const zoomTransform = useMemo(() => {
    if (!selectedMarket || !bounds) {
      return { transform: "translate(0, 0) scale(1)", transformOrigin: "center center" };
    }

    const targetMarker = markerPositions.find(m => m.market.name === selectedMarket.name);
    if (!targetMarker) {
      return { transform: "translate(0, 0) scale(1)", transformOrigin: "center center" };
    }

    const zoomLevel = 2.0;
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    
    const translateX = (centerX - targetMarker.x) * zoomLevel;
    const translateY = (centerY - targetMarker.y) * zoomLevel;

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`,
      transformOrigin: `${centerX}px ${centerY}px`,
    };
  }, [selectedMarket, bounds, markerPositions]);

  if (!boundary || !pathData) {
    return (
      <div className={`flex items-center justify-center bg-muted/20 rounded-lg ${className}`}>
        <p className="text-muted-foreground">Map not available for {stateName}</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="relative w-full transition-all duration-1000 ease-out"
        style={{
          perspective: "800px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          className="transition-all duration-1000 ease-out"
          style={{
            transform: isAnimated 
              ? "rotateX(-8deg) scale(1)" 
              : "rotateX(-25deg) scale(0.6)",
            transformStyle: "preserve-3d",
            opacity: isAnimated ? 1 : 0,
          }}
        >
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="w-full h-auto"
            style={{
              filter: "drop-shadow(0 25px 40px rgba(0, 0, 0, 0.5))",
              overflow: "hidden",
            }}
          >
            <defs>
              <linearGradient id={`focus-state-gradient-${stateSlug}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4a030" stopOpacity="1" />
                <stop offset="100%" stopColor="#c49020" stopOpacity="1" />
              </linearGradient>
              
              <filter id={`focus-state-shadow-${stateSlug}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.2)" />
              </filter>
              
              <filter id={`marker-glow-${stateSlug}`} x="-100%" y="-100%" width="300%" height="300%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="hsl(var(--primary))" floodOpacity="0.8" />
              </filter>

              <clipPath id={`map-clip-${stateSlug}`}>
                <rect x="0" y="0" width={bounds?.width || 500} height={bounds?.height || 500} />
              </clipPath>
            </defs>

            <g clipPath={`url(#map-clip-${stateSlug})`}>
              <g
                id="zoom-content"
                style={{
                  transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  ...zoomTransform,
                }}
              >
                <rect x="0" y="0" width="100%" height="100%" fill="#f5f5f5" />
                
                <path
                  d={pathData}
                  fill="hsl(var(--primary) / 0.15)"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  filter={`url(#focus-state-shadow-${stateSlug})`}
                  className="transition-all duration-300"
                />
                
                {hasLoaded && markerPositions.map(({ market, x, y }, index) => {
                  const isSelected = selectedMarket?.name === market.name;
                  const isHovered = hoveredMarket?.name === market.name;
                  const isOverlapping = overlappingMarkers.has(market.name);
                  
                  const population = market.demographics?.population || 500000;
                  const minRadius = 6;
                  let sizeMultiplier = 1;
                  if (population >= 2000000) sizeMultiplier = 1.8;
                  else if (population >= 1000000) sizeMultiplier = 1.5;
                  else if (population >= 500000) sizeMultiplier = 1.2;
                  
                  // Reduce size for overlapping markers to prevent visual overlap
                  const overlapReduction = isOverlapping ? 0.7 : 1;
                  const baseRadius = minRadius * sizeMultiplier * overlapReduction;
                  const radius = isSelected ? baseRadius * 1.4 : isHovered ? baseRadius * 1.2 : baseRadius;
                  const ringWidth = radius * 0.4;
                  const outerRadius = radius + ringWidth;
                  const delay = index * 0.1;
                  
                  return (
                    <g 
                      key={market.name}
                      ref={(el) => {
                        if (el) markerRefs.current.set(market.name, el);
                      }}
                      className="cursor-pointer"
                      onClick={() => onMarkerClick?.(market)}
                      onMouseEnter={() => onMarkerHover?.(market)}
                      onMouseLeave={() => onMarkerHover?.(null)}
                      data-testid={`marker-${market.id || market.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {(isSelected || isHovered) && (
                        <>
                          <circle
                            cx={x}
                            cy={y}
                            r={outerRadius * 2.2}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="1"
                            opacity="0.3"
                            className="animate-ping"
                            style={{ animationDuration: "1.5s" }}
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r={outerRadius * 1.6}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="1.5"
                            opacity="0.5"
                            className="animate-ping"
                            style={{ animationDuration: "2s", animationDelay: "0.3s" }}
                          />
                        </>
                      )}
                      
                      <circle
                        cx={x}
                        cy={y}
                        r={outerRadius + 4}
                        fill="hsl(var(--primary) / 0.15)"
                        className="transition-all duration-300"
                        style={{
                          filter: isSelected || isHovered ? "blur(4px)" : "blur(3px)",
                          opacity: isSelected ? 0.8 : isHovered ? 0.6 : 0.4,
                          animation: `fadeIn 0.5s ease-out ${delay}s both`,
                        }}
                      />
                      
                      <circle
                        cx={x}
                        cy={y}
                        r={outerRadius}
                        fill="white"
                        className="transition-all duration-300"
                        style={{
                          filter: isSelected || isHovered 
                            ? "drop-shadow(0 3px 8px rgba(0,0,0,0.35))" 
                            : "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                          animation: `fadeIn 0.5s ease-out ${delay}s both`,
                        }}
                      />
                      
                      <circle
                        cx={x}
                        cy={y}
                        r={radius}
                        fill="hsl(var(--primary))"
                        className="transition-all duration-300"
                        style={{
                          filter: isSelected || isHovered 
                            ? "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))" 
                            : undefined,
                          animation: `fadeIn 0.5s ease-out ${delay}s both`,
                        }}
                      />
                      
                      {market.rank && market.rank <= 5 && (
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="fill-primary-foreground font-bold text-[8px] pointer-events-none select-none"
                          style={{
                            animation: `fadeIn 0.5s ease-out ${delay + 0.2}s both`,
                          }}
                        >
                          {market.rank}
                        </text>
                      )}
                      
                      <text
                        x={x}
                        y={y - outerRadius - 8}
                        textAnchor="middle"
                        className={`font-semibold text-[11px] pointer-events-none select-none transition-all duration-300 ${
                          isSelected || isHovered 
                            ? 'fill-primary opacity-100' 
                            : 'fill-foreground opacity-80'
                        }`}
                        style={{
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                          animation: `fadeIn 0.5s ease-out ${delay + 0.3}s both`,
                        }}
                      >
                        {market.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
});
