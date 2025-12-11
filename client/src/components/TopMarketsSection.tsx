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

// Accurate geographic bounding boxes for each state (minLat, maxLat, minLng, maxLng)
// These define the actual extent of each state for proper coordinate mapping
const STATE_GEO_BOUNDS: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
  "AL": { minLat: 30.22, maxLat: 35.01, minLng: -88.47, maxLng: -84.89 },
  "AK": { minLat: 51.21, maxLat: 71.39, minLng: -179.15, maxLng: -129.98 },
  "AZ": { minLat: 31.33, maxLat: 37.00, minLng: -114.81, maxLng: -109.04 },
  "AR": { minLat: 33.00, maxLat: 36.50, minLng: -94.62, maxLng: -89.64 },
  "CA": { minLat: 32.53, maxLat: 42.01, minLng: -124.48, maxLng: -114.13 },
  "CO": { minLat: 36.99, maxLat: 41.00, minLng: -109.06, maxLng: -102.04 },
  "CT": { minLat: 40.95, maxLat: 42.05, minLng: -73.73, maxLng: -71.79 },
  "DE": { minLat: 38.45, maxLat: 39.84, minLng: -75.79, maxLng: -75.05 },
  "FL": { minLat: 24.40, maxLat: 31.00, minLng: -87.63, maxLng: -80.03 },
  "GA": { minLat: 30.36, maxLat: 35.00, minLng: -85.61, maxLng: -80.84 },
  "HI": { minLat: 18.91, maxLat: 22.24, minLng: -160.25, maxLng: -154.81 },
  "ID": { minLat: 41.99, maxLat: 49.00, minLng: -117.24, maxLng: -111.04 },
  "IL": { minLat: 36.97, maxLat: 42.51, minLng: -91.51, maxLng: -87.02 },
  "IN": { minLat: 37.77, maxLat: 41.76, minLng: -88.10, maxLng: -84.78 },
  "IA": { minLat: 40.38, maxLat: 43.50, minLng: -96.64, maxLng: -90.14 },
  "KS": { minLat: 36.99, maxLat: 40.00, minLng: -102.05, maxLng: -94.59 },
  "KY": { minLat: 36.50, maxLat: 39.15, minLng: -89.57, maxLng: -81.96 },
  "LA": { minLat: 28.93, maxLat: 33.02, minLng: -94.04, maxLng: -88.82 },
  "ME": { minLat: 43.06, maxLat: 47.46, minLng: -71.08, maxLng: -66.95 },
  "MD": { minLat: 37.91, maxLat: 39.72, minLng: -79.49, maxLng: -75.05 },
  "MA": { minLat: 41.24, maxLat: 42.89, minLng: -73.51, maxLng: -69.93 },
  "MI": { minLat: 41.70, maxLat: 48.31, minLng: -90.42, maxLng: -82.12 },
  "MN": { minLat: 43.50, maxLat: 49.38, minLng: -97.24, maxLng: -89.49 },
  "MS": { minLat: 30.17, maxLat: 35.00, minLng: -91.66, maxLng: -88.10 },
  "MO": { minLat: 35.99, maxLat: 40.61, minLng: -95.77, maxLng: -89.10 },
  "MT": { minLat: 44.36, maxLat: 49.00, minLng: -116.05, maxLng: -104.04 },
  "NE": { minLat: 40.00, maxLat: 43.00, minLng: -104.05, maxLng: -95.31 },
  "NV": { minLat: 35.00, maxLat: 42.00, minLng: -120.01, maxLng: -114.04 },
  "NH": { minLat: 42.70, maxLat: 45.31, minLng: -72.56, maxLng: -70.70 },
  "NJ": { minLat: 38.93, maxLat: 41.36, minLng: -75.56, maxLng: -73.89 },
  "NM": { minLat: 31.33, maxLat: 37.00, minLng: -109.05, maxLng: -103.00 },
  "NY": { minLat: 40.50, maxLat: 45.02, minLng: -79.76, maxLng: -71.86 },
  "NC": { minLat: 33.84, maxLat: 36.59, minLng: -84.32, maxLng: -75.46 },
  "ND": { minLat: 45.94, maxLat: 49.00, minLng: -104.05, maxLng: -96.55 },
  "OH": { minLat: 38.40, maxLat: 42.33, minLng: -84.82, maxLng: -80.52 },
  "OK": { minLat: 33.62, maxLat: 37.00, minLng: -103.00, maxLng: -94.43 },
  "OR": { minLat: 41.99, maxLat: 46.29, minLng: -124.57, maxLng: -116.46 },
  "PA": { minLat: 39.72, maxLat: 42.27, minLng: -80.52, maxLng: -74.69 },
  "RI": { minLat: 41.15, maxLat: 42.02, minLng: -71.86, maxLng: -71.12 },
  "SC": { minLat: 32.03, maxLat: 35.22, minLng: -83.35, maxLng: -78.54 },
  "SD": { minLat: 42.48, maxLat: 45.95, minLng: -104.06, maxLng: -96.44 },
  "TN": { minLat: 34.98, maxLat: 36.68, minLng: -90.31, maxLng: -81.65 },
  "TX": { minLat: 25.84, maxLat: 36.50, minLng: -106.65, maxLng: -93.51 },
  "UT": { minLat: 36.99, maxLat: 42.00, minLng: -114.05, maxLng: -109.04 },
  "VT": { minLat: 42.73, maxLat: 45.02, minLng: -73.44, maxLng: -71.46 },
  "VA": { minLat: 36.54, maxLat: 39.47, minLng: -83.68, maxLng: -75.24 },
  "WA": { minLat: 45.54, maxLat: 49.00, minLng: -124.85, maxLng: -116.92 },
  "WV": { minLat: 37.20, maxLat: 40.64, minLng: -82.64, maxLng: -77.72 },
  "WI": { minLat: 42.49, maxLat: 47.31, minLng: -92.89, maxLng: -86.25 },
  "WY": { minLat: 40.99, maxLat: 45.01, minLng: -111.06, maxLng: -104.05 },
  "DC": { minLat: 38.79, maxLat: 38.99, minLng: -77.12, maxLng: -76.91 },
};

// Convert lat/lng to SVG coordinates using accurate state bounds interpolation
function latLngToSvgWithBounds(
  lat: number, 
  lng: number, 
  stateAbbr: string,
  svgBounds: { centerX: number; centerY: number; minX: number; maxX: number; minY: number; maxY: number }
): { x: number; y: number } {
  const geoBounds = STATE_GEO_BOUNDS[stateAbbr];
  
  if (!geoBounds) {
    // Fallback - place at SVG center
    return { x: svgBounds.centerX, y: svgBounds.centerY };
  }
  
  // Calculate normalized position within geographic bounds (0-1)
  const geoWidth = geoBounds.maxLng - geoBounds.minLng;
  const geoHeight = geoBounds.maxLat - geoBounds.minLat;
  
  // Normalize: where does this point fall within the state's geographic extent?
  // X: 0 = west edge, 1 = east edge
  // Y: 0 = south edge, 1 = north edge  
  const normalizedX = (lng - geoBounds.minLng) / geoWidth;
  const normalizedY = (lat - geoBounds.minLat) / geoHeight;
  
  // Map to SVG coordinates
  // SVG Y is inverted (0 at top), so we flip the normalized Y
  const svgWidth = svgBounds.maxX - svgBounds.minX;
  const svgHeight = svgBounds.maxY - svgBounds.minY;
  
  const x = svgBounds.minX + (normalizedX * svgWidth);
  const y = svgBounds.maxY - (normalizedY * svgHeight); // Flip Y for SVG coordinate system
  
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
                      
                      {/* Market markers with clustering and radial expansion */}
                      {(() => {
                        // Calculate positions for all markets
                        const markersWithPos = marketsWithDetails.map((market, index) => ({
                          market,
                          index,
                          pos: bounds 
                            ? latLngToSvgWithBounds(market.lat, market.lng, stateAbbr || "", bounds)
                            : { x: 0, y: 0 }
                        }));
                        
                        // Improved cluster detection: merges markers within threshold of ANY cluster member
                        const clusterThreshold = 15; // SVG units - markers closer than this will cluster
                        const clusters: { center: { x: number; y: number }; markers: typeof markersWithPos }[] = [];
                        const processed = new Set<number>();
                        
                        for (let i = 0; i < markersWithPos.length; i++) {
                          if (processed.has(i)) continue;
                          
                          const cluster = [markersWithPos[i]];
                          processed.add(i);
                          
                          // Keep checking for new additions until no more can be added
                          let foundNew = true;
                          while (foundNew) {
                            foundNew = false;
                            for (let j = 0; j < markersWithPos.length; j++) {
                              if (processed.has(j)) continue;
                              
                              // Check distance against ALL cluster members (not just first)
                              for (const clusterMember of cluster) {
                                const dx = clusterMember.pos.x - markersWithPos[j].pos.x;
                                const dy = clusterMember.pos.y - markersWithPos[j].pos.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                
                                if (dist < clusterThreshold) {
                                  cluster.push(markersWithPos[j]);
                                  processed.add(j);
                                  foundNew = true;
                                  break;
                                }
                              }
                            }
                          }
                          
                          // Calculate cluster center
                          const centerX = cluster.reduce((sum, m) => sum + m.pos.x, 0) / cluster.length;
                          const centerY = cluster.reduce((sum, m) => sum + m.pos.y, 0) / cluster.length;
                          clusters.push({ center: { x: centerX, y: centerY }, markers: cluster });
                        }
                        
                        // Check if any marker in a cluster is hovered/selected
                        const isClusterActive = (cluster: typeof clusters[0]) => 
                          cluster.markers.some(m => 
                            hoveredMarket?.id === m.market.id || selectedMarket?.id === m.market.id
                          );
                        
                        return clusters.map((cluster, clusterIdx) => {
                          const isExpanded = isClusterActive(cluster);
                          const isSingleMarker = cluster.markers.length === 1;
                          
                          if (isSingleMarker) {
                            // Render single marker (smaller size)
                            const { market, index, pos } = cluster.markers[0];
                            const isSelected = selectedMarket?.id === market.id;
                            const isHovered = hoveredMarket?.id === market.id;
                            const isActive = isSelected || isHovered;
                            const radius = isActive ? 8 : 6;
                            
                            return (
                              <g 
                                key={market.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleMarkerClick(market)}
                                onMouseEnter={() => handleMarkerHover(market)}
                                onMouseLeave={() => handleMarkerHover(null)}
                              >
                                {isActive && (
                                  <circle cx={pos.x} cy={pos.y} r={radius + 4} fill="hsl(var(--primary) / 0.3)" />
                                )}
                                <circle
                                  cx={pos.x}
                                  cy={pos.y}
                                  r={radius}
                                  fill={isActive ? "hsl(45 93% 58%)" : index === 0 ? "hsl(38 92% 50%)" : index === 1 ? "hsl(32 95% 44%)" : "hsl(28 94% 39%)"}
                                  stroke={isActive ? "hsl(48 96% 89%)" : "hsl(30 94% 25%)"}
                                  strokeWidth={isActive ? 2 : 1.5}
                                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                                />
                                <text
                                  x={pos.x}
                                  y={pos.y + 2.5}
                                  textAnchor="middle"
                                  fill={isActive ? "#0f172a" : "hsl(48 96% 89%)"}
                                  fontSize={isActive ? 8 : 7}
                                  fontWeight="bold"
                                  fontFamily="system-ui, sans-serif"
                                  style={{ pointerEvents: 'none' }}
                                >
                                  {index + 1}
                                </text>
                              </g>
                            );
                          }
                          
                          // Clustered markers - show radial expansion on hover
                          const expandRadius = 18; // Distance from center for expanded markers
                          const hitboxRadius = expandRadius + 10; // Slightly larger for easier hover
                          
                          return (
                            <g 
                              key={`cluster-${clusterIdx}`}
                              onMouseLeave={() => handleMarkerHover(null)}
                            >
                              {isExpanded ? (
                                // Radial expansion - show all markers in a circle
                                <>
                                  {/* Transparent hitbox to keep cluster expanded while hovering within area */}
                                  <circle
                                    cx={cluster.center.x}
                                    cy={cluster.center.y}
                                    r={hitboxRadius}
                                    fill="transparent"
                                    style={{ pointerEvents: 'all' }}
                                  />
                                  {/* Connection lines from center to expanded markers */}
                                  {cluster.markers.map((m, i) => {
                                    const angle = (i * 2 * Math.PI) / cluster.markers.length - Math.PI / 2;
                                    const expandedX = cluster.center.x + Math.cos(angle) * expandRadius;
                                    const expandedY = cluster.center.y + Math.sin(angle) * expandRadius;
                                    return (
                                      <line
                                        key={`line-${m.market.id}`}
                                        x1={cluster.center.x}
                                        y1={cluster.center.y}
                                        x2={expandedX}
                                        y2={expandedY}
                                        stroke="hsl(var(--primary) / 0.4)"
                                        strokeWidth={1}
                                        strokeDasharray="2,2"
                                        style={{ pointerEvents: 'none' }}
                                      />
                                    );
                                  })}
                                  {/* Small center dot showing cluster origin */}
                                  <circle
                                    cx={cluster.center.x}
                                    cy={cluster.center.y}
                                    r={3}
                                    fill="hsl(var(--primary) / 0.5)"
                                    style={{ pointerEvents: 'none' }}
                                  />
                                  {/* Expanded markers in radial pattern */}
                                  {cluster.markers.map((m, i) => {
                                    const angle = (i * 2 * Math.PI) / cluster.markers.length - Math.PI / 2;
                                    const expandedX = cluster.center.x + Math.cos(angle) * expandRadius;
                                    const expandedY = cluster.center.y + Math.sin(angle) * expandRadius;
                                    const isSelected = selectedMarket?.id === m.market.id;
                                    const isHovered = hoveredMarket?.id === m.market.id;
                                    const isActive = isSelected || isHovered;
                                    const radius = isActive ? 7 : 5;
                                    
                                    return (
                                      <g 
                                        key={m.market.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleMarkerClick(m.market)}
                                        onMouseEnter={() => handleMarkerHover(m.market)}
                                      >
                                        {isActive && (
                                          <circle cx={expandedX} cy={expandedY} r={radius + 3} fill="hsl(var(--primary) / 0.4)" />
                                        )}
                                        <circle
                                          cx={expandedX}
                                          cy={expandedY}
                                          r={radius}
                                          fill={isActive ? "hsl(45 93% 58%)" : m.index === 0 ? "hsl(38 92% 50%)" : m.index === 1 ? "hsl(32 95% 44%)" : "hsl(28 94% 39%)"}
                                          stroke={isActive ? "hsl(48 96% 89%)" : "hsl(30 94% 25%)"}
                                          strokeWidth={isActive ? 2 : 1}
                                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                                        />
                                        <text
                                          x={expandedX}
                                          y={expandedY + 2}
                                          textAnchor="middle"
                                          fill={isActive ? "#0f172a" : "hsl(48 96% 89%)"}
                                          fontSize={6}
                                          fontWeight="bold"
                                          fontFamily="system-ui, sans-serif"
                                          style={{ pointerEvents: 'none' }}
                                        >
                                          {m.index + 1}
                                        </text>
                                      </g>
                                    );
                                  })}
                                </>
                              ) : (
                                // Collapsed cluster marker showing count
                                <g 
                                  style={{ cursor: 'pointer' }}
                                  onMouseEnter={() => handleMarkerHover(cluster.markers[0].market)}
                                >
                                  <circle
                                    cx={cluster.center.x}
                                    cy={cluster.center.y}
                                    r={9}
                                    fill="hsl(38 92% 50%)"
                                    stroke="hsl(30 94% 25%)"
                                    strokeWidth={2}
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                                  />
                                  <text
                                    x={cluster.center.x}
                                    y={cluster.center.y + 3}
                                    textAnchor="middle"
                                    fill="hsl(48 96% 89%)"
                                    fontSize={8}
                                    fontWeight="bold"
                                    fontFamily="system-ui, sans-serif"
                                    style={{ pointerEvents: 'none' }}
                                  >
                                    {cluster.markers.length}
                                  </text>
                                </g>
                              )}
                            </g>
                          );
                        });
                      })()}
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
