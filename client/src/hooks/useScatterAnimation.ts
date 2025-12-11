import { useState, useRef, useCallback, useEffect } from "react";
import type { MarkerCluster } from "./useMarkerClustering";

interface ScatterState {
  isAnimating: boolean;
  progress: number; // 0 to 1
  cluster: MarkerCluster | null;
  markerPositions: Array<{ id: string; x: number; y: number }>;
}

interface UseScatterAnimationOptions {
  duration?: number; // Animation duration in ms
  easing?: (t: number) => number; // Easing function
  onComplete?: () => void;
}

// Ease out cubic for natural deceleration (like bugs scattering)
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
    easing = easeOutBack,
    onComplete 
  } = options;
  
  const [state, setState] = useState<ScatterState>({
    isAnimating: false,
    progress: 0,
    cluster: null,
    markerPositions: [],
  });
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const animate = useCallback((cluster: MarkerCluster) => {
    cancelAnimation();
    
    setState({
      isAnimating: true,
      progress: 0,
      cluster,
      markerPositions: cluster.markers.map(m => ({
        id: m.market.id,
        x: cluster.center.x,
        y: cluster.center.y,
      })),
    });
    
    startTimeRef.current = performance.now();
    
    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(rawProgress);
      
      setState(prev => {
        if (!prev.cluster) return prev;
        
        const newPositions = prev.cluster.markers.map(m => {
          const startX = prev.cluster!.center.x;
          const startY = prev.cluster!.center.y;
          const endX = m.pos.x;
          const endY = m.pos.y;
          
          return {
            id: m.market.id,
            x: startX + (endX - startX) * easedProgress,
            y: startY + (endY - startY) * easedProgress,
          };
        });
        
        return {
          ...prev,
          progress: easedProgress,
          markerPositions: newPositions,
        };
      });
      
      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
        onComplete?.();
      }
    };
    
    animationRef.current = requestAnimationFrame(tick);
  }, [duration, easing, cancelAnimation, onComplete]);

  const reset = useCallback(() => {
    cancelAnimation();
    setState({
      isAnimating: false,
      progress: 0,
      cluster: null,
      markerPositions: [],
    });
  }, [cancelAnimation]);

  // Reverse animation (scatter back to cluster)
  const reverseAnimate = useCallback(() => {
    if (!state.cluster) return;
    
    cancelAnimation();
    const cluster = state.cluster;
    const currentPositions = [...state.markerPositions];
    
    startTimeRef.current = performance.now();
    
    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / (duration * 0.6), 1); // Faster return
      const easedProgress = easeOutCubic(rawProgress);
      
      setState(prev => {
        if (!cluster) return prev;
        
        const newPositions = currentPositions.map((startPos, i) => {
          const endX = cluster.center.x;
          const endY = cluster.center.y;
          
          return {
            id: startPos.id,
            x: startPos.x + (endX - startPos.x) * easedProgress,
            y: startPos.y + (endY - startPos.y) * easedProgress,
          };
        });
        
        return {
          ...prev,
          progress: 1 - easedProgress,
          markerPositions: newPositions,
        };
      });
      
      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        reset();
      }
    };
    
    animationRef.current = requestAnimationFrame(tick);
  }, [state.cluster, state.markerPositions, duration, cancelAnimation, reset]);

  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  return {
    ...state,
    animate,
    reset,
    reverseAnimate,
  };
}
