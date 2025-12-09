import { useState, useEffect, useMemo } from "react";
import { STATE_BOUNDARIES } from "@/data/stateBoundaries";
import type { MarketDetail } from "@/data/marketDetails";

interface StateMapGlobeProps {
  stateSlug: string;
  stateName: string;
  markets?: MarketDetail[];
  selectedMarket?: MarketDetail | null;
  hoveredMarket?: MarketDetail | null;
  onMarkerClick?: (market: MarketDetail) => void;
  onMarkerHover?: (market: MarketDetail | null) => void;
  className?: string;
}

const US_BOUNDS = {
  minLat: 24.396308,
  maxLat: 49.384358,
  minLng: -125.0,
  maxLng: -66.93457,
};

export function StateMapGlobe({
  stateSlug,
  stateName,
  markets = [],
  selectedMarket,
  hoveredMarket,
  onMarkerClick,
  onMarkerHover,
  className = "",
}: StateMapGlobeProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    const loadTimer = setTimeout(() => setHasLoaded(true), 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  const boundary = STATE_BOUNDARIES[stateSlug];

  const { pathData, viewBox, markerPositions, stateCenter, usBackgroundPaths } = useMemo(() => {
    if (!boundary || !boundary.coordinates || boundary.coordinates.length === 0) {
      return { pathData: "", viewBox: "0 0 100 100", markerPositions: [], stateCenter: { x: 50, y: 50 }, usBackgroundPaths: [] };
    }

    const coords = boundary.coordinates;
    
    const lats = coords.map(c => c.lat);
    const lngs = coords.map(c => c.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
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

    const bgPaths: { slug: string; path: string }[] = [];
    Object.entries(STATE_BOUNDARIES).forEach(([slug, state]) => {
      if (slug === stateSlug || !state.coordinates || state.coordinates.length === 0) return;
      
      const stateCoords = state.coordinates;
      const stateLats = stateCoords.map(c => c.lat);
      const stateLngs = stateCoords.map(c => c.lng);
      
      const stateMinLat = Math.min(...stateLats);
      const stateMaxLat = Math.max(...stateLats);
      const stateMinLng = Math.min(...stateLngs);
      const stateMaxLng = Math.max(...stateLngs);
      
      const overlapLat = stateMaxLat >= paddedMinLat && stateMinLat <= (paddedMinLat + paddedLatRange);
      const overlapLng = stateMaxLng >= paddedMinLng && stateMinLng <= (paddedMinLng + paddedLngRange);
      
      if (!overlapLat || !overlapLng) return;
      
      const points = stateCoords.map((c, i) => {
        const x = toSvgX(c.lng);
        const y = toSvgY(c.lat);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      });
      points.push("Z");
      
      bgPaths.push({
        slug,
        path: points.join(" "),
      });
    });

    return {
      pathData: pathPoints.join(" "),
      viewBox: `0 0 ${width} ${height}`,
      markerPositions: markerPos,
      stateCenter: { x: toSvgX(centerLng), y: toSvgY(centerLat) },
      usBackgroundPaths: bgPaths,
    };
  }, [boundary, markets, stateSlug]);

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
            viewBox={viewBox}
            className="w-full h-auto"
            style={{
              filter: "drop-shadow(0 25px 40px rgba(0, 0, 0, 0.5))",
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
            </defs>

            <rect x="0" y="0" width="100%" height="100%" fill="#e8e8e8" />
            
            <path
              d={pathData}
              fill={`url(#focus-state-gradient-${stateSlug})`}
              stroke="#a07020"
              strokeWidth="1.5"
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
}
