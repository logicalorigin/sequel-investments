import { useState, useEffect } from "react";
import { Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { APIProvider } from "@vis.gl/react-google-maps";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type MapStyle = "dark" | "grayscale" | "night" | "duplex" | "monochrome" | "gradient" | "inverted" | "dotMatrix" | "sweetheart";

interface StylizedMapPreviewProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  zoom?: number;
  style?: MapStyle;
  className?: string;
  borderRadius?: string;
  showControls?: boolean;
  onStyleChange?: (style: MapStyle) => void;
}

const styleFilters: Record<MapStyle, string> = {
  dark: "grayscale(1) invert(1)",
  grayscale: "grayscale(1)",
  night: "grayscale(1) invert(1) hue-rotate(180deg)",
  duplex: "grayscale(1) invert(1) sepia(1)",
  monochrome: "grayscale(1)",
  gradient: "grayscale(1)",
  inverted: "invert(1)",
  dotMatrix: "grayscale(1)",
  sweetheart: "grayscale(1)",
};

const overlayColors: Record<MapStyle, { color: string; blendMode: string; opacity: number }> = {
  dark: { color: "transparent", blendMode: "normal", opacity: 0 },
  grayscale: { color: "transparent", blendMode: "normal", opacity: 0 },
  night: { color: "rgb(49, 255, 0)", blendMode: "overlay", opacity: 0.3 },
  duplex: { color: "rgb(255, 180, 100)", blendMode: "overlay", opacity: 0.4 },
  monochrome: { color: "rgb(8, 0, 255)", blendMode: "overlay", opacity: 0.3 },
  gradient: { color: "rgb(202, 242, 242)", blendMode: "difference", opacity: 0.5 },
  inverted: { color: "transparent", blendMode: "normal", opacity: 0 },
  dotMatrix: { color: "rgba(226, 255, 0, 0.2)", blendMode: "multiply", opacity: 1 },
  sweetheart: { color: "rgb(255, 0, 226)", blendMode: "lighten", opacity: 0.5 },
};

const styleLabels: Record<MapStyle, string> = {
  dark: "Dark Mode",
  grayscale: "Grayscale",
  night: "Night Mode",
  duplex: "Duplex",
  monochrome: "Monochrome",
  gradient: "Gradient",
  inverted: "Inverted",
  dotMatrix: "Dot Matrix",
  sweetheart: "Sweetheart",
};

function MapContent({
  latitude,
  longitude,
  zoom = 13,
  mapStyle,
}: {
  latitude: number;
  longitude: number;
  zoom: number;
  mapStyle: MapStyle;
}) {
  const coreLib = useMapsLibrary("core");
  
  return (
    <Map
      defaultCenter={{ lat: latitude, lng: longitude }}
      defaultZoom={zoom}
      gestureHandling="cooperative"
      disableDefaultUI={true}
      mapId="stylized-map"
      style={{ width: "100%", height: "100%" }}
    >
      {coreLib && (
        <Marker
          position={{ lat: latitude, lng: longitude }}
        />
      )}
    </Map>
  );
}

function NoiseOverlay() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "64px 64px",
      }}
    />
  );
}

function StylizedMapInner({
  latitude = 40.7128,
  longitude = -74.006,
  address,
  zoom = 13,
  style = "dark",
  className,
  borderRadius = "12px",
  showControls = false,
  onStyleChange,
}: StylizedMapPreviewProps) {
  const [currentStyle, setCurrentStyle] = useState<MapStyle>(style);
  const filter = styleFilters[currentStyle];
  const overlay = overlayColors[currentStyle];

  const handleStyleChange = (newStyle: MapStyle) => {
    setCurrentStyle(newStyle);
    onStyleChange?.(newStyle);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("relative overflow-hidden", className)}
      style={{ borderRadius }}
    >
      {/* Map Container with Filter */}
      <div 
        className="relative w-full h-full"
        style={{ filter, WebkitFilter: filter }}
      >
        <MapContent
          latitude={latitude}
          longitude={longitude}
          zoom={zoom}
          mapStyle={currentStyle}
        />
      </div>

      {/* Color Overlay */}
      <AnimatePresence>
        {overlay.opacity > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: overlay.opacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: overlay.color,
              mixBlendMode: overlay.blendMode as any,
            }}
          />
        )}
      </AnimatePresence>

      {/* Noise Texture (for certain styles) */}
      {["night", "duplex", "dotMatrix"].includes(currentStyle) && (
        <NoiseOverlay />
      )}

      {/* Gradient Overlay for gradient style */}
      {currentStyle === "gradient" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.4) 0%, rgba(194, 101, 61, 0.3) 50%, transparent 100%)",
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Address Label */}
      {address && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2"
        >
          <p className="text-white text-sm font-medium truncate">{address}</p>
        </motion.div>
      )}

      {/* Style Selector (optional) */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-3 right-3 flex flex-col gap-1"
        >
          {(Object.keys(styleFilters) as MapStyle[]).slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => handleStyleChange(s)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-all",
                currentStyle === s
                  ? "bg-[#D4A01D] text-white"
                  : "bg-black/50 text-white/70 hover:bg-black/70 hover:text-white"
              )}
            >
              {styleLabels[s]}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function StylizedMapPreview(props: StylizedMapPreviewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div 
        className={cn(
          "relative overflow-hidden bg-slate-800/50 flex items-center justify-center",
          props.className
        )}
        style={{ borderRadius: props.borderRadius || "12px" }}
      >
        <div className="text-white/40 text-sm text-center p-4">
          <p>Map preview unavailable</p>
          <p className="text-xs mt-1">Google Maps API key required</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <StylizedMapInner {...props} />
    </APIProvider>
  );
}

export { type MapStyle, styleLabels };
