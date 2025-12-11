import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import {
  MapPin,
  TrendingUp,
  Home,
  DollarSign,
  ArrowRight,
  Building2,
  ChevronRight,
  Sparkles,
  Users,
  GraduationCap,
  Percent,
  Star,
  CheckCircle,
} from "lucide-react";
import { statePaths } from "./USMap";
import { MarketDetailDrawer } from "@/components/MarketDetailDrawer";
import { 
  getMarketDetails, 
  generateMarketDetailFromBasicData,
  type MarketDetail 
} from "@/data/marketDetails";

// Map state slugs to abbreviations
const SLUG_TO_ABBR: Record<string, string> = {
  "california": "CA", "texas": "TX", "florida": "FL", "new-york": "NY",
  "arizona": "AZ", "colorado": "CO", "georgia": "GA", "nevada": "NV",
  "north-carolina": "NC", "tennessee": "TN", "washington": "WA",
  "south-carolina": "SC", "idaho": "ID", "utah": "UT", "oregon": "OR",
  "alabama": "AL", "kentucky": "KY", "louisiana": "LA", "ohio": "OH",
  "indiana": "IN", "michigan": "MI", "missouri": "MO", "maryland": "MD",
  "virginia": "VA", "pennsylvania": "PA", "new-jersey": "NJ",
  "massachusetts": "MA", "illinois": "IL", "minnesota": "MN",
  "wisconsin": "WI", "iowa": "IA", "kansas": "KS", "nebraska": "NE",
  "oklahoma": "OK", "arkansas": "AR", "mississippi": "MS",
  "new-mexico": "NM", "montana": "MT", "wyoming": "WY",
  "north-dakota": "ND", "south-dakota": "SD", "west-virginia": "WV",
  "connecticut": "CT", "new-hampshire": "NH", "maine": "ME",
  "vermont": "VT", "rhode-island": "RI", "delaware": "DE",
  "district-of-columbia": "DC", "hawaii": "HI", "alaska": "AK",
};

// Get the bounding box for a state path to calculate its center
// Properly handles both absolute (M,L) and relative (m,l) SVG commands
function getPathBounds(pathD: string): { minX: number; minY: number; maxX: number; maxY: number; centerX: number; centerY: number } {
  const points: { x: number; y: number }[] = [];
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  
  // Split path into commands - handles M, m, L, l, H, h, V, v, Z, z, C, c, S, s, Q, q, T, t, A, a
  const commands = pathD.match(/[MmLlHhVvZzCcSsQqTtAa][^MmLlHhVvZzCcSsQqTtAa]*/g) || [];
  
  for (const cmd of commands) {
    const type = cmd[0];
    const args = cmd.slice(1).trim().split(/[\s,]+/).filter(s => s).map(Number);
    
    switch (type) {
      case 'M': // Absolute moveto
        for (let i = 0; i < args.length; i += 2) {
          currentX = args[i];
          currentY = args[i + 1];
          if (i === 0) { startX = currentX; startY = currentY; }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'm': // Relative moveto
        for (let i = 0; i < args.length; i += 2) {
          currentX += args[i];
          currentY += args[i + 1];
          if (i === 0) { startX = currentX; startY = currentY; }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'L': // Absolute lineto
        for (let i = 0; i < args.length; i += 2) {
          currentX = args[i];
          currentY = args[i + 1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'l': // Relative lineto
        for (let i = 0; i < args.length; i += 2) {
          currentX += args[i];
          currentY += args[i + 1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'H': // Absolute horizontal
        for (const x of args) {
          currentX = x;
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'h': // Relative horizontal
        for (const dx of args) {
          currentX += dx;
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'V': // Absolute vertical
        for (const y of args) {
          currentY = y;
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'v': // Relative vertical
        for (const dy of args) {
          currentY += dy;
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'C': // Absolute cubic bezier
        for (let i = 0; i < args.length; i += 6) {
          points.push({ x: args[i], y: args[i + 1] });
          points.push({ x: args[i + 2], y: args[i + 3] });
          currentX = args[i + 4];
          currentY = args[i + 5];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'c': // Relative cubic bezier
        for (let i = 0; i < args.length; i += 6) {
          points.push({ x: currentX + args[i], y: currentY + args[i + 1] });
          points.push({ x: currentX + args[i + 2], y: currentY + args[i + 3] });
          currentX += args[i + 4];
          currentY += args[i + 5];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'Z':
      case 'z': // Close path
        currentX = startX;
        currentY = startY;
        break;
      default:
        // For other commands (Q, S, T, A), just track the endpoint if present
        if (args.length >= 2) {
          const isRelative = type === type.toLowerCase();
          if (isRelative) {
            currentX += args[args.length - 2];
            currentY += args[args.length - 1];
          } else {
            currentX = args[args.length - 2];
            currentY = args[args.length - 1];
          }
          points.push({ x: currentX, y: currentY });
        }
    }
  }
  
  if (points.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100, centerX: 50, centerY: 50 };
  
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}

// Geographic center (lat/lng) for each state - used to calculate marker offsets
const STATE_GEO_CENTERS: Record<string, { lat: number; lng: number }> = {
  "AL": { lat: 32.8, lng: -86.8 }, "AK": { lat: 64.0, lng: -153.0 }, "AZ": { lat: 34.2, lng: -111.5 },
  "AR": { lat: 35.0, lng: -92.5 }, "CA": { lat: 37.0, lng: -120.0 }, "CO": { lat: 39.0, lng: -105.5 },
  "CT": { lat: 41.6, lng: -72.7 }, "DE": { lat: 39.0, lng: -75.5 }, "FL": { lat: 28.0, lng: -82.5 },
  "GA": { lat: 32.7, lng: -83.5 }, "HI": { lat: 20.8, lng: -156.3 }, "ID": { lat: 44.0, lng: -114.5 },
  "IL": { lat: 40.0, lng: -89.0 }, "IN": { lat: 40.0, lng: -86.2 }, "IA": { lat: 42.0, lng: -93.5 },
  "KS": { lat: 38.5, lng: -98.5 }, "KY": { lat: 37.8, lng: -85.8 }, "LA": { lat: 31.0, lng: -92.0 },
  "ME": { lat: 45.3, lng: -69.0 }, "MD": { lat: 39.0, lng: -76.7 }, "MA": { lat: 42.4, lng: -71.4 },
  "MI": { lat: 44.3, lng: -85.5 }, "MN": { lat: 46.0, lng: -94.5 }, "MS": { lat: 32.7, lng: -89.7 },
  "MO": { lat: 38.5, lng: -92.5 }, "MT": { lat: 47.0, lng: -110.0 }, "NE": { lat: 41.5, lng: -99.8 },
  "NV": { lat: 39.0, lng: -117.0 }, "NH": { lat: 43.5, lng: -71.5 }, "NJ": { lat: 40.2, lng: -74.7 },
  "NM": { lat: 34.5, lng: -106.0 }, "NY": { lat: 43.0, lng: -75.5 }, "NC": { lat: 35.5, lng: -79.5 },
  "ND": { lat: 47.5, lng: -100.5 }, "OH": { lat: 40.4, lng: -82.8 }, "OK": { lat: 35.5, lng: -97.5 },
  "OR": { lat: 44.0, lng: -120.5 }, "PA": { lat: 41.0, lng: -77.5 }, "RI": { lat: 41.7, lng: -71.5 },
  "SC": { lat: 34.0, lng: -81.0 }, "SD": { lat: 44.4, lng: -100.2 }, "TN": { lat: 35.8, lng: -86.0 },
  "TX": { lat: 31.0, lng: -100.0 }, "UT": { lat: 39.3, lng: -111.5 }, "VT": { lat: 44.0, lng: -72.7 },
  "VA": { lat: 37.5, lng: -78.5 }, "WA": { lat: 47.5, lng: -120.5 }, "WV": { lat: 38.9, lng: -80.5 },
  "WI": { lat: 44.5, lng: -90.0 }, "WY": { lat: 43.0, lng: -107.5 },
};

// Convert lat/lng to SVG coordinates using state path center as reference
function latLngToSvgWithBounds(
  lat: number, 
  lng: number, 
  stateAbbr: string,
  bounds: { centerX: number; centerY: number; minX: number; maxX: number; minY: number; maxY: number }
): { x: number; y: number } {
  const geoCenter = STATE_GEO_CENTERS[stateAbbr];
  
  if (!geoCenter) {
    // Fallback - place at SVG center
    return { x: bounds.centerX, y: bounds.centerY };
  }
  
  // Calculate geographic offset from state center
  const dLng = lng - geoCenter.lng;
  const dLat = lat - geoCenter.lat;
  
  // Estimate state geographic span based on typical US state sizes
  // Most states span 3-10 degrees longitude and 2-6 degrees latitude
  const svgWidth = bounds.maxX - bounds.minX;
  const svgHeight = bounds.maxY - bounds.minY;
  
  // Use a consistent scale factor based on the SVG dimensions
  // The Albers projection used in the SVG compresses longitude at higher latitudes
  const scaleX = svgWidth / 8;  // Assume ~8 degrees longitude span
  const scaleY = svgHeight / 5; // Assume ~5 degrees latitude span
  
  // Apply offset from the SVG path center
  const x = bounds.centerX + (dLng * scaleX);
  const y = bounds.centerY - (dLat * scaleY); // Y is inverted in SVG
  
  return { x, y };
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface Metro {
  name: string;
  lat: number;
  lng: number;
  rank: number;
}

interface TopMarketsSectionProps {
  stateSlug: string;
  stateName: string;
  loanVolume?: number;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function MarketCard({ 
  market, 
  index,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: { 
  market: MarketDetail;
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  return (
    <Card 
      className={`overflow-hidden transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 
        isHovered ? 'ring-2 ring-primary/50 shadow-md' : 'hover-elevate'
      }`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      data-testid={`card-market-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
            index === 0 ? 'bg-primary text-primary-foreground' : 
            index === 1 ? 'bg-primary/20 text-primary' : 
            'bg-muted text-muted-foreground'
          }`}>
            {index + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg">{market.name}</h3>
              <div className="flex items-center gap-1.5">
                {market.strFriendliness.tier === "Excellent" && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30 shrink-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    STR Friendly
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs shrink-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{market.realEstate.priceGrowth.toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Median Price</p>
                <p className="font-medium flex items-center gap-1">
                  <Home className="w-3 h-3 text-muted-foreground" />
                  {formatCurrency(market.realEstate.medianPrice)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Avg. Rent</p>
                <p className="font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  {formatCurrency(market.realEstate.avgRent)}/mo
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Cap Rate</p>
                <p className="font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  {market.realEstate.capRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {(isHovered || isSelected) && (
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground border-t pt-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Pop: {(market.demographics.population / 1000).toFixed(0)}K
                </span>
                {market.universities.length > 0 && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {market.universities.length} Universities
                  </span>
                )}
                <span className="ml-auto text-primary flex items-center gap-1">
                  View Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MobileMarketAccordionContent({ market }: { market: MarketDetail }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Home className="h-4 w-4" />
            <span className="text-xs font-medium">Median Price</span>
          </div>
          <span className="text-lg font-bold">{formatCurrency(market.realEstate.medianPrice)}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(market.realEstate.medianPricePerSqft)}/sqft</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Price Growth</span>
          </div>
          <span className="text-lg font-bold">+{market.realEstate.priceGrowth.toFixed(1)}%</span>
          <p className="text-xs text-muted-foreground mt-0.5">Year over Year</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Avg. Rent</span>
          </div>
          <span className="text-lg font-bold">{formatCurrency(market.realEstate.avgRent)}/mo</span>
          <p className="text-xs text-muted-foreground mt-0.5">+{market.realEstate.rentGrowth.toFixed(1)}% YoY</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium">Cap Rate</span>
          </div>
          <span className="text-lg font-bold">{market.realEstate.capRate.toFixed(1)}%</span>
          <p className="text-xs text-muted-foreground mt-0.5">Average</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Pop: {(market.demographics.population / 1000).toFixed(0)}K</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{market.realEstate.daysOnMarket} days on market</span>
        </div>
        {market.universities.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{market.universities.length} Universities</span>
          </div>
        )}
      </div>

      {market.highlights.length > 0 && (
        <div className="bg-muted/20 rounded-lg p-3 border border-muted">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Market Highlights
          </h4>
          <ul className="space-y-1.5">
            {market.highlights.slice(0, 3).map((highlight, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TopMarketsSection({ stateSlug, stateName }: TopMarketsSectionProps) {
  const [metros, setMetros] = useState<Metro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMarket, setHoveredMarket] = useState<MarketDetail | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketDetail | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const containerRef = useRef<HTMLDivElement>(null);

  const marketsWithDetails = useMemo(() => {
    const enrichedMarkets = getMarketDetails(stateSlug);
    
    if (enrichedMarkets.length > 0) {
      return enrichedMarkets.slice(0, 5);
    }

    return metros.slice(0, 5).map(metro => 
      generateMarketDetailFromBasicData(
        metro.name, 
        stateSlug, 
        metro.lat, 
        metro.lng, 
        metro.rank
      )
    );
  }, [metros, stateSlug]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const metrosResponse = await fetch('/state_maps/metros_data.json');
        
        if (metrosResponse.ok) {
          const allMetros = await metrosResponse.json();
          setMetros(allMetros[stateSlug] || []);
        }
      } catch (error) {
        console.error("Failed to load state data:", error);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [stateSlug]);

  const handleMarkerClick = (market: MarketDetail) => {
    setSelectedMarket(selectedMarket?.id === market.id ? null : market);
    setHoveredMarket(null);
  };

  const handleMarkerHover = (market: MarketDetail | null) => {
    if (!selectedMarket && isDesktop) {
      setHoveredMarket(market);
    }
  };

  const handleCardClick = (market: MarketDetail) => {
    setSelectedMarket(selectedMarket?.id === market.id ? null : market);
    setHoveredMarket(null);
  };

  const handleCloseDrawer = () => {
    setSelectedMarket(null);
    setHoveredMarket(null);
  };

  if (!isLoading && marketsWithDetails.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <Badge className="mb-4" variant="outline">
          <MapPin className="w-3 h-3 mr-1" />
          Investment Hotspots
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Top Investment Markets in {stateName}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We actively lend in these high-growth markets across {stateName}. 
          Click on a market to explore detailed stats, demographics, universities, and STR regulations.
        </p>
      </div>

      <div className="relative" ref={containerRef}>
        <div className={`grid gap-8 items-start transition-all duration-300 ${
          selectedMarket ? 'lg:grid-cols-2' : 'lg:grid-cols-2'
        }`}>
          <Card className="overflow-hidden border-primary/10 bg-card/50">
            <CardContent className="p-0">
              {/* SVG-based state map like hero section */}
              <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-slate-900/50">
                {(() => {
                  const stateAbbr = SLUG_TO_ABBR[stateSlug];
                  const statePathD = stateAbbr ? statePaths[stateAbbr] : null;
                  const bounds = statePathD ? getPathBounds(statePathD) : null;
                  
                  // Calculate viewBox to zoom and center on the focus state
                  // Simply create a viewBox that wraps the state bounds with padding
                  const padding = 30;
                  const viewBoxX = bounds ? bounds.minX - padding : 0;
                  const viewBoxY = bounds ? bounds.minY - padding : 0;
                  const viewBoxW = bounds ? (bounds.maxX - bounds.minX) + padding * 2 : 200;
                  const viewBoxH = bounds ? (bounds.maxY - bounds.minY) + padding * 2 : 200;

                  return (
                    <svg
                      viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`}
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient id="stateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
                        </linearGradient>
                        <filter id="stateShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.4" />
                        </filter>
                      </defs>
                      
                      {/* All other states - very subtle background */}
                      {Object.entries(statePaths).map(([abbr, pathD]) => {
                        if (abbr === stateAbbr) return null;
                        return (
                          <path
                            key={abbr}
                            d={pathD}
                            fill="hsl(var(--muted-foreground) / 0.08)"
                            stroke="hsl(var(--muted-foreground) / 0.15)"
                            strokeWidth={0.5}
                          />
                        );
                      })}
                      
                      {/* Focus state - prominent and highlighted */}
                      {statePathD && (
                        <path
                          d={statePathD}
                          fill="url(#stateGradient)"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          filter="url(#stateShadow)"
                        />
                      )}
                      
                      {/* Market markers */}
                      {marketsWithDetails.map((market, index) => {
                        const pos = bounds 
                          ? latLngToSvgWithBounds(market.lat, market.lng, stateAbbr || "", bounds)
                          : { x: 0, y: 0 };
                        const isSelected = selectedMarket?.id === market.id;
                        const isHovered = hoveredMarket?.id === market.id;
                        const isActive = isSelected || isHovered;
                        const radius = isActive ? 14 : 10;
                        
                        return (
                          <g 
                            key={market.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleMarkerClick(market)}
                            onMouseEnter={() => handleMarkerHover(market)}
                            onMouseLeave={() => handleMarkerHover(null)}
                          >
                            {/* Outer glow for active */}
                            {isActive && (
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={radius + 6}
                                fill="hsl(var(--primary) / 0.3)"
                              />
                            )}
                            {/* Main circle */}
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={radius}
                              fill={isActive ? "hsl(45 93% 58%)" : index === 0 ? "hsl(38 92% 50%)" : index === 1 ? "hsl(32 95% 44%)" : "hsl(28 94% 39%)"}
                              stroke={isActive ? "hsl(48 96% 89%)" : "hsl(30 94% 25%)"}
                              strokeWidth={isActive ? 3 : 2}
                              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                            />
                            {/* Number label */}
                            <text
                              x={pos.x}
                              y={pos.y + 4}
                              textAnchor="middle"
                              fill={isActive ? "#0f172a" : "hsl(48 96% 89%)"}
                              fontSize={isActive ? 12 : 10}
                              fontWeight="bold"
                              fontFamily="system-ui, sans-serif"
                              style={{ pointerEvents: 'none' }}
                            >
                              {index + 1}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
              
              <div className="p-4 bg-card border-t">
                <div className="flex flex-wrap gap-2 justify-center">
                  {marketsWithDetails.map((market) => (
                    <Badge
                      key={market.id}
                      variant={selectedMarket?.id === market.id ? "default" : hoveredMarket?.id === market.id ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMarket(market)}
                      onMouseLeave={() => setHoveredMarket(null)}
                      onClick={() => handleCardClick(market)}
                      data-testid={`badge-market-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${
                        market.rank === 1 ? 'bg-primary' : 
                        market.rank === 2 ? 'bg-primary/70' : 
                        'bg-primary/50'
                      }`} />
                      {market.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className={`transition-all duration-300 ${selectedMarket && isDesktop ? 'lg:col-span-1' : ''}`}>
            {selectedMarket && isDesktop ? (
              <div className="h-[500px] lg:h-[600px] rounded-lg overflow-hidden border">
                <MarketDetailDrawer
                  market={selectedMarket}
                  stateName={stateName}
                  onClose={handleCloseDrawer}
                  isOpen={!!selectedMarket}
                />
              </div>
            ) : isDesktop ? (
              <div className="space-y-3">
                {marketsWithDetails.map((market, index) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    index={index}
                    isHovered={hoveredMarket?.id === market.id}
                    isSelected={selectedMarket?.id === market.id}
                    onHover={(hovered) => setHoveredMarket(hovered ? market : null)}
                    onClick={() => handleCardClick(market)}
                  />
                ))}
                
                <div className="pt-4">
                  <Link href="/get-quote">
                    <Button className="w-full" size="lg" data-testid="button-get-quote-markets">
                      Get a Quote for {stateName} Properties
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Accordion 
                type="single" 
                collapsible 
                value={selectedMarket?.id || ""} 
                onValueChange={(value) => {
                  const market = marketsWithDetails.find(m => m.id === value);
                  setSelectedMarket(market || null);
                }}
                className="space-y-3"
              >
                {marketsWithDetails.map((market, index) => (
                  <AccordionItem 
                    key={market.id} 
                    value={market.id}
                    className="border rounded-lg overflow-hidden bg-card"
                    data-testid={`accordion-market-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b">
                      <div className="flex items-center gap-3 w-full">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-primary text-primary-foreground' : 
                          index === 1 ? 'bg-primary/20 text-primary' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h3 className="font-semibold">{market.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatCurrency(market.realEstate.medianPrice)}</span>
                            <span>•</span>
                            <span className="text-green-600">+{market.realEstate.priceGrowth.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mr-2">
                          {market.strFriendliness.tier === "Excellent" && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/30 shrink-0">
                              <Sparkles className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <MobileMarketAccordionContent market={market} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
                
                <div className="pt-4">
                  <Link href="/get-quote">
                    <Button className="w-full" size="lg" data-testid="button-get-quote-markets">
                      Get a Quote for {stateName} Properties
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Accordion>
            )}
          </div>
        </div>

        {selectedMarket && isDesktop && (
          <div className="hidden lg:block mt-6">
            <div className="space-y-3">
              {marketsWithDetails.filter(m => m.id !== selectedMarket.id).map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  index={marketsWithDetails.findIndex(m => m.id === market.id)}
                  isHovered={hoveredMarket?.id === market.id}
                  isSelected={false}
                  onHover={(hovered) => setHoveredMarket(hovered ? market : null)}
                  onClick={() => handleCardClick(market)}
                />
              ))}
              
              <div className="pt-4">
                <Link href="/get-quote">
                  <Button className="w-full" size="lg" data-testid="button-get-quote-markets-bottom">
                    Get a Quote for {stateName} Properties
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
