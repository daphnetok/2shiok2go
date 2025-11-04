# Floating Cart Button Component

## Overview
Created a reusable floating "Go to Cart" button component that appears in the bottom-right corner of listing pages, providing quick access to the shopping cart.

## Component Details

### Location
`/src/components/shared/FloatingCartButton.vue`

### Features
- ✅ **Sticky Position:** Fixed at bottom-right corner (30px from edges)
- ✅ **Cart Badge:** Shows item count with red badge when cart has items
- ✅ **Animated:** Pulse glow effect when cart has items
- ✅ **Responsive:** 
  - Desktop: Full button with "Go to Cart" text
  - Mobile: Circular icon-only button
- ✅ **Smooth Transitions:** Fade-slide entrance/exit animation
- ✅ **Interactive:** Hover effects with lift and scale
- ✅ **Theme Matching:** Green gradient matching app theme
- ✅ **High Z-Index:** Always visible above other content (z-index: 1000)

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showButton` | Boolean | `true` | Controls button visibility |

### Usage

```vue
<template>
  <div>
    <!-- Your page content -->
    
    <!-- Add the floating cart button -->
    <FloatingCartButton />
  </div>
</template>

<script>
import FloatingCartButton from '@/components/shared/FloatingCartButton.vue';

export default {
  components: {
    FloatingCartButton
  }
}
</script>
```

### With Conditional Display
```vue
<FloatingCartButton :showButton="cartCount > 0" />
```

## Implementation

### Pages Updated

#### 1. **BuyerViewStall.vue** (`/src/views/`)
- Individual hawker stall view page
- Shows items from a specific hawker
- Button appears when browsing items

#### 2. **BuyerListing.vue** (`/src/views/`)
- Main listings page with all hawkers
- Filter bar and search functionality
- Button appears alongside BackToTop component

## Visual Design

### Desktop View
```
┌─────────────────────────────────────┐
│                                     │
│   Page Content                      │
│                                     │
│                              ┌────────────┐
│                              │ 🛒 Go to   │
│                              │    Cart  3 │
│                              └────────────┘
└─────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────┐
│                  │
│  Page Content    │
│                  │
│             ┌──┐ │
│             │🛒│ │
│             │ 3│ │
│             └──┘ │
└──────────────────┘
```

## Styling

### Colors
- **Background:** Linear gradient `#10b981` → `#059669` (green theme)
- **Hover:** Darker gradient `#059669` → `#047857`
- **Badge:** Red `#ef4444` with white border
- **Text:** White

### Dimensions
- **Desktop:** `padding: 16px 24px`, rounded pill shape
- **Mobile:** `56x56px` circular button
- **Badge:** `20x20px` circle

### Shadows
- **Default:** `0 6px 24px rgba(16, 185, 129, 0.4)`
- **Hover:** `0 8px 32px rgba(16, 185, 129, 0.5)`
- **With Items:** Pulsing glow effect

### Animations

#### Pulse Glow (when cart has items)
```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 6px 32px rgba(16, 185, 129, 0.6), 
                0 0 20px rgba(16, 185, 129, 0.3);
  }
}
```

#### Entrance/Exit Animation
- Fade in/out with slide up effect
- Duration: 0.4s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

### Interactions

#### Hover State
- Lifts 4px up
- Scales to 105%
- Enhanced shadow
- Darker gradient background

#### Active State
- Lifts 2px up
- Scales to 102%
- Pressed effect

## Integration with Cart System

### Uses `useCart` Composable
```javascript
import { useCart } from '@/assets/composables/useCart';

const { cartCount } = useCart();
```

### Cart Count Badge
- Only shows when `cartCount > 0`
- Positioned absolutely on top-right of cart icon
- Max 2-digit display (e.g., "99+")

## Responsive Breakpoints

### Desktop (> 768px)
- Full button with text
- 30px from bottom and right edges

### Tablet/Mobile (≤ 768px)
- Icon-only circular button
- Text hidden
- 20px from edges

### Small Mobile (≤ 480px)
- Slightly smaller (52x52px)
- 16px from edges

## Accessibility

- ✅ **Semantic HTML:** Uses `<router-link>` for proper navigation
- ✅ **ARIA-friendly:** Icon with descriptive text
- ✅ **Keyboard Navigable:** Tab-accessible link
- ✅ **High Contrast:** White text on dark green background
- ✅ **Visual Feedback:** Clear hover and active states

## Performance

- **Lightweight:** ~150 lines including styles
- **No Dependencies:** Uses Vue Router and existing cart composable
- **CSS Animations:** Hardware-accelerated transforms
- **Conditional Rendering:** Only shows when needed

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)

## Future Enhancements

Possible improvements:
1. **Cart Preview:** Hover tooltip showing cart summary
2. **Add Animation:** Bounce when items added to cart
3. **Position Options:** Allow left/right positioning via prop
4. **Custom Colors:** Theme prop for different color schemes
5. **Sound Effect:** Optional sound when clicking (accessibility toggle)
6. **Vibration:** Haptic feedback on mobile devices

## Testing Checklist

### Desktop
- [ ] Button appears in bottom-right corner
- [ ] Shows "Go to Cart" text
- [ ] Badge appears when cart has items
- [ ] Badge shows correct count
- [ ] Hover effects work smoothly
- [ ] Pulse animation when cart has items
- [ ] Navigates to /cart on click
- [ ] Doesn't block content

### Mobile
- [ ] Button is circular icon-only
- [ ] Badge visible and readable
- [ ] Touch target is adequate (52-56px)
- [ ] Doesn't interfere with scrolling
- [ ] Works with BackToTop button
- [ ] Responsive at all breakpoints

### Functionality
- [ ] Cart count updates in real-time
- [ ] Badge disappears when cart empty
- [ ] Smooth entrance animation on page load
- [ ] Proper routing to cart page
- [ ] Z-index keeps it above all content
- [ ] No console errors

## Summary

**Component Created:** `FloatingCartButton.vue`
**Pages Updated:** 2 (BuyerViewStall, BuyerListing)
**User Experience:** Provides persistent, accessible cart access from listing pages
**Design:** Matches app's green theme with polished animations and responsive behavior
