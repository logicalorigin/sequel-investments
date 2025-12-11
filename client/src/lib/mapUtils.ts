/**
 * Map utility functions for SVG coordinate conversion and geographic bounds
 */

/** Geographic bounding box for a state */
export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/** SVG path bounding box with center point */
export interface SVGBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
}

/** 2D point coordinate */
export interface Point {
  x: number;
  y: number;
}

/**
 * Accurate geographic bounding boxes for each state (minLat, maxLat, minLng, maxLng)
 * These define the actual extent of each state for proper coordinate mapping
 */
export const STATE_GEO_BOUNDS: Record<string, GeoBounds> = {
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

/**
 * Parse an SVG path string and compute its bounding box.
 * Properly handles both absolute (M,L) and relative (m,l) SVG commands.
 * @param pathD - The SVG path data string
 * @returns The bounding box with min/max coordinates and center point
 */
export function parsePathBounds(pathD: string): SVGBounds {
  const points: Point[] = [];
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  
  const commands = pathD.match(/[MmLlHhVvZzCcSsQqTtAa][^MmLlHhVvZzCcSsQqTtAa]*/g) || [];
  
  for (const cmd of commands) {
    const type = cmd[0];
    const args = cmd.slice(1).trim().split(/[\s,]+/).filter(s => s).map(Number);
    
    switch (type) {
      case 'M':
        for (let i = 0; i < args.length; i += 2) {
          currentX = args[i];
          currentY = args[i + 1];
          if (i === 0) { startX = currentX; startY = currentY; }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'm':
        for (let i = 0; i < args.length; i += 2) {
          currentX += args[i];
          currentY += args[i + 1];
          if (i === 0) { startX = currentX; startY = currentY; }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'L':
        for (let i = 0; i < args.length; i += 2) {
          currentX = args[i];
          currentY = args[i + 1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'l':
        for (let i = 0; i < args.length; i += 2) {
          currentX += args[i];
          currentY += args[i + 1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'H':
        for (const x of args) {
          currentX = x;
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'h':
        for (const dx of args) {
          currentX += dx;
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'V':
        for (const y of args) {
          currentY = y;
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'v':
        for (const dy of args) {
          currentY += dy;
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'C':
        for (let i = 0; i < args.length; i += 6) {
          points.push({ x: args[i], y: args[i + 1] });
          points.push({ x: args[i + 2], y: args[i + 3] });
          currentX = args[i + 4];
          currentY = args[i + 5];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'c':
        for (let i = 0; i < args.length; i += 6) {
          points.push({ x: currentX + args[i], y: currentY + args[i + 1] });
          points.push({ x: currentX + args[i + 2], y: currentY + args[i + 3] });
          currentX += args[i + 4];
          currentY += args[i + 5];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'Z':
      case 'z':
        currentX = startX;
        currentY = startY;
        break;
      default:
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
  
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100, centerX: 50, centerY: 50 };
  }
  
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

/**
 * Convert lat/lng geographic coordinates to SVG coordinates using state bounds interpolation.
 * @param lat - Latitude coordinate
 * @param lng - Longitude coordinate
 * @param stateAbbr - Two-letter state abbreviation (e.g., "CA", "TX")
 * @param svgBounds - The SVG bounding box to map coordinates into
 * @returns The x,y SVG coordinates
 */
export function latLngToSvgWithBounds(
  lat: number, 
  lng: number, 
  stateAbbr: string,
  svgBounds: SVGBounds
): Point {
  const geoBounds = STATE_GEO_BOUNDS[stateAbbr];
  
  if (!geoBounds) {
    return { x: svgBounds.centerX, y: svgBounds.centerY };
  }
  
  const geoWidth = geoBounds.maxLng - geoBounds.minLng;
  const geoHeight = geoBounds.maxLat - geoBounds.minLat;
  
  const normalizedX = (lng - geoBounds.minLng) / geoWidth;
  const normalizedY = (lat - geoBounds.minLat) / geoHeight;
  
  const svgWidth = svgBounds.maxX - svgBounds.minX;
  const svgHeight = svgBounds.maxY - svgBounds.minY;
  
  const x = svgBounds.minX + (normalizedX * svgWidth);
  const y = svgBounds.maxY - (normalizedY * svgHeight);
  
  return { x, y };
}

/** Map state slugs to two-letter abbreviations */
export const SLUG_TO_ABBR: Record<string, string> = {
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
