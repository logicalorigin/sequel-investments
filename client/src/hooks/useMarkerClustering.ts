import { useMemo } from "react";
import { latLngToSvgWithBounds, type SVGBounds, type Point } from "@/lib/mapUtils";
import type { MarketDetail } from "@/data/marketDetails";

/** A marker with its calculated SVG position */
export interface MarkerWithPosition {
  market: MarketDetail;
  index: number;
  pos: Point;
}

/** Aggregate stats for a cluster */
export interface ClusterStats {
  topMarket: MarketDetail;
  maxCapRate: number;
  avgCapRate: number;
  hasSTRExcellent: boolean;
  strTierCounts: Record<string, number>;
}

/** A cluster of nearby markers with aggregate stats */
export interface MarkerCluster {
  center: Point;
  markers: MarkerWithPosition[];
  stats: ClusterStats;
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
      
      // Calculate aggregate stats for this cluster
      const capRates = cluster.map(m => m.market.realEstate.capRate);
      const maxCapRate = Math.max(...capRates);
      const avgCapRate = capRates.reduce((a, b) => a + b, 0) / capRates.length;
      
      // Find top market by CAP rate
      const topMarket = cluster.reduce((best, m) => 
        m.market.realEstate.capRate > best.market.realEstate.capRate ? m : best
      ).market;
      
      // Count STR tiers
      const strTierCounts: Record<string, number> = {};
      let hasSTRExcellent = false;
      for (const m of cluster) {
        const tier = m.market.strFriendliness?.tier || "Unknown";
        strTierCounts[tier] = (strTierCounts[tier] || 0) + 1;
        if (tier === "Excellent") hasSTRExcellent = true;
      }
      
      const stats: ClusterStats = {
        topMarket,
        maxCapRate,
        avgCapRate,
        hasSTRExcellent,
        strTierCounts
      };
      
      clusterList.push({ center: { x: centerX, y: centerY }, markers: cluster, stats });
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
