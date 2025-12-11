import { useState, useRef, useCallback, useEffect } from "react";
import type { MarkerCluster } from "./useMarkerClustering";

interface ScatterState {
  isAnimating: boolean;
  isScattered: boolean; // True when markers are fully scattered
  progress: number; // Eased progress 0 to 1
  cluster: MarkerCluster | null;
  markerPositions: Array<{ id: string; x: number; y: number }>;
}

interface UseScatterAnimationOptions {
  duration?: number;
  onComplete?: () => void;
  onReverseComplete?: () => void;
}

// Ease out cubic for natural deceleration
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// Ease out back for slight overshoot effect
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function useScatterAnimation(options: UseScatterAnimationOptions = {}) {
  const { 
    duration = 400, 
    onComplete,
    onReverseComplete,
  } = options;
  
  const [state, setState] = useState<ScatterState>({
    isAnimating: false,
    isScattered: false,
    progress: 0,
    cluster: null,
    markerPositions: [],
  });
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startPositionsRef = useRef<Array<{ id: string; x: number; y: number }>>([]);
  const clusterRef = useRef<MarkerCluster | null>(null);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const animate = useCallback((cluster: MarkerCluster) => {
    cancelAnimation();
    clusterRef.current = cluster;
    
    const initialPositions = cluster.markers.map(m => ({
      id: m.market.id,
      x: cluster.center.x,
      y: cluster.center.y,
    }));
    
    startPositionsRef.current = initialPositions;
    
    setState({
      isAnimating: true,
      isScattered: false,
      progress: 0,
      cluster,
      markerPositions: initialPositions,
    });
    
    startTimeRef.current = performance.now();
    
    const tick = (now: number) => {
      const cluster = clusterRef.current;
      if (!cluster) return;
      
      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutBack(rawProgress);
      
      const newPositions = cluster.markers.map(m => {
        const startX = cluster.center.x;
        const startY = cluster.center.y;
        const endX = m.pos.x;
        const endY = m.pos.y;
        
        return {
          id: m.market.id,
          x: startX + (endX - startX) * easedProgress,
          y: startY + (endY - startY) * easedProgress,
        };
      });
      
      const isComplete = rawProgress >= 1;
      
      setState(prev => ({
        ...prev,
        isAnimating: !isComplete,
        isScattered: isComplete,
        progress: easedProgress,
        markerPositions: newPositions,
      }));
      
      if (!isComplete) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
        onComplete?.();
      }
    };
    
    animationRef.current = requestAnimationFrame(tick);
  }, [duration, cancelAnimation, onComplete]);

  const reset = useCallback(() => {
    cancelAnimation();
    clusterRef.current = null;
    startPositionsRef.current = [];
    setState({
      isAnimating: false,
      isScattered: false,
      progress: 0,
      cluster: null,
      markerPositions: [],
    });
  }, [cancelAnimation]);

  // Reverse animation - markers fly back to cluster center
  const reverseAnimate = useCallback(() => {
    const cluster = clusterRef.current;
    if (!cluster) {
      reset();
      return;
    }
    
    cancelAnimation();
    
    // Capture current positions as starting point for reverse
    setState(prev => {
      startPositionsRef.current = [...prev.markerPositions];
      return { ...prev, isAnimating: true, isScattered: false };
    });
    
    startTimeRef.current = performance.now();
    const reverseDuration = duration * 0.5; // Faster return
    
    const tick = (now: number) => {
      const cluster = clusterRef.current;
      if (!cluster) {
        reset();
        return;
      }
      
      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / reverseDuration, 1);
      const easedProgress = easeOutCubic(rawProgress);
      
      const newPositions = startPositionsRef.current.map((startPos) => {
        const endX = cluster.center.x;
        const endY = cluster.center.y;
        
        return {
          id: startPos.id,
          x: startPos.x + (endX - startPos.x) * easedProgress,
          y: startPos.y + (endY - startPos.y) * easedProgress,
        };
      });
      
      const isComplete = rawProgress >= 1;
      
      if (isComplete) {
        // Animation complete - fully reset state
        reset();
        onReverseComplete?.();
      } else {
        setState(prev => ({
          ...prev,
          progress: 1 - easedProgress,
          markerPositions: newPositions,
        }));
        animationRef.current = requestAnimationFrame(tick);
      }
    };
    
    animationRef.current = requestAnimationFrame(tick);
  }, [duration, cancelAnimation, reset, onReverseComplete]);

  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  // Computed flag for whether scatter effect is active (animating or scattered)
  const isActive = state.isAnimating || state.isScattered || state.markerPositions.length > 0;

  return {
    ...state,
    isActive,
    animate,
    reset,
    reverseAnimate,
  };
}
