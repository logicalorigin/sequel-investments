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

  const { pathData, viewBox, markerPositions, bounds } = useMemo(() => {
    if (!boundary || !boundary.coordinates || boundary.coordinates.length === 0) {
      return { pathData: "", viewBox: "0 0 100 100", markerPositions: [], bounds: null };
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
    
    const markerPos = markets.map(market => ({
      market,
      x: toSvgX(market.lng),
      y: toSvgY(market.lat),
    }));

    return {
      pathData: pathPoints.join(" "),
      viewBox: `0 0 ${width} ${height}`,
      markerPositions: markerPos,
      bounds: { width, height },
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
                <rect x="0" y="0" width="100%" height="100%" fill="#e8e8e8" />
                
                <path
                  d={pathData}
                  fill="none"
                  stroke="#a07020"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  filter={`url(#focus-state-shadow-${stateSlug})`}
                  className="transition-all duration-300"
                />
                
                {hasLoaded && markerPositions.map(({ market, x, y }, index) => {
                  const isSelected = selectedMarket?.name === market.name;
                  const isHovered = hoveredMarket?.name === market.name;
                  
                  const population = market.demographics?.population || 500000;
                  const minRadius = 6;
                  let sizeMultiplier = 1;
                  if (population >= 2000000) sizeMultiplier = 1.8;
                  else if (population >= 1000000) sizeMultiplier = 1.5;
                  else if (population >= 500000) sizeMultiplier = 1.2;
                  
                  const baseRadius = minRadius * sizeMultiplier;
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
