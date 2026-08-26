---
name: SmartRecipe
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#59413c'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#8d716a'
  outline-variant: '#e1bfb8'
  surface-tint: '#ae3115'
  primary: '#ae3115'
  on-primary: '#ffffff'
  primary-container: '#ff6b4a'
  on-primary-container: '#661000'
  inverse-primary: '#ffb4a3'
  secondary: '#006e1c'
  on-secondary: '#ffffff'
  secondary-container: '#91f78e'
  on-secondary-container: '#00731e'
  tertiary: '#5e5e5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#9a9a98'
  on-tertiary-container: '#313231'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8c1900'
  secondary-fixed: '#94f990'
  secondary-fixed-dim: '#78dc77'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005313'
  tertiary-fixed: '#e3e2e0'
  tertiary-fixed-dim: '#c7c6c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#464746'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 20px
---

## Brand & Style

This design system is built on a **Modern / Lifestyle** aesthetic that balances high-utility technology with a warm, editorial feel. The personality is friendly, smart, and reliable, aiming to evoke a sense of culinary inspiration and organized efficiency. 

The visual language follows a **Soft Minimalist** approach: 
- **Generous Whitespace:** Prioritize breathing room to reduce cognitive load during complex cooking or planning tasks.
- **Fresh & Premium:** Utilize high-quality food photography paired with clean, structured UI elements.
- **Intentional Tactility:** Elements feel tangible through the use of soft elevation and generous corner radii, making the interface feel approachable and "organic" rather than clinical.

## Colors

The palette is designed to stimulate appetite while maintaining a sense of health and clarity.

- **Primary (Coral):** Used for primary actions, progress indicators, and "active" states to convey energy and flavor.
- **Secondary (Green):** Reserved for health-related metrics, "freshness" badges, and successful completion states.
- **Background (Cream):** A warm-tinted off-white used for the global background to prevent eye strain and feel more "kitchen-natural" than pure white.
- **Surface (White):** Pure white is used exclusively for interactive cards and modals to create a clear layer of separation from the background.
- **Text (Charcoal/Gray):** High-contrast charcoal for titles to ensure readability, and a softer gray for long-form body text to maintain a premium, editorial feel.

## Typography

The typography system uses **Inter** for its exceptional legibility and modern, systematic appearance.

- **Headings:** Use bold weights with tighter letter-spacing for a strong, authoritative hierarchy.
- **Body:** Standardized on a 16px base for optimal readability in recipe instructions.
- **Labels:** Small, uppercase, semi-bold treatments for metadata such as prep time, calorie counts, or categories.
- **Mobile Scaling:** Headline-xl and Headline-lg should downscale on mobile devices to ensure titles do not wrap awkwardly.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile.

- **Spacing Rhythm:** Based on an 8px incremental scale (8, 16, 24, 32, 48, 64).
- **Layout Model:** Content is centered in a max-width container of 1280px. 
- **Mobile Adaptation:** On mobile, margins reduce to 20px, and grid-based components (like recipe cards) should transition from multi-column rows to single-column vertical stacks or horizontal carousels.
- **Safe Areas:** Ensure a 24px bottom-safe-area on mobile to accommodate gesture-based navigation.

## Elevation & Depth

This system uses **Ambient Shadows** to create a sense of height and focus without harsh lines.

- **Low Elevation (Resting Cards):** A very soft, diffused shadow (Y: 4px, Blur: 12px, 4% Opacity Black) helps white cards pop against the cream background.
- **High Elevation (Modals/Popovers):** A more pronounced shadow (Y: 12px, Blur: 24px, 8% Opacity Black) to indicate temporary, high-priority interactions.
- **Zero Elevation (Inputs/Forms):** Use a subtle 1px border (#E5E5E5) instead of shadows for form fields to maintain a clean, organized look.

## Shapes

The shape language is consistently **Rounded**, reflecting a friendly and modern personality.

- **Standard Elements (Buttons/Inputs):** 12px corner radius for a soft but functional feel.
- **Container Elements (Cards/Modals):** 20px corner radius to emphasize the "lifestyle" and approachable nature of the content.
- **Badges/Chips:** Fully pill-shaped to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Coral background, white text, 12px radius. Heavy padding (16px 32px) for a "squishy," tappable feel.
- **Secondary:** White background, 1px Gray border, Charcoal text.
- **Success:** Green background for "Add to Cart" or "Completed" actions.

### Cards
- **Recipe Cards:** 20px radius, white surface, subtle shadow. Top half is a full-bleed image. Bottom half contains a bold title and pill-shaped metadata chips (e.g., "15 min", "Vegan").

### Form Fields
- **Inputs:** 12px radius, light gray border (#E5E5E5), 16px internal padding. 
- **Focus State:** 2px Coral border with a soft Coral glow (4px blur).

### Feedback & Status
- **Chips:** Small pill-shaped containers with light-tinted backgrounds of their respective status colors (e.g., a light green tint for "Healthy" tags).
- **Lists:** Ingredient lists use a custom checkbox that turns Green when checked, with the text becoming muted and strikethrough for visual completion.

### Icons
- **Style:** 24px stroke-based icons (Lucide/Feather style) with a 2px stroke weight. Use Charcoal for general navigation and Coral for active-state icons.