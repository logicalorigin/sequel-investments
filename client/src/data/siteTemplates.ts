export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

export interface HeroSettings {
  style: "gradient" | "image" | "pattern" | "solid";
  imageUrl?: string;
  patternType?: "dots" | "grid" | "waves" | "geometric";
  overlayOpacity?: number; // 0-100
}

export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    card: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: string;
  };
  borderRadius: string;
  buttonStyle: "rounded" | "square" | "pill";
  themePreference: "light" | "dark";
  heroSettings: HeroSettings;
  socialLinks?: SocialLinks;
  favicon?: string;
}

// Google Fonts that work well for professional/financial sites
export const availableFonts = [
  { id: "Inter", name: "Inter", category: "sans-serif" },
  { id: "Roboto", name: "Roboto", category: "sans-serif" },
  { id: "Open Sans", name: "Open Sans", category: "sans-serif" },
  { id: "Lato", name: "Lato", category: "sans-serif" },
  { id: "Montserrat", name: "Montserrat", category: "sans-serif" },
  { id: "Poppins", name: "Poppins", category: "sans-serif" },
  { id: "Source Sans 3", name: "Source Sans 3", category: "sans-serif" },
  { id: "Nunito", name: "Nunito", category: "sans-serif" },
  { id: "Raleway", name: "Raleway", category: "sans-serif" },
  { id: "Work Sans", name: "Work Sans", category: "sans-serif" },
  { id: "DM Sans", name: "DM Sans", category: "sans-serif" },
  { id: "Plus Jakarta Sans", name: "Plus Jakarta Sans", category: "sans-serif" },
  { id: "Playfair Display", name: "Playfair Display", category: "serif" },
  { id: "Merriweather", name: "Merriweather", category: "serif" },
  { id: "Libre Baskerville", name: "Libre Baskerville", category: "serif" },
];

export const siteTemplates: SiteTemplate[] = [
  {
    id: "manhattan",
    name: "Manhattan",
    description: "Corporate and professional with deep navy tones",
    colors: {
      primary: "#1e3a5f",
      secondary: "#475569",
      accent: "#3b82f6",
      background: "#fafafa",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      card: "#ffffff",
    },
    typography: {
      fontFamily: "Inter",
      headingWeight: "600",
    },
    borderRadius: "0.5rem",
    buttonStyle: "rounded",
    themePreference: "light",
    heroSettings: {
      style: "gradient",
      overlayOpacity: 60,
    },
  },
  {
    id: "ember",
    name: "Ember",
    description: "Modern and bold with vibrant red and orange",
    colors: {
      primary: "#dc2626",
      secondary: "#f97316",
      accent: "#fbbf24",
      background: "#0a0a0a",
      foreground: "#fafafa",
      muted: "#1a1a1a",
      card: "#171717",
    },
    typography: {
      fontFamily: "Montserrat",
      headingWeight: "700",
    },
    borderRadius: "0.375rem",
    buttonStyle: "rounded",
    themePreference: "dark",
    heroSettings: {
      style: "gradient",
      overlayOpacity: 70,
    },
  },
  {
    id: "terrain",
    name: "Terrain",
    description: "Warm and approachable with earthy tones",
    colors: {
      primary: "#b45309",
      secondary: "#65a30d",
      accent: "#d97706",
      background: "#fefce8",
      foreground: "#1c1917",
      muted: "#fef3c7",
      card: "#fffbeb",
    },
    typography: {
      fontFamily: "Lato",
      headingWeight: "500",
    },
    borderRadius: "0.75rem",
    buttonStyle: "rounded",
    themePreference: "light",
    heroSettings: {
      style: "pattern",
      patternType: "geometric",
      overlayOpacity: 50,
    },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Luxury and premium with gold accents on dark",
    colors: {
      primary: "#d4a01d",
      secondary: "#1a1a1a",
      accent: "#f59e0b",
      background: "#0a0a0a",
      foreground: "#fafafa",
      muted: "#171717",
      card: "#1f1f1f",
    },
    typography: {
      fontFamily: "Inter",
      headingWeight: "600",
    },
    borderRadius: "0.5rem",
    buttonStyle: "rounded",
    themePreference: "dark",
    heroSettings: {
      style: "gradient",
      overlayOpacity: 80,
    },
  },
  {
    id: "pulse",
    name: "Pulse",
    description: "Tech-forward fintech style with violet and cyan",
    colors: {
      primary: "#8b5cf6",
      secondary: "#3b82f6",
      accent: "#06b6d4",
      background: "#0f172a",
      foreground: "#f8fafc",
      muted: "#1e293b",
      card: "#1e293b",
    },
    typography: {
      fontFamily: "DM Sans",
      headingWeight: "600",
    },
    borderRadius: "0.75rem",
    buttonStyle: "pill",
    themePreference: "dark",
    heroSettings: {
      style: "pattern",
      patternType: "waves",
      overlayOpacity: 60,
    },
  },
  {
    id: "canvas",
    name: "Canvas",
    description: "Minimal and clean with neutral grays",
    colors: {
      primary: "#525252",
      secondary: "#a3a3a3",
      accent: "#262626",
      background: "#ffffff",
      foreground: "#171717",
      muted: "#f5f5f5",
      card: "#fafafa",
    },
    typography: {
      fontFamily: "Work Sans",
      headingWeight: "500",
    },
    borderRadius: "0.25rem",
    buttonStyle: "square",
    themePreference: "light",
    heroSettings: {
      style: "solid",
      overlayOpacity: 0,
    },
  },
];

export function getTemplateById(id: string): SiteTemplate | undefined {
  return siteTemplates.find((template) => template.id === id);
}
