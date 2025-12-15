import type { SectionStyleVariant, VariantSectionType, SectionStyleVariantsConfig } from "./schema";

export interface VariantStyles {
  layout: string;
  spacing: string;
  typography: {
    headline: string;
    body: string;
  };
  background: string;
  card?: string;
  icon?: string;
  animation?: string;
  special?: Record<string, string>;
}

export interface SectionVariantDefinition {
  name: string;
  description: string;
  styles: VariantStyles;
}

type VariantRegistry = Record<VariantSectionType, Record<SectionStyleVariant, SectionVariantDefinition>>;

export const sectionVariantRegistry: VariantRegistry = {
  hero: {
    variantA: {
      name: "Clean & Minimal",
      description: "Large centered headline with generous whitespace, single prominent CTA",
      styles: {
        layout: "centered single-column max-w-4xl mx-auto",
        spacing: "py-24 md:py-32",
        typography: {
          headline: "text-4xl md:text-5xl lg:text-6xl font-light tracking-tight",
          body: "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto",
        },
        background: "bg-background",
        animation: "fade-in",
      },
    },
    variantB: {
      name: "Bold & Dynamic",
      description: "Split-screen layout with strong color overlays and animated backgrounds",
      styles: {
        layout: "grid md:grid-cols-2 gap-8 items-center",
        spacing: "py-20 md:py-28",
        typography: {
          headline: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight",
          body: "text-lg md:text-xl",
        },
        background: "bg-gradient-to-br from-primary/10 via-background to-secondary/10",
        animation: "slide-in-left",
        special: {
          overlay: "bg-black/60",
          pattern: "opacity-20",
        },
      },
    },
    variantC: {
      name: "Professional & Structured",
      description: "Traditional layout with photography background and clear hierarchy",
      styles: {
        layout: "max-w-3xl",
        spacing: "py-16 md:py-24",
        typography: {
          headline: "text-3xl md:text-4xl lg:text-5xl font-semibold",
          body: "text-base md:text-lg text-muted-foreground",
        },
        background: "bg-muted/50",
        special: {
          overlay: "bg-black/50",
          trustBadges: "inline-flex",
        },
      },
    },
  },

  feature_highlights: {
    variantA: {
      name: "Card Grid - Clean",
      description: "3-column grid with subtle card borders and minimal shadows",
      styles: {
        layout: "grid md:grid-cols-3 gap-6",
        spacing: "py-16 md:py-20",
        typography: {
          headline: "text-xl font-semibold",
          body: "text-sm text-muted-foreground",
        },
        background: "bg-background",
        card: "bg-card border border-border rounded-lg p-6 hover:-translate-y-1 transition-transform",
        icon: "w-10 h-10 text-primary",
      },
    },
    variantB: {
      name: "Highlight Boxes - Bold",
      description: "Alternating left/right layout with accent colors and large icons",
      styles: {
        layout: "space-y-12 md:space-y-16",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-2xl md:text-3xl font-bold",
          body: "text-lg",
        },
        background: "bg-gradient-to-r from-primary/5 to-secondary/5",
        icon: "w-16 h-16 text-primary",
        special: {
          alternating: "even:flex-row-reverse",
          pattern: "opacity-10",
        },
      },
    },
    variantC: {
      name: "List-Based - Professional",
      description: "Vertical list with checkmarks, grouped by category",
      styles: {
        layout: "max-w-3xl mx-auto space-y-4",
        spacing: "py-8 md:py-12",
        typography: {
          headline: "text-lg font-semibold",
          body: "text-sm text-muted-foreground",
        },
        background: "bg-background",
        icon: "w-5 h-5 text-green-500",
        special: {
          dividers: "border-b border-border",
        },
      },
    },
  },

  testimonials: {
    variantA: {
      name: "Minimal Cards",
      description: "3-column grid of simple quote cards with avatars",
      styles: {
        layout: "grid md:grid-cols-3 gap-6",
        spacing: "py-16 md:py-20",
        typography: {
          headline: "text-sm font-semibold",
          body: "text-base italic",
        },
        background: "bg-background",
        card: "bg-card border border-border rounded-lg p-6",
        special: {
          avatar: "w-12 h-12 rounded-full",
          stars: "text-amber-400",
        },
      },
    },
    variantB: {
      name: "Featured Carousel",
      description: "Large single testimonial with rotation and navigation",
      styles: {
        layout: "max-w-4xl mx-auto text-center",
        spacing: "py-20 md:py-28",
        typography: {
          headline: "text-lg font-bold",
          body: "text-xl md:text-2xl",
        },
        background: "bg-gradient-to-b from-muted/30 to-background",
        special: {
          avatar: "w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto",
          navigation: "flex justify-center gap-2 mt-8",
        },
        animation: "fade-in",
      },
    },
    variantC: {
      name: "Grid with Metrics",
      description: "Compact grid with integrated loan metrics and badges",
      styles: {
        layout: "grid md:grid-cols-2 lg:grid-cols-3 gap-4",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-xs font-semibold",
          body: "text-sm",
        },
        background: "bg-muted/30",
        card: "bg-card rounded-md p-4",
        special: {
          avatar: "w-10 h-10 rounded-full",
          metrics: "text-lg font-bold text-primary",
          badge: "rounded-full px-2 py-0.5 text-xs bg-primary/10 text-primary",
        },
      },
    },
  },

  cta_banner: {
    variantA: {
      name: "Centered Minimal",
      description: "Single centered headline with one prominent button",
      styles: {
        layout: "max-w-2xl mx-auto text-center",
        spacing: "py-16 md:py-24",
        typography: {
          headline: "text-3xl md:text-4xl font-bold text-white",
          body: "text-lg text-white/80",
        },
        background: "bg-gradient-to-r from-primary to-primary/80",
        special: {
          button: "bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg",
        },
      },
    },
    variantB: {
      name: "Split with Visual",
      description: "50/50 split with message and visual element",
      styles: {
        layout: "grid md:grid-cols-2 gap-8 md:gap-12 items-center",
        spacing: "py-20 md:py-28",
        typography: {
          headline: "text-3xl font-bold",
          body: "text-lg",
        },
        background: "bg-gradient-to-br from-secondary/10 to-primary/10",
        special: {
          visual: "w-80 h-80",
          buttons: "flex gap-4",
        },
      },
    },
    variantC: {
      name: "Form-Integrated",
      description: "Inline lead capture form with benefits list",
      styles: {
        layout: "grid md:grid-cols-5 gap-8 items-start",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-2xl font-semibold",
          body: "text-base",
        },
        background: "bg-card border border-border rounded-lg p-8",
        special: {
          benefitsList: "md:col-span-3 space-y-3",
          form: "md:col-span-2",
          checkmark: "text-green-500 w-5 h-5",
        },
      },
    },
  },

  stats_bar: {
    variantA: {
      name: "Horizontal Minimal",
      description: "4-column inline stats with large numbers",
      styles: {
        layout: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center",
        spacing: "py-8 md:py-12",
        typography: {
          headline: "text-3xl md:text-4xl font-bold text-primary",
          body: "text-sm text-muted-foreground",
        },
        background: "bg-card border-y border-border",
      },
    },
    variantB: {
      name: "Badge Grid",
      description: "Logo-style badges or certification icons",
      styles: {
        layout: "flex flex-wrap justify-center gap-6 md:gap-8",
        spacing: "py-6 md:py-8",
        typography: {
          headline: "",
          body: "text-xs text-muted-foreground text-center",
        },
        background: "bg-muted/50",
        special: {
          badge: "w-20 h-20 md:w-24 md:h-24 opacity-70 hover:opacity-100 transition-opacity",
        },
      },
    },
    variantC: {
      name: "Feature Stats",
      description: "2-row layout with icons and detailed descriptions",
      styles: {
        layout: "grid grid-cols-2 md:grid-cols-3 gap-4",
        spacing: "py-4",
        typography: {
          headline: "text-2xl font-bold",
          body: "text-sm font-semibold",
        },
        background: "bg-card rounded-lg shadow-sm",
        icon: "w-8 h-8 text-primary",
        special: {
          description: "text-xs text-muted-foreground",
        },
      },
    },
  },

  trust_indicators: {
    variantA: {
      name: "Clean Row",
      description: "Horizontal badges layout with even spacing",
      styles: {
        layout: "flex flex-wrap justify-center items-center gap-6 md:gap-8",
        spacing: "py-6 md:py-8",
        typography: {
          headline: "",
          body: "",
        },
        background: "bg-muted/30",
        special: {
          logo: "h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0",
        },
      },
    },
    variantB: {
      name: "Featured Badges",
      description: "Large badges with descriptions",
      styles: {
        layout: "grid grid-cols-2 md:grid-cols-4 gap-6",
        spacing: "py-8 md:py-12",
        typography: {
          headline: "text-sm font-semibold",
          body: "text-xs text-muted-foreground",
        },
        background: "bg-gradient-to-r from-primary/5 to-transparent",
        card: "text-center p-4",
        special: {
          logo: "h-12 mx-auto mb-2",
        },
      },
    },
    variantC: {
      name: "Compact Strip",
      description: "Single-line compact display",
      styles: {
        layout: "flex items-center justify-center gap-4 overflow-x-auto",
        spacing: "py-4",
        typography: {
          headline: "",
          body: "text-xs text-muted-foreground whitespace-nowrap",
        },
        background: "bg-muted/20 border-y border-border",
        special: {
          logo: "h-6 opacity-50",
          separator: "w-px h-4 bg-border",
        },
      },
    },
  },

  process_steps: {
    variantA: {
      name: "Timeline Vertical",
      description: "Vertical timeline with connecting line and numbered circles",
      styles: {
        layout: "max-w-2xl mx-auto relative",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-lg font-semibold",
          body: "text-base text-muted-foreground",
        },
        background: "bg-background",
        special: {
          timeline: "absolute left-6 top-0 bottom-0 w-0.5 bg-border",
          number: "w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold",
          step: "pl-20 pb-8 relative",
        },
      },
    },
    variantB: {
      name: "Card Grid Horizontal",
      description: "3-4 column grid with large step numbers and arrows",
      styles: {
        layout: "grid md:grid-cols-3 lg:grid-cols-4 gap-4",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-xl font-semibold",
          body: "text-sm text-muted-foreground",
        },
        background: "bg-background",
        card: "bg-card rounded-lg p-6 relative",
        icon: "w-12 h-12 text-primary",
        special: {
          number: "text-6xl font-extrabold text-primary/10 absolute top-2 right-4",
          arrow: "hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground",
        },
      },
    },
    variantC: {
      name: "Accordion Checklist",
      description: "Expandable accordion with checkmarks and progress indicator",
      styles: {
        layout: "max-w-3xl mx-auto",
        spacing: "py-8 md:py-12",
        typography: {
          headline: "text-lg font-semibold",
          body: "text-sm text-muted-foreground",
        },
        background: "bg-background",
        special: {
          progress: "h-2 bg-muted rounded-full overflow-hidden mb-6",
          progressFill: "h-full bg-primary transition-all",
          item: "border-b border-border py-4 hover:bg-muted/50 transition-colors",
          checkmark: "w-5 h-5 text-green-500",
        },
      },
    },
  },

  faq: {
    variantA: {
      name: "Simple Accordion",
      description: "Clean accordion with +/- icons and smooth animations",
      styles: {
        layout: "max-w-3xl mx-auto",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-base font-semibold",
          body: "text-sm text-muted-foreground",
        },
        background: "bg-background",
        special: {
          item: "border-b border-border",
          trigger: "py-4 hover:bg-muted/50 transition-colors",
          icon: "w-5 h-5 transition-transform",
        },
      },
    },
    variantB: {
      name: "Category Tabs",
      description: "Tabbed interface by category with 2-column grid",
      styles: {
        layout: "max-w-4xl mx-auto",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-sm font-semibold",
          body: "text-xs text-muted-foreground",
        },
        background: "bg-background",
        card: "bg-card rounded-md p-4",
        special: {
          tabs: "flex gap-2 mb-6 overflow-x-auto pb-2",
          tab: "px-4 py-2 rounded-full text-sm font-medium",
          tabActive: "bg-primary text-primary-foreground",
          grid: "grid md:grid-cols-2 gap-4",
          icon: "w-6 h-6 text-primary",
        },
      },
    },
    variantC: {
      name: "Split Panel",
      description: "Question list on left, answer panel on right with sticky scroll",
      styles: {
        layout: "grid md:grid-cols-10 gap-8",
        spacing: "py-8 md:py-12",
        typography: {
          headline: "text-xl font-bold",
          body: "text-base",
        },
        background: "bg-background",
        special: {
          leftPanel: "md:col-span-3 space-y-1",
          rightPanel: "md:col-span-7 bg-card rounded-lg p-8",
          question: "text-sm py-2 px-3 rounded-md cursor-pointer hover:bg-muted transition-colors",
          questionActive: "bg-primary text-primary-foreground",
        },
      },
    },
  },

  loan_products: {
    variantA: {
      name: "Clean Cards",
      description: "Simple product cards with subtle styling",
      styles: {
        layout: "grid md:grid-cols-3 gap-6",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-xl font-semibold",
          body: "text-sm text-muted-foreground",
        },
        background: "bg-background",
        card: "bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow",
      },
    },
    variantB: {
      name: "Featured Products",
      description: "Bold product cards with gradient accents",
      styles: {
        layout: "grid md:grid-cols-3 gap-8",
        spacing: "py-16 md:py-24",
        typography: {
          headline: "text-2xl font-bold",
          body: "text-base",
        },
        background: "bg-gradient-to-b from-muted/30 to-background",
        card: "bg-card rounded-xl p-8 shadow-lg hover:-translate-y-2 transition-transform",
        special: {
          badge: "bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium",
        },
      },
    },
    variantC: {
      name: "Comparison Cards",
      description: "Structured cards with feature lists",
      styles: {
        layout: "grid md:grid-cols-3 gap-4",
        spacing: "py-8 md:py-12",
        typography: {
          headline: "text-lg font-semibold",
          body: "text-sm",
        },
        background: "bg-muted/20",
        card: "bg-card border border-border rounded-md p-6",
        special: {
          featureList: "space-y-2 mt-4",
          checkmark: "w-4 h-4 text-green-500 inline-block mr-2",
        },
      },
    },
  },

  product_comparison: {
    variantA: {
      name: "Clean Table",
      description: "Simple comparison table with minimal styling",
      styles: {
        layout: "max-w-5xl mx-auto overflow-x-auto",
        spacing: "py-12 md:py-16",
        typography: {
          headline: "text-sm font-medium",
          body: "text-sm",
        },
        background: "bg-background",
        special: {
          table: "w-full border-collapse",
          header: "bg-muted/50 border-b border-border",
          row: "border-b border-border hover:bg-muted/30 transition-colors",
          cell: "py-3 px-4 text-left",
        },
      },
    },
    variantB: {
      name: "Feature Matrix",
      description: "Bold matrix with checkmarks and highlighted differences",
      styles: {
        layout: "max-w-6xl mx-auto",
        spacing: "py-16 md:py-20",
        typography: {
          headline: "text-base font-bold",
          body: "text-sm",
        },
        background: "bg-gradient-to-b from-muted/20 to-background",
        special: {
          table: "w-full",
          header: "bg-card sticky top-0",
          featured: "ring-2 ring-primary",
          check: "w-5 h-5 text-green-500",
          x: "w-5 h-5 text-muted-foreground/30",
        },
      },
    },
    variantC: {
      name: "Side-by-Side",
      description: "Professional side-by-side comparison cards",
      styles: {
        layout: "grid md:grid-cols-3 gap-6",
        spacing: "py-8 md:py-12",
        typography: {
          headline: "text-lg font-semibold text-center",
          body: "text-sm",
        },
        background: "bg-background",
        card: "bg-card border border-border rounded-lg overflow-hidden",
        special: {
          header: "bg-muted/50 p-4 border-b border-border",
          body: "p-6",
          featureRow: "py-2 border-b border-border last:border-0",
        },
      },
    },
  },
};

export function getVariantStyles(
  sectionType: VariantSectionType,
  variant: SectionStyleVariant
): SectionVariantDefinition | undefined {
  return sectionVariantRegistry[sectionType]?.[variant];
}

export function getDefaultVariantForTemplate(templateSlug: string): SectionStyleVariantsConfig {
  const defaultMappings: Record<string, SectionStyleVariantsConfig> = {
    "nestly": {
      hero: "variantA",
      feature_highlights: "variantA",
      testimonials: "variantA",
      cta_banner: "variantA",
      stats_bar: "variantA",
      trust_indicators: "variantA",
      process_steps: "variantA",
      faq: "variantA",
      loan_products: "variantA",
      product_comparison: "variantA",
    },
    "summit-capital": {
      hero: "variantB",
      feature_highlights: "variantB",
      testimonials: "variantB",
      cta_banner: "variantB",
      stats_bar: "variantB",
      trust_indicators: "variantB",
      process_steps: "variantB",
      faq: "variantB",
      loan_products: "variantB",
      product_comparison: "variantB",
    },
    "upcrunch": {
      hero: "variantC",
      feature_highlights: "variantC",
      testimonials: "variantC",
      cta_banner: "variantC",
      stats_bar: "variantA",
      trust_indicators: "variantC",
      process_steps: "variantC",
      faq: "variantC",
      loan_products: "variantC",
      product_comparison: "variantC",
    },
    "blueprint-pro": {
      hero: "variantC",
      feature_highlights: "variantC",
      testimonials: "variantC",
      cta_banner: "variantC",
      stats_bar: "variantC",
      trust_indicators: "variantC",
      process_steps: "variantC",
      faq: "variantC",
      loan_products: "variantC",
      product_comparison: "variantC",
    },
  };

  return defaultMappings[templateSlug] || defaultMappings["upcrunch"];
}
