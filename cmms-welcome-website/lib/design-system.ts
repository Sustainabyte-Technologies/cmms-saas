/**
 * CENTRALIZED DESIGN SYSTEM
 * All colors, typography, sizing, and styling constants
 * to be used throughout the entire application
 */

// ============================================================================
// COLORS - Primary Palette
// ============================================================================
export const COLORS = {
  // Primary Brand Colors
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c3d66",
  },

  // Secondary Colors
  secondary: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },

  // Accent Colors
  accent: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f8b4d9",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },

  // Success Colors
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#145231",
  },

  // Warning Colors
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Error/Danger Colors
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Info Colors
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Neutral/Gray Colors
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Semantic Colors
  semantic: {
    text: "#111827", // neutral-900
    textSecondary: "#6b7280", // neutral-500
    textTertiary: "#9ca3af", // neutral-400
    textInverse: "#f9fafb", // neutral-50
    background: "#ffffff",
    backgroundSecondary: "#f9fafb", // neutral-50
    border: "#e5e7eb", // neutral-200
    borderLight: "#f3f4f6", // neutral-100
    borderDark: "#d1d5db", // neutral-300
  },
};

// ============================================================================
// TYPOGRAPHY - Font Families and Weights
// ============================================================================
export const TYPOGRAPHY = {
  fontFamily: {
    sans: "system-ui, -apple-system, sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Font Sizes - Heading Styles
  heading: {
    h1: {
      size: 48, // px
      lineHeight: 1.2,
      weight: 700,
      letterSpacing: -0.02, // em
    },
    h2: {
      size: 40,
      lineHeight: 1.25,
      weight: 700,
      letterSpacing: -0.01,
    },
    h3: {
      size: 32,
      lineHeight: 1.3,
      weight: 600,
      letterSpacing: 0,
    },
    h4: {
      size: 28,
      lineHeight: 1.35,
      weight: 600,
      letterSpacing: 0,
    },
    h5: {
      size: 24,
      lineHeight: 1.4,
      weight: 600,
      letterSpacing: 0,
    },
    h6: {
      size: 20,
      lineHeight: 1.5,
      weight: 600,
      letterSpacing: 0,
    },
  },

  // Body Text Styles
  body: {
    large: {
      size: 18,
      lineHeight: 1.6,
      weight: 400,
      letterSpacing: 0,
    },
    base: {
      size: 16,
      lineHeight: 1.6,
      weight: 400,
      letterSpacing: 0,
    },
    medium: {
      size: 14,
      lineHeight: 1.6,
      weight: 400,
      letterSpacing: 0,
    },
    small: {
      size: 12,
      lineHeight: 1.5,
      weight: 400,
      letterSpacing: 0.25, // em
    },
  },

  // Label/Caption Text
  label: {
    large: {
      size: 14,
      lineHeight: 1.5,
      weight: 600,
      letterSpacing: 0.1, // em
    },
    medium: {
      size: 12,
      lineHeight: 1.5,
      weight: 600,
      letterSpacing: 0.15,
    },
    small: {
      size: 11,
      lineHeight: 1.4,
      weight: 600,
      letterSpacing: 0.2,
    },
  },
};

// ============================================================================
// SIZING - Spacing, Borders, Shadows
// ============================================================================
export const SIZING = {
  // Spacing Scale (px) - Used for margin, padding, gaps
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    36: 144,
    40: 160,
    44: 176,
    48: 192,
    52: 208,
    56: 224,
    60: 240,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 2,
    base: 4,
    md: 6,
    lg: 8,
    xl: 12,
    "2xl": 16,
    "3xl": 24,
    full: 9999,
  },

  // Border Widths
  borderWidth: {
    none: 0,
    sm: 0.5,
    base: 1,
    md: 2,
    lg: 4,
    xl: 8,
  },

  // Shadows
  shadow: {
    none: "0 0 #0000",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  },

  // Component Sizes
  component: {
    // Button Sizes
    button: {
      sm: {
        padding: "8px 12px",
        fontSize: 12,
        height: 32,
      },
      md: {
        padding: "10px 16px",
        fontSize: 14,
        height: 40,
      },
      lg: {
        padding: "12px 20px",
        fontSize: 16,
        height: 48,
      },
      xl: {
        padding: "14px 24px",
        fontSize: 18,
        height: 56,
      },
    },

    // Input Sizes
    input: {
      sm: {
        padding: "6px 12px",
        fontSize: 12,
        height: 32,
      },
      md: {
        padding: "8px 12px",
        fontSize: 14,
        height: 40,
      },
      lg: {
        padding: "10px 16px",
        fontSize: 16,
        height: 48,
      },
    },

    // Card Sizes
    card: {
      sm: {
        width: 200,
        padding: 16,
      },
      md: {
        width: 300,
        padding: 20,
      },
      lg: {
        width: 400,
        padding: 24,
      },
    },

    // Icon Sizes
    icon: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
      "2xl": 48,
    },
  },
};

// ============================================================================
// BREAKPOINTS - Responsive Design
// ============================================================================
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// ============================================================================
// Z-INDEX - Layer Management
// ============================================================================
export const Z_INDEX = {
  hide: -1,
  auto: 0,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// ============================================================================
// TRANSITIONS - Animation & Motion
// ============================================================================
export const TRANSITIONS = {
  duration: {
    instant: 0,
    fast: 150,
    base: 200,
    slow: 300,
    slower: 500,
    slowest: 1000,
  },

  timing: {
    linear: "linear",
    ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    easeIn: "cubic-bezier(0.42, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.58, 1)",
    easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
  },

  common: {
    fadeIn: "fade-in 0.2s ease-out",
    slideUp: "slide-up 0.3s ease-out",
    slideDown: "slide-down 0.3s ease-out",
    slideLeft: "slide-left 0.3s ease-out",
    slideRight: "slide-right 0.3s ease-out",
  },
};

// ============================================================================
// LAYOUT - Container and Grid
// ============================================================================
export const LAYOUT = {
  container: {
    maxWidth: 1280,
    padding: 20,
    paddingMd: 32,
    paddingLg: 48,
  },

  grid: {
    gap: 24,
    gapSm: 16,
    gapMd: 20,
    gapLg: 28,
  },

  section: {
    paddingY: 80,
    paddingYSm: 60,
    paddingYMd: 100,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get CSS custom property name
 */
export const getCSSVar = (path: string): string => {
  return `var(--${path.replace(/\./g, "-")})`;
};

/**
 * Convert px to rem
 */
export const pxToRem = (px: number, base: number = 16): number => {
  return px / base;
};

/**
 * Format shadow for CSS
 */
export const formatShadow = (shadow: string): string => {
  return shadow;
};
