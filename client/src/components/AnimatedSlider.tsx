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
    <div className={`space-y-3 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-white/50 text-xs uppercase tracking-wide">{label}</label>
          )}
          {showValue && (
            <motion.div 
              className="flex items-center gap-1"
              animate={{ scale: isDragging ? 1.05 : 1 }}
              transition={{ duration: 0.15 }}
            >
              {prefix && <span className="text-white/60 text-lg">{prefix}</span>}
              <AnimatedNumber value={localValue} formatValue={formatValue} />
              {suffix && <span className="text-white/60 text-lg">{suffix}</span>}
            </motion.div>
          )}
        </div>
      )}
      
      <div
        ref={trackRef}
        className={`relative h-3 rounded-full cursor-pointer touch-none ${trackClassName}`}
        onPointerDown={handleTrackClick}
        data-testid={testId}
      >
        <div className="absolute inset-0 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
            style={{ width: `${percentage}%` }}
            layoutId="slider-fill"
          />
        </div>
        
        <motion.div
          className="absolute inset-y-0 rounded-full bg-primary/20 blur-lg"
          style={{ width: `${percentage}%` }}
          animate={{ opacity: isDragging ? 0.8 : 0.4 }}
        />
        
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg cursor-grab active:cursor-grabbing touch-none ${thumbClassName}`}
          style={{ left: `calc(${percentage}% - 12px)` }}
          animate={{ 
            scale: isDragging ? 1.2 : 1,
            boxShadow: isDragging 
              ? "0 0 20px rgba(var(--primary-rgb), 0.5)" 
              : "0 4px 12px rgba(0,0,0,0.3)"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1.15 }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            setIsDragging(true);
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-white/30"
            animate={{ scale: isDragging ? [1, 1.5, 1] : 1, opacity: isDragging ? [0.5, 0, 0.5] : 0 }}
            transition={{ repeat: isDragging ? Infinity : 0, duration: 0.8 }}
          />
        </motion.div>
      </div>
      
      <div className="flex justify-between text-xs text-white/30">
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
      className="text-2xl font-bold text-white tabular-nums"
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
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-white/50 text-xs uppercase tracking-wide">{label}</label>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 text-white/40 mr-1" />
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="0"
            className="w-32 bg-transparent text-xl font-bold text-white text-right focus:outline-none"
            data-testid={testId ? `${testId}-input` : undefined}
          />
        </div>
      </div>
      
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
      
      {helperText && (
        <p className="text-white/40 text-xs">{helperText}</p>
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
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-white/50 text-xs uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={numericValue}
            onChange={handleInputChange}
            className="w-12 bg-transparent text-2xl font-bold text-white text-right focus:outline-none"
            data-testid={testId ? `${testId}-input` : undefined}
          />
          <span className="text-white/60 text-lg">%</span>
        </div>
      </div>
      
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
      
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-xs">{min}%</span>
        {calculatedAmount !== undefined && (
          <motion.span 
            className="text-primary text-sm font-medium"
            key={calculatedAmount}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            = ${formatCurrencyDisplay(calculatedAmount)} down
          </motion.span>
        )}
        <span className="text-white/30 text-xs">{max}%</span>
      </div>
      
      {helperText && (
        <p className="text-white/40 text-xs text-center">{helperText}</p>
      )}
    </div>
  );
}

export default AnimatedSlider;
