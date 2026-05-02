# 🎨 UI & UX Design System

This document outlines the visual design strategy, styling architecture, and dark-mode aesthetic used in the Roommate Tasker application.

---

## 🏛️ Styling Architecture

The application adopts a **Vanilla CSS Modules** approach (`.module.css` files) connected to a global variables file (`globals.css`). 

### Why not Tailwind/Frameworks?
- **Total Aesthetic Control**: To achieve an extremely premium, high-tech ambient dark mode without fighting utility class limits.
- **Scoping**: Avoid style bleed and keeps page sizes minimal and performant.

---

## 🌌 Color Palette & Global Variables

The foundation relies on modern CSS variables forming an elevation layer system with glowing accents.

### Surface Elevation
- `bg-base`: `#08080e` (Deepest layer).
- `bg-surface-0`: `#0e0e18` (Base Card depth).
- `bg-surface-1` through `3`: Opacity-based overlays (`rgba(255,255,255, 0.03)`).

### Gradated Accents
- `accent`: `#7c6aef` (Signature Violet).
- `gradient-primary`: Purple to Orchid fade.
- **Ambient Lighting**: CSS `blur(180px)` circles placed via `body::before` & `::after` providing a soft ambient backing glow to the entire page wrap.

---

## 📋 Component Level Designs

### 1. `TaskCard.tsx`
The main focal point representing a single housework item. All critical fields utilize explicit semantic styling.

- **Urgency Borders (`.accent`)**: High contrast flags for statuses.
  - 🔴 Overdue: `danger` (#f87171)
  - 🟡 Today: `warning` (#fbbf24)
  - 🟢 Upcoming: `success` (#34d399)
- **State States**:
  - `myTurn`: Applies a violet inner glow and shadow bloom (`box-shadow`) making assigned tasks immediately pop out.
  - `celebrating`: Triggers a swift scale inflate/deflate animation keyframe on item completion so the interaction feels immediately gratifying.

### 2. Loading and Toasts
- **Toast Notifications**: Built into absolute position headers utilizing linear gradients inside high-backdrop blur effects with `slideDown`/`slideUp` bounding spring animations.
- **Avatar Rotation Display**: Replicates overlap headers stack using small overlapping negative margin sets for clean profile list views for future projections inside existing items.

---

## 📱 Responsiveness
The layout enforces standard viewport maximum frames (`--page-max: 560px` or `620px` max sets), ensuring the platform renders securely as an encapsulated Mobile PWA template suitable for dashboard screen sizes.
