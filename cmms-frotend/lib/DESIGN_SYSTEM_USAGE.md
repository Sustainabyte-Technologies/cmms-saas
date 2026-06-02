/**
 * DESIGN SYSTEM USAGE GUIDE
 * How to use the centralized design tokens throughout the application
 */

/**
 * EXAMPLE 1: Using Colors in Components
 */
import { COLORS, TYPOGRAPHY, SIZING } from "@/lib/design-system";

// Access colors
const primaryColor = COLORS.primary[500];         // #0ea5e9
const successColor = COLORS.success[600];        // #16a34a
const textColor = COLORS.semantic.text;          // #111827

/**
 * EXAMPLE 2: Using Typography Sizes
 */
// Get heading styles
const h1Size = TYPOGRAPHY.heading.h1.size;       // 48
const h1Weight = TYPOGRAPHY.heading.h1.weight;   // 700
const h1LineHeight = TYPOGRAPHY.heading.h1.lineHeight; // 1.2

// Get body text styles
const baseSize = TYPOGRAPHY.body.base.size;      // 16
const labelWeight = TYPOGRAPHY.label.large.weight; // 600

/**
 * EXAMPLE 3: Using Spacing in Tailwind Classes
 */
// Instead of hardcoding values, use the design system:
// <div className="p-6 m-4 gap-8">
// These translate to: padding: 24px, margin: 16px, gap: 32px

// Spacing reference:
const spacing = SIZING.spacing;
console.log(spacing[4]);  // 16px
console.log(spacing[6]);  // 24px
console.log(spacing[8]);  // 32px

/**
 * EXAMPLE 4: Using Component Sizes
 */
const buttonMdHeight = SIZING.component.button.md.height;      // 40
const inputLgPadding = SIZING.component.input.lg.padding;      // "10px 16px"
const iconMdSize = SIZING.component.icon.md;                  // 24

/**
 * EXAMPLE 5: Using Border Radius
 */
const borderRadiusMd = SIZING.borderRadius.md;   // 6px
const borderRadiusFull = SIZING.borderRadius.full; // 9999px (full circle)

/**
 * EXAMPLE 6: Using Shadows
 */
const shadowMd = SIZING.shadow.md;    // Complete shadow value for CSS

/**
 * EXAMPLE 7: Using Z-Index for Layering
 */
import { Z_INDEX } from "@/lib/design-system";
// style={{ zIndex: Z_INDEX.modal }}        // 1400
// style={{ zIndex: Z_INDEX.tooltip }}      // 1600
// style={{ zIndex: Z_INDEX.dropdown }}     // 1000

/**
 * EXAMPLE 8: Using Transitions
 */
import { TRANSITIONS } from "@/lib/design-system";
const duration = TRANSITIONS.duration.base;       // 200ms
const easeOut = TRANSITIONS.timing.easeOut;       // cubic-bezier(0, 0, 0.58, 1)

/**
 * EXAMPLE 9: Using Breakpoints for Responsive Design
 */
import { BREAKPOINTS } from "@/lib/design-system";
// Mobile: 320px (BREAKPOINTS.xs)
// Tablet: 768px (BREAKPOINTS.md)
// Desktop: 1024px (BREAKPOINTS.lg)

/**
 * EXAMPLE 10: Using Layout Constants
 */
import { LAYOUT } from "@/lib/design-system";
const containerMaxWidth = LAYOUT.container.maxWidth;      // 1280
const sectionPadding = LAYOUT.section.paddingY;           // 80

/**
 * USAGE IN REACT COMPONENTS
 */
import React from 'react';
import { COLORS, TYPOGRAPHY, SIZING } from "@/lib/design-system";

export function ExampleButton() {
  return (
    <button
      style={{
        backgroundColor: COLORS.primary[500],
        color: COLORS.semantic.textInverse,
        padding: `${SIZING.component.button.md.padding}`,
        borderRadius: `${SIZING.borderRadius.md}px`,
        fontSize: `${SIZING.component.button.md.fontSize}px`,
        height: `${SIZING.component.button.md.height}px`,
        boxShadow: SIZING.shadow.md,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        transition: `all ${TRANSITIONS.duration.base}ms ${TRANSITIONS.timing.easeOut}`,
      }}
    >
      Click Me
    </button>
  );
}

/**
 * USAGE IN TAILWIND CSS (WITH CUSTOM CONFIG)
 */
// In your tailwind.config.js, extend the theme with design system values:
// 
// module.exports = {
//   theme: {
//     colors: {
//       primary: COLORS.primary,
//       secondary: COLORS.secondary,
//       semantic: COLORS.semantic,
//     },
//     spacing: SIZING.spacing,
//     borderRadius: SIZING.borderRadius,
//     boxShadow: SIZING.shadow,
//   }
// }
//
// Then use in your components:
// <div className="bg-primary-500 text-semantic-text p-6 rounded-lg shadow-lg">

/**
 * KEY PRINCIPLES
 * 
 * 1. CONSISTENCY: Always use the design system values instead of hardcoding colors/sizes
 * 2. SCALABILITY: Adding new variants is easy - just update design-system.ts
 * 3. MAINTAINABILITY: Change a color once, it updates everywhere
 * 4. ACCESSIBILITY: All values are pre-tested for accessibility
 * 5. FLEXIBILITY: Use colors, typography, and sizing independently as needed
 */
