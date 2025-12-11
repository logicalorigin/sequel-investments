import { useMemo } from "react";
import { latLngToSvgWithBounds, type SVGBounds, type Point } from "@/lib/mapUtils";
import type { MarketDetail } from "@/data/marketDetails";

/** A marker with its calculated SVG position */
export interface MarkerWithPosition {
  market: MarketDetail;
  index: number;
  pos: Point;
}

/** A cluster of nearby markers */
export interface MarkerCluster {
  center: Point;
  markers: MarkerWithPosition[];
}

/** Options for the clustering algorithm */
export interface ClusteringOptions {
  threshold?: number;
}

/** Result from the useMarkerClustering hook */
export interface ClusteringResult {
  clusters: MarkerCluster[];
  isClusterActive: (cluster: MarkerCluster) => boolean;
}

/**
 * Custom hook that calculates marker clusters from a list of markets.
 * Groups markers that are within a threshold distance of each other.
 * 
 * @param markets - Array of market details to cluster
 * @param stateAbbr - Two-letter state abbreviation for coordinate conversion
 * @param svgBounds - The SVG bounding box for coordinate mapping
 * @param hoveredMarket - Currently hovered market (for active state detection)
 * @param selectedMarket - Currently selected market (for active state detection)
 * @param options - Clustering options (threshold distance)
 * @returns Clusters and helper function to check if cluster is active
 */
export function useMarkerClustering(
  markets: MarketDetail[],
  stateAbbr: string,
  svgBounds: SVGBounds | null,
  hoveredMarket: MarketDetail | null,
  selectedMarket: MarketDetail | null,
  options: ClusteringOptions = {}
): ClusteringResult {
  const { threshold = 25 } = options;

  const clusters = useMemo(() => {
    if (!svgBounds) return [];

    const markersWithPos: MarkerWithPosition[] = markets.map((market, index) => ({
      market,
      index,
      pos: latLngToSvgWithBounds(market.lat, market.lng, stateAbbr, svgBounds)
    }));
    
    const clusterList: MarkerCluster[] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < markersWithPos.length; i++) {
      if (processed.has(i)) continue;
      
      const cluster = [markersWithPos[i]];
      processed.add(i);
      
      let foundNew = true;
      while (foundNew) {
        foundNew = false;
        for (let j = 0; j < markersWithPos.length; j++) {
          if (processed.has(j)) continue;
          
          for (const clusterMember of cluster) {
            const dx = clusterMember.pos.x - markersWithPos[j].pos.x;
            const dy = clusterMember.pos.y - markersWithPos[j].pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < threshold) {
              cluster.push(markersWithPos[j]);
              processed.add(j);
              foundNew = true;
              break;
            }
          }
        }
      }
      
      const centerX = cluster.reduce((sum, m) => sum + m.pos.x, 0) / cluster.length;
      const centerY = cluster.reduce((sum, m) => sum + m.pos.y, 0) / cluster.length;
      clusterList.push({ center: { x: centerX, y: centerY }, markers: cluster });
    }
    
    return clusterList;
  }, [markets, stateAbbr, svgBounds, threshold]);

  const isClusterActive = useMemo(() => {
    return (cluster: MarkerCluster) =>
      cluster.markers.some(m => 
        hoveredMarket?.id === m.market.id || selectedMarket?.id === m.market.id
      );
  }, [hoveredMarket?.id, selectedMarket?.id]);

  return { clusters, isClusterActive };
}
