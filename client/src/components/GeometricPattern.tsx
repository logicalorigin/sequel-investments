interface GeometricPatternProps {
  variant?: "circles" | "bubbles" | "orbs" | "dots" | "rings";
  className?: string;
  opacity?: number;
  animated?: boolean;
}

export function GeometricPattern({ 
  variant = "circles", 
  className = "",
  opacity = 0.15,
  animated = true
}: GeometricPatternProps) {
  
  if (variant === "circles") {
    return (
      <div 
        className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
        style={{ opacity }}
      >
        <svg 
          className="absolute w-full h-full"
          viewBox="0 0 800 400" 
          preserveAspectRatio="xMaxYMid slice"
        >
          <defs>
            <linearGradient id="circleGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="650" cy="120" r="80" className={animated ? "animate-pulse-slow" : ""} />
            <circle cx="720" cy="200" r="120" className={animated ? "animate-pulse-slower" : ""} />
            <circle cx="580" cy="280" r="60" className={animated ? "animate-pulse-slow" : ""} />
            <circle cx="760" cy="320" r="40" className={animated ? "animate-pulse-slower" : ""} />
            <circle cx="500" cy="150" r="30" className={animated ? "animate-pulse-slow" : ""} />
          </g>
          <g fill="url(#circleGradient1)">
            <circle cx="680" cy="160" r="50" className={animated ? "animate-float" : ""} />
            <circle cx="750" cy="280" r="35" className={animated ? "animate-float-delayed" : ""} />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === "bubbles") {
    return (
      <div 
        className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
        style={{ opacity }}
      >
        <svg 
          className="absolute w-full h-full"
          viewBox="0 0 800 400" 
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="bubbleGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
            </radialGradient>
          </defs>
          <g fill="url(#bubbleGradient)">
            <circle cx="100" cy="80" r="60" className={animated ? "animate-float" : ""} />
            <circle cx="200" cy="300" r="45" className={animated ? "animate-float-delayed" : ""} />
            <circle cx="350" cy="150" r="35" className={animated ? "animate-float" : ""} />
            <circle cx="500" cy="350" r="50" className={animated ? "animate-float-delayed" : ""} />
            <circle cx="650" cy="100" r="70" className={animated ? "animate-float" : ""} />
            <circle cx="720" cy="280" r="55" className={animated ? "animate-float-delayed" : ""} />
            <circle cx="780" cy="180" r="40" className={animated ? "animate-float" : ""} />
          </g>
          <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
            <circle cx="150" cy="200" r="25" className={animated ? "animate-pulse-slow" : ""} />
            <circle cx="450" cy="80" r="20" className={animated ? "animate-pulse-slower" : ""} />
            <circle cx="600" cy="320" r="30" className={animated ? "animate-pulse-slow" : ""} />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === "orbs") {
    return (
      <div 
        className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
        style={{ opacity }}
      >
        <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full bg-current opacity-20 blur-3xl ${animated ? "animate-pulse-slow" : ""}`} />
        <div className={`absolute top-1/2 -right-10 w-60 h-60 rounded-full bg-current opacity-15 blur-2xl ${animated ? "animate-float" : ""}`} />
        <div className={`absolute -bottom-10 right-1/4 w-40 h-40 rounded-full bg-current opacity-25 blur-xl ${animated ? "animate-float-delayed" : ""}`} />
        <div className={`absolute top-1/4 right-1/3 w-32 h-32 rounded-full bg-current opacity-10 blur-lg ${animated ? "animate-pulse-slower" : ""}`} />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div 
        className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
        style={{ opacity }}
      >
        <svg 
          className="absolute w-full h-full"
          viewBox="0 0 800 400" 
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="dotPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
          <g fill="currentColor">
            <circle cx="600" cy="100" r="8" className={animated ? "animate-pulse-slow" : ""} />
            <circle cx="700" cy="200" r="6" className={animated ? "animate-pulse-slower" : ""} />
            <circle cx="650" cy="300" r="10" className={animated ? "animate-pulse-slow" : ""} />
            <circle cx="750" cy="150" r="5" className={animated ? "animate-pulse-slower" : ""} />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === "rings") {
    return (
      <div 
        className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
        style={{ opacity }}
      >
        <svg 
          className="absolute w-full h-full"
          viewBox="0 0 800 400" 
          preserveAspectRatio="xMaxYMid slice"
        >
          <g fill="none" stroke="currentColor">
            <circle cx="700" cy="200" r="150" strokeWidth="1" className={animated ? "animate-spin-slow" : ""} style={{ transformOrigin: "700px 200px" }} />
            <circle cx="700" cy="200" r="120" strokeWidth="1.5" strokeDasharray="10 5" className={animated ? "animate-spin-slower" : ""} style={{ transformOrigin: "700px 200px" }} />
            <circle cx="700" cy="200" r="90" strokeWidth="2" className={animated ? "animate-spin-slow" : ""} style={{ transformOrigin: "700px 200px" }} />
            <circle cx="700" cy="200" r="60" strokeWidth="1" strokeDasharray="5 10" className={animated ? "animate-spin-slower" : ""} style={{ transformOrigin: "700px 200px" }} />
            <circle cx="700" cy="200" r="30" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          </g>
          <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5">
            <circle cx="200" cy="100" r="50" className={animated ? "animate-pulse-slow" : ""} />
            <circle cx="200" cy="100" r="35" className={animated ? "animate-pulse-slower" : ""} />
            <circle cx="150" cy="300" r="40" className={animated ? "animate-pulse-slow" : ""} />
          </g>
        </svg>
      </div>
    );
  }

  return null;
}

export function FloatingCircles({
  className = "",
  count = 5,
  minSize = 20,
  maxSize = 80
}: {
  className?: string;
  count?: number;
  minSize?: number;
  maxSize?: number;
}) {
  const circles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: minSize + Math.random() * (maxSize - minSize),
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {circles.map((circle) => (
        <div
          key={circle.id}
          className="absolute rounded-full bg-current opacity-10 animate-float"
          style={{
            width: circle.size,
            height: circle.size,
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            animationDelay: `${circle.delay}s`
          }}
        />
      ))}
    </div>
  );
}

export function AnimatedDots({
  className = ""
}: {
  className?: string;
}) {
  return (
    <div className={`flex gap-1 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export function PulsingCircle({
  className = "",
  size = "md"
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping" />
      <div className="absolute inset-2 rounded-full bg-current opacity-40" />
    </div>
  );
}

export function CircleAccent({
  className = "",
  position = "right"
}: {
  className?: string;
  position?: "left" | "right" | "center";
}) {
  const positionClasses = {
    left: "-left-20",
    right: "-right-20",
    center: "left-1/2 -translate-x-1/2"
  };

  return (
    <div className={`absolute ${positionClasses[position]} top-1/2 -translate-y-1/2 pointer-events-none ${className}`}>
      <div className="relative">
        <div className="w-64 h-64 rounded-full border border-current opacity-10 animate-pulse-slow" />
        <div className="absolute inset-8 rounded-full border border-current opacity-15 animate-pulse-slower" />
        <div className="absolute inset-16 rounded-full bg-current opacity-5" />
      </div>
    </div>
  );
}
