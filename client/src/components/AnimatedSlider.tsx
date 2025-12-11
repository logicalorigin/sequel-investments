import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useSpring } from "framer-motion";
import { DollarSign } from "lucide-react";

interface AnimatedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
  "data-testid"?: string;
}

function formatCurrencyDisplay(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function AnimatedSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  prefix = "",
  suffix = "",
  showValue = true,
  formatValue = formatCurrencyDisplay,
  className = "",
  trackClassName = "",
  thumbClassName = "",
  "data-testid": testId,
}: AnimatedSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  
  const percentage = ((localValue - min) / (max - min)) * 100;
  
  const displayValue = useMotionValue(value);
  const springValue = useSpring(displayValue, { stiffness: 300, damping: 30 });
  
  useEffect(() => {
    setLocalValue(value);
    animate(displayValue, value, { duration: 0.2 });
  }, [value, displayValue]);

  const handleTrackClick = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newValue = Math.round((min + percentage * (max - min)) / step) * step;
    
    setLocalValue(newValue);
    onChange(newValue);
    animate(displayValue, newValue, { duration: 0.15 });
  }, [min, max, step, onChange, displayValue]);

  const handleDrag = useCallback((clientX: number) => {
    if (!trackRef.current || !isDragging) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newValue = Math.round((min + percentage * (max - min)) / step) * step;
    
    setLocalValue(newValue);
    displayValue.set(newValue);
    // Update parent state in real-time for live calculations
    onChange(newValue);
  }, [min, max, step, isDragging, displayValue, onChange]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handlePointerMove = (e: PointerEvent) => handleDrag(e.clientX);
      const handlePointerUp = () => handleDragEnd();
      
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
      
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  return (
    <div className={`space-y-2 sm:space-y-3 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-amber-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide">{label}</label>
          )}
          {showValue && (
            <motion.div 
              className="flex items-center gap-0.5 sm:gap-1"
              animate={{ scale: isDragging ? 1.05 : 1 }}
              transition={{ duration: 0.15 }}
            >
              {prefix && <span className="text-amber-400 text-sm sm:text-lg">{prefix}</span>}
              <AnimatedNumber value={localValue} formatValue={formatValue} />
              {suffix && <span className="text-amber-400 text-sm sm:text-lg">{suffix}</span>}
            </motion.div>
          )}
        </div>
      )}
      
      {/* Outer padding container - does NOT stretch */}
      <div className="py-2 sm:py-3">
        {/* Fixed-height track wrapper - this is our positioning context */}
        <div
          ref={trackRef}
          className={`relative h-2 cursor-pointer touch-none ${trackClassName}`}
          onPointerDown={handleTrackClick}
          data-testid={testId}
        >
          {/* Background track - gray */}
          <div className="absolute inset-0 rounded-full bg-gray-300 dark:bg-gray-600" />
          
          {/* Filled portion - amber/gold gradient */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ 
              width: `${percentage}%`,
              background: "linear-gradient(to right, #f59e0b, #fbbf24)"
            }}
          />
          
          {/* Thumb - centered on track using negative margin */}
          <motion.div
            className={`absolute w-6 h-6 rounded-full bg-white shadow-md cursor-grab active:cursor-grabbing touch-none flex items-center justify-center z-10 ${thumbClassName}`}
            style={{ 
              left: `calc(${percentage}% - 12px)`,
              top: '50%',
              marginTop: '-12px'
            }}
            animate={{ 
              scale: isDragging ? 1.15 : 1,
              boxShadow: isDragging 
                ? "0 2px 8px rgba(0,0,0,0.25)" 
                : "0 1px 4px rgba(0,0,0,0.15)"
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 1.12 }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              setIsDragging(true);
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Inner amber circle */}
            <motion.div
              className="w-3.5 h-3.5 rounded-full"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
              animate={{ scale: isDragging ? 1.1 : 1 }}
            />
          </motion.div>
        </div>
      </div>
      
      <div className="flex justify-between text-[10px] sm:text-xs text-amber-400/60">
        <span>{prefix}{formatValue(min)}{suffix}</span>
        <span>{prefix}{formatValue(max)}{suffix}</span>
      </div>
    </div>
  );
}

function AnimatedNumber({ value, formatValue }: { value: number; formatValue: (v: number) => string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  
  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = value;
    const duration = 150;
    const startTime = Date.now();
    
    const animateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      
      setDisplayValue(Math.round(current));
      
      if (progress < 1) {
        requestAnimationFrame(animateValue);
      } else {
        prevValue.current = endValue;
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [value]);
  
  return (
    <motion.span 
      className="text-lg sm:text-2xl font-bold text-amber-500 tabular-nums"
      key={displayValue}
    >
      {formatValue(displayValue)}
    </motion.span>
  );
}

interface CurrencySliderInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  helperText?: string;
  "data-testid"?: string;
}

export function CurrencySliderInput({
  value,
  onChange,
  min = 0,
  max = 2000000,
  step = 5000,
  label,
  helperText,
  "data-testid": testId,
}: CurrencySliderInputProps) {
  const numericValue = parseInt(value.replace(/,/g, "")) || 0;
  
  const handleSliderChange = useCallback((newValue: number) => {
    onChange(newValue.toLocaleString("en-US"));
  }, [onChange]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    const num = parseInt(rawValue) || 0;
    onChange(num.toLocaleString("en-US"));
  }, [onChange]);
  
  return (
    <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-700 space-y-1 sm:space-y-2">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        <label className="text-amber-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide whitespace-nowrap">{label}</label>
        <div className="flex items-center">
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 mr-0.5 sm:mr-1" />
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="0"
            className="w-24 sm:w-32 bg-transparent text-base sm:text-xl font-bold text-amber-500 text-right focus:outline-none"
            data-testid={testId ? `${testId}-input` : undefined}
          />
        </div>
      </div>
      
      <div className="px-1 sm:px-3">
        <AnimatedSlider
          value={numericValue}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          prefix="$"
          showValue={false}
          data-testid={testId ? `${testId}-slider` : undefined}
        />
      </div>
      
      {helperText && (
        <p className="text-amber-400/60 text-[10px] sm:text-xs">{helperText}</p>
      )}
    </div>
  );
}

interface PercentageSliderProps {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  helperText?: string;
  calculatedAmount?: number;
  "data-testid"?: string;
}

export function PercentageSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  helperText,
  calculatedAmount,
  "data-testid": testId,
}: PercentageSliderProps) {
  const numericValue = parseInt(value) || min;
  
  const handleSliderChange = useCallback((newValue: number) => {
    onChange(newValue.toString());
  }, [onChange]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    const num = Math.min(max, Math.max(min, parseInt(rawValue) || min));
    onChange(num.toString());
  }, [onChange, min, max]);
  
  return (
    <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-700 space-y-1 sm:space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-amber-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <input
            type="text"
            value={numericValue}
            onChange={handleInputChange}
            className="w-10 sm:w-12 bg-transparent text-lg sm:text-2xl font-bold text-amber-500 text-right focus:outline-none"
            data-testid={testId ? `${testId}-input` : undefined}
          />
          <span className="text-amber-400 text-sm sm:text-lg">%</span>
        </div>
      </div>
      
      <div className="px-1 sm:px-3">
        <AnimatedSlider
          value={numericValue}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          suffix="%"
          showValue={false}
          data-testid={testId}
        />
      </div>
      
      {calculatedAmount !== undefined && (
        <div className="flex items-center justify-center">
          <motion.span 
            className="text-amber-500 text-xs sm:text-sm font-medium"
            key={calculatedAmount}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            = ${formatCurrencyDisplay(calculatedAmount)} down
          </motion.span>
        </div>
      )}
      
      {helperText && (
        <p className="text-amber-400/60 text-[10px] sm:text-xs text-center">{helperText}</p>
      )}
    </div>
  );
}

export default AnimatedSlider;
