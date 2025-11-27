interface GeometricPatternProps {
  variant?: "buildings" | "grid" | "minimal" | "construction" | "abstract";
  className?: string;
  opacity?: number;
  strokeColor?: string;
}

export function GeometricPattern({ 
  variant = "buildings", 
  className = "",
  opacity = 0.15,
  strokeColor = "currentColor"
}: GeometricPatternProps) {
  
  if (variant === "buildings") {
    return (
      <svg 
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        viewBox="0 0 800 400" 
        preserveAspectRatio="xMaxYMid slice"
        style={{ opacity }}
      >
        <g stroke={strokeColor} strokeWidth="1.5" fill="none">
          {/* Building 1 - Tall parallelogram */}
          <path d="M520 380 L520 120 L560 80 L560 340 Z" />
          <path d="M520 120 L560 80" />
          
          {/* Building 2 - Medium */}
          <path d="M580 380 L580 160 L620 120 L620 340 Z" />
          <path d="M580 160 L620 120" />
          
          {/* Building 3 - Short */}
          <path d="M640 380 L640 200 L680 160 L680 340 Z" />
          <path d="M640 200 L680 160" />
          
          {/* Building 4 - Tallest */}
          <path d="M700 380 L700 80 L740 40 L740 340 Z" />
          <path d="M700 80 L740 40" />
          
          {/* Building 5 - Medium tall */}
          <path d="M760 380 L760 140 L800 100 L800 340 Z" />
          <path d="M760 140 L800 100" />
        </g>
      </svg>
    );
  }

  if (variant === "grid") {
    return (
      <svg 
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        viewBox="0 0 800 400" 
        preserveAspectRatio="xMaxYMid slice"
        style={{ opacity }}
      >
        <defs>
          <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path 
              d="M 60 0 L 0 0 0 60" 
              fill="none" 
              stroke={strokeColor} 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridPattern)" />
        
        <g stroke={strokeColor} strokeWidth="1.5" fill="none">
          {/* Accent squares */}
          <rect x="600" y="80" width="80" height="80" transform="rotate(15 640 120)" />
          <rect x="680" y="180" width="60" height="60" transform="rotate(-10 710 210)" />
          <rect x="720" y="60" width="50" height="50" transform="rotate(25 745 85)" />
        </g>
      </svg>
    );
  }

  if (variant === "minimal") {
    return (
      <svg 
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        viewBox="0 0 800 400" 
        preserveAspectRatio="xMaxYMid slice"
        style={{ opacity }}
      >
        <g stroke={strokeColor} strokeWidth="1.5" fill="none">
          {/* Simple angular lines */}
          <path d="M600 350 L650 50" />
          <path d="M650 380 L700 80" />
          <path d="M700 360 L750 60" />
          <path d="M750 340 L800 40" />
          
          {/* Connecting angles */}
          <path d="M600 350 L650 320 L650 380" />
          <path d="M700 80 L750 100" />
        </g>
      </svg>
    );
  }

  if (variant === "construction") {
    return (
      <svg 
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        viewBox="0 0 800 400" 
        preserveAspectRatio="xMaxYMid slice"
        style={{ opacity }}
      >
        <g stroke={strokeColor} strokeWidth="1.5" fill="none">
          {/* Crane structure */}
          <path d="M680 380 L680 60 L780 60" />
          <path d="M680 60 L660 80" />
          <path d="M680 100 L750 100" />
          <path d="M720 60 L720 100" />
          <path d="M750 60 L750 200" />
          <path d="M745 180 L755 180 L750 200 Z" />
          
          {/* Building frame */}
          <path d="M540 380 L540 180 L600 180 L600 380" />
          <path d="M540 220 L600 220" />
          <path d="M540 260 L600 260" />
          <path d="M540 300 L600 300" />
          <path d="M540 340 L600 340" />
          <path d="M570 180 L570 380" />
          
          {/* Scaffolding */}
          <path d="M620 380 L620 240 L660 240 L660 380" />
          <path d="M620 280 L660 280" />
          <path d="M620 320 L660 320" />
          <path d="M620 360 L660 360" />
        </g>
      </svg>
    );
  }

  if (variant === "abstract") {
    return (
      <svg 
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        viewBox="0 0 800 400" 
        preserveAspectRatio="xMaxYMid slice"
        style={{ opacity }}
      >
        <g stroke={strokeColor} strokeWidth="1.5" fill="none">
          {/* Overlapping rectangles */}
          <rect x="550" y="100" width="100" height="150" transform="skewX(-10)" />
          <rect x="620" y="80" width="80" height="180" transform="skewX(-10)" />
          <rect x="680" y="120" width="90" height="140" transform="skewX(-10)" />
          
          {/* Accent lines */}
          <path d="M500 300 L550 250 L600 280" />
          <path d="M720 300 L780 260" />
          
          {/* Small decorative elements */}
          <circle cx="540" cy="80" r="15" />
          <circle cx="760" cy="320" r="10" />
        </g>
      </svg>
    );
  }

  return null;
}

export function GeometricAccent({ 
  className = "",
  size = "md"
}: { 
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-40 h-40", 
    lg: "w-64 h-64"
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M20 90 L20 30 L40 10 L40 70 Z" opacity="0.3" />
      <path d="M45 90 L45 40 L65 20 L65 70 Z" opacity="0.2" />
      <path d="M70 90 L70 50 L90 30 L90 70 Z" opacity="0.15" />
    </svg>
  );
}

export function GeometricDivider({
  className = ""
}: {
  className?: string;
}) {
  return (
    <svg 
      className={`w-full h-8 ${className}`}
      viewBox="0 0 800 32"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.2"
    >
      <path d="M0 16 L800 16" />
      <path d="M380 8 L400 16 L420 8" />
      <path d="M380 24 L400 16 L420 24" />
    </svg>
  );
}
