import { Phone, Mail, MapPin, ChevronRight, Home, DollarSign, Wrench, Building, Star } from "lucide-react";

interface PreviewFormData {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  mutedColor: string;
  cardColor: string;
  fontFamily: string;
  headingWeight: string;
  borderRadius: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  footerText: string;
}

interface LiveSitePreviewProps {
  formData: PreviewFormData;
}

function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "45 90% 50%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function getContrastColor(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "#ffffff";
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export function LiveSitePreview({ formData }: LiveSitePreviewProps) {
  const cssVars = {
    "--preview-primary": formData.primaryColor,
    "--preview-secondary": formData.secondaryColor,
    "--preview-accent": formData.accentColor,
    "--preview-background": formData.backgroundColor,
    "--preview-foreground": formData.foregroundColor,
    "--preview-muted": formData.mutedColor,
    "--preview-card": formData.cardColor,
    "--preview-radius": formData.borderRadius,
    "--preview-font": formData.fontFamily,
  } as React.CSSProperties;

  const isLightBg = getContrastColor(formData.backgroundColor) === "#000000";
  const buttonTextColor = getContrastColor(formData.primaryColor);

  return (
    <div 
      className="relative overflow-hidden rounded-lg border shadow-lg"
      style={{
        ...cssVars,
        fontFamily: formData.fontFamily,
        transform: "scale(1)",
        transformOrigin: "top left",
      }}
      data-testid="live-site-preview"
    >
      <div 
        className="w-full"
        style={{ 
          backgroundColor: formData.backgroundColor,
          color: formData.foregroundColor,
        }}
      >
        <div 
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{ 
            borderColor: isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-1">
            {formData.logoUrl ? (
              <img 
                src={formData.logoUrl} 
                alt="Logo" 
                className="h-4 max-w-[80px] object-contain"
              />
            ) : (
              <div className="flex items-center text-xs">
                <span 
                  className="font-bold"
                  style={{ 
                    color: formData.primaryColor,
                    fontWeight: formData.headingWeight,
                  }}
                >
                  {formData.companyName.split(" ")[0]}
                </span>
                <span className="font-light ml-0.5" style={{ color: formData.foregroundColor }}>
                  {formData.companyName.split(" ").slice(1).join(" ")}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[8px]" style={{ color: formData.foregroundColor }}>
            <span className="opacity-60">DSCR</span>
            <span className="opacity-60">Fix & Flip</span>
            <span className="opacity-60">Construction</span>
          </div>
        </div>

        <div 
          className="relative px-4 py-6"
          style={{
            background: isLightBg 
              ? `linear-gradient(135deg, ${formData.mutedColor} 0%, ${formData.backgroundColor} 100%)`
              : `linear-gradient(135deg, ${formData.secondaryColor} 0%, ${formData.backgroundColor} 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute top-2 right-4 w-16 h-16 rounded-full blur-xl"
              style={{ backgroundColor: formData.primaryColor }}
            />
          </div>
          <div className="relative z-10">
            <h2 
              className="text-sm mb-1"
              style={{ 
                color: formData.foregroundColor,
                fontWeight: formData.headingWeight,
              }}
            >
              Fund Your Next Deal
            </h2>
            <p 
              className="text-[9px] mb-3 opacity-70"
              style={{ color: formData.foregroundColor }}
            >
              Fast, flexible financing for real estate investors
            </p>
            <button
              className="px-3 py-1 text-[9px] font-medium flex items-center gap-1 transition-transform hover:scale-105"
              style={{
                backgroundColor: formData.primaryColor,
                color: buttonTextColor,
                borderRadius: formData.borderRadius,
              }}
            >
              Get Started
              <ChevronRight className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        <div 
          className="px-3 py-4"
          style={{ backgroundColor: formData.mutedColor }}
        >
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: DollarSign, label: "DSCR Loans", desc: "Long-term rental" },
              { icon: Wrench, label: "Fix & Flip", desc: "Short-term bridge" },
              { icon: Building, label: "Construction", desc: "Ground-up builds" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-2 text-center"
                style={{
                  backgroundColor: formData.cardColor,
                  borderRadius: formData.borderRadius,
                }}
              >
                <item.icon 
                  className="h-4 w-4 mx-auto mb-1"
                  style={{ color: formData.primaryColor }}
                />
                <div 
                  className="text-[8px] font-medium mb-0.5"
                  style={{ 
                    color: formData.foregroundColor,
                    fontWeight: formData.headingWeight,
                  }}
                >
                  {item.label}
                </div>
                <div 
                  className="text-[7px] opacity-60"
                  style={{ color: formData.foregroundColor }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="flex -space-x-1"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[6px]"
                  style={{
                    backgroundColor: formData.mutedColor,
                    borderColor: formData.cardColor,
                    color: formData.foregroundColor,
                  }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-2 w-2 fill-current"
                  style={{ color: formData.accentColor }}
                />
              ))}
            </div>
            <span 
              className="text-[7px] opacity-60"
              style={{ color: formData.foregroundColor }}
            >
              500+ funded deals
            </span>
          </div>
        </div>

        <div 
          className="px-3 py-2 border-t"
          style={{ 
            backgroundColor: isLightBg ? formData.mutedColor : formData.secondaryColor,
            borderColor: isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-[7px]" style={{ color: formData.foregroundColor }}>
              <span style={{ color: formData.primaryColor, fontWeight: formData.headingWeight }}>
                {formData.companyName.split(" ")[0]}
              </span>
              <span className="opacity-60"> {formData.companyName.split(" ").slice(1).join(" ")}</span>
            </div>
            <div className="flex items-center gap-2 text-[6px] opacity-60" style={{ color: formData.foregroundColor }}>
              <span className="flex items-center gap-0.5">
                <Phone className="h-2 w-2" />
                {formData.contactPhone.split(".")[0]}...
              </span>
              <span className="flex items-center gap-0.5">
                <Mail className="h-2 w-2" />
                {formData.contactEmail.split("@")[0]}...
              </span>
            </div>
          </div>
          {formData.footerText && (
            <div 
              className="text-[6px] mt-1 opacity-50 truncate"
              style={{ color: formData.foregroundColor }}
            >
              {formData.footerText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
