import { useState, useRef, useCallback, useEffect } from "react";

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ZoomState {
  isAnimating: boolean;
  currentViewBox: ViewBox;
}

interface UseZoomAnimationOptions {
  duration?: number;
  easing?: (t: number) => number;
}

// Ease in-out cubic for smooth zoom
const easeInOutCubic = (t: number): number => 
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function useZoomAnimation(
  baseViewBox: ViewBox,
  options: UseZoomAnimationOptions = {}
) {
  const { duration = 350, easing = easeInOutCubic } = options;
  
  const [state, setState] = useState<ZoomState>({
    isAnimating: false,
    currentViewBox: baseViewBox,
  });
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startViewBoxRef = useRef<ViewBox>(baseViewBox);
  const targetViewBoxRef = useRef<ViewBox>(baseViewBox);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const animateTo = useCallback((targetViewBox: ViewBox, customDuration?: number) => {
    cancelAnimation();
    
    startViewBoxRef.current = state.currentViewBox;
    targetViewBoxRef.current = targetViewBox;
    startTimeRef.current = performance.now();
    
    const animDuration = customDuration ?? duration;
    
    setState(prev => ({ ...prev, isAnimating: true }));
    
    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / animDuration, 1);
      const easedProgress = easing(rawProgress);
      
      const start = startViewBoxRef.current;
      const target = targetViewBoxRef.current;
      
      const newViewBox: ViewBox = {
        x: start.x + (target.x - start.x) * easedProgress,
        y: start.y + (target.y - start.y) * easedProgress,
        width: start.width + (target.width - start.width) * easedProgress,
        height: start.height + (target.height - start.height) * easedProgress,
      };
      
      setState({
        isAnimating: rawProgress < 1,
        currentViewBox: newViewBox,
      });
      
      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(tick);
  }, [duration, easing, cancelAnimation, state.currentViewBox]);

  const zoomToPoint = useCallback((
    centerX: number, 
    centerY: number, 
    zoomLevel: number,
    customDuration?: number
  ) => {
    const newWidth = baseViewBox.width / zoomLevel;
    const newHeight = baseViewBox.height / zoomLevel;
    
    animateTo({
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight,
    }, customDuration);
  }, [baseViewBox, animateTo]);

  const resetZoom = useCallback((customDuration?: number) => {
    animateTo(baseViewBox, customDuration ?? duration * 0.7);
  }, [baseViewBox, animateTo, duration]);

  const setViewBoxImmediate = useCallback((viewBox: ViewBox) => {
    cancelAnimation();
    setState({
      isAnimating: false,
      currentViewBox: viewBox,
    });
  }, [cancelAnimation]);

  // Update base viewBox if it changes
  useEffect(() => {
    if (!state.isAnimating) {
      setState(prev => ({ ...prev, currentViewBox: baseViewBox }));
    }
  }, [baseViewBox.x, baseViewBox.y, baseViewBox.width, baseViewBox.height]);

  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  return {
    ...state,
    animateTo,
    zoomToPoint,
    resetZoom,
    setViewBoxImmediate,
    viewBoxString: `${state.currentViewBox.x} ${state.currentViewBox.y} ${state.currentViewBox.width} ${state.currentViewBox.height}`,
  };
}
