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
    
    const padding = 0.4;
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

    const bgPaths: { slug: string; path: string; opacity: number }[] = [];
    Object.entries(STATE_BOUNDARIES).forEach(([slug, state]) => {
      if (slug === stateSlug || !state.coordinates || state.coordinates.length === 0) return;
      
      const stateCoords = state.coordinates;
      const stateLats = stateCoords.map(c => c.lat);
      const stateLngs = stateCoords.map(c => c.lng);
      const stateCenterLat = (Math.min(...stateLats) + Math.max(...stateLats)) / 2;
      const stateCenterLng = (Math.min(...stateLngs) + Math.max(...stateLngs)) / 2;
      
      const distance = Math.sqrt(
        Math.pow(stateCenterLat - centerLat, 2) + 
        Math.pow(stateCenterLng - centerLng, 2)
      );
      
      if (distance > 25) return;
      
      const opacity = Math.max(0.1, 0.4 - distance * 0.015);
      
      const points = stateCoords.map((c, i) => {
        const x = toSvgX(c.lng);
        const y = toSvgY(c.lat);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      });
      points.push("Z");
      
      bgPaths.push({
        slug,
        path: points.join(" "),
        opacity,
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
              <linearGradient id={`globe-gradient-${stateSlug}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--muted))" stopOpacity="0.15" />
                <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.05" />
              </linearGradient>
              
              <linearGradient id={`state-main-gradient-${stateSlug}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
                <stop offset="50%" stopColor="hsl(var(--muted))" />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground) / 0.4)" />
              </linearGradient>
              
              <filter id={`blur-bg-${stateSlug}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              </filter>
              
              <filter id={`glow-${stateSlug}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="hsl(var(--primary))" floodOpacity="0.5" />
              </filter>
              
              <filter id={`marker-glow-${stateSlug}`} x="-100%" y="-100%" width="300%" height="300%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="hsl(var(--primary))" floodOpacity="0.8" />
              </filter>

              <radialGradient id={`vignette-${stateSlug}`} cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="70%" stopColor="transparent" />
                <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.8" />
              </radialGradient>
            </defs>

            {usBackgroundPaths.map(({ slug, path, opacity }) => (
              <path
                key={slug}
                d={path}
                fill={`url(#globe-gradient-${stateSlug})`}
                stroke="hsl(var(--border) / 0.3)"
                strokeWidth="0.5"
                opacity={opacity}
                filter={`url(#blur-bg-${stateSlug})`}
                className="transition-opacity duration-500"
              />
            ))}
            
            <path
              d={pathData}
              fill={`url(#state-main-gradient-${stateSlug})`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinejoin="round"
              filter={`url(#glow-${stateSlug})`}
              className="transition-all duration-300"
            />
            
            {hasLoaded && markerPositions.map(({ market, x, y }, index) => {
              const isSelected = selectedMarket?.name === market.name;
              const isHovered = hoveredMarket?.name === market.name;
              const baseRadius = 8;
              const radius = isSelected ? baseRadius * 1.6 : isHovered ? baseRadius * 1.3 : baseRadius;
              const delay = index * 0.1;
              
              return (
                <g 
                  key={market.name}
                  className="cursor-pointer"
                  onClick={() => onMarkerClick?.(market)}
                  onMouseEnter={() => onMarkerHover?.(market)}
                  onMouseLeave={() => onMarkerHover?.(null)}
                  data-testid={`marker-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {(isSelected || isHovered) && (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        r={radius * 2.5}
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
                        r={radius * 1.8}
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
                    r={radius + 3}
                    fill="hsl(var(--background))"
                    opacity="0.9"
                    filter={isSelected || isHovered ? `url(#marker-glow-${stateSlug})` : undefined}
                    className="transition-all duration-300"
                    style={{
                      animation: `fadeIn 0.5s ease-out ${delay}s both`,
                    }}
                  />
                  
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={isSelected ? "hsl(var(--primary))" : isHovered ? "hsl(var(--primary) / 0.9)" : "hsl(var(--primary) / 0.7)"}
                    stroke="hsl(var(--primary-foreground))"
                    strokeWidth={isSelected || isHovered ? 2.5 : 2}
                    className="transition-all duration-300"
                    style={{
                      animation: `fadeIn 0.5s ease-out ${delay}s both, pulse 2s ease-in-out ${delay + 0.5}s infinite`,
                    }}
                  />
                  
                  {market.rank && market.rank <= 5 && (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-primary-foreground font-bold text-[10px] pointer-events-none select-none"
                      style={{
                        animation: `fadeIn 0.5s ease-out ${delay + 0.2}s both`,
                      }}
                    >
                      {market.rank}
                    </text>
                  )}
                  
                  <text
                    x={x}
                    y={y - radius - 10}
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
