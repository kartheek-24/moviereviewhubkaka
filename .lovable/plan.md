

# Fix iOS Safari/WebView Scrolling Issue

## Problem Summary
The app loads correctly in iOS Safari (simulator), and tap/click interactions work fine, but scrolling up and down does not work. This is a common iOS WebView/Safari issue caused by CSS properties that don't play well with iOS touch scrolling.

## Root Cause
1. **Missing iOS-specific scroll properties**: The CSS lacks `-webkit-overflow-scrolling: touch` which enables smooth momentum scrolling on iOS
2. **`min-h-screen` (100vh) issue**: On iOS Safari, `100vh` includes the browser chrome height, causing layout issues that can interfere with scrolling
3. **Potential body/html height conflicts**: iOS Safari needs explicit `height: 100%` and `overflow: auto` on html/body for proper scrolling

---

## Implementation Plan

### Step 1: Add iOS-Specific Scroll Fixes to Global CSS

**File:** `src/index.css`

Add the following CSS rules to enable proper iOS scrolling:

```css
@layer base {
  html {
    @apply scroll-smooth;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  #root {
    min-height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

### Step 2: Update Index.tsx Page Container

**File:** `src/pages/Index.tsx`

Replace `min-h-screen` with a more iOS-friendly approach that allows natural document flow:

```tsx
// Change from:
<div className="min-h-screen cinema-bg">

// Change to:
<div className="min-h-full cinema-bg" style={{ minHeight: '100%' }}>
```

Or alternatively, use a wrapper approach that iOS handles better:

```tsx
<div className="cinema-bg pb-safe">
```

### Step 3: Add Touch-Action CSS Utility

**File:** `src/index.css`

Add a utility class for touch manipulation:

```css
@layer utilities {
  .touch-scroll {
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }
}
```

---

## Technical Details

### Why `-webkit-overflow-scrolling: touch` is Needed
This property enables momentum-based scrolling (inertia) on iOS devices. Without it, scrollable areas may not respond to touch gestures or may scroll without the expected "rubber-band" effect.

### Why `100vh` Causes Issues on iOS
On iOS Safari, `100vh` represents the full viewport height including the dynamic URL bar. When the URL bar is visible, the actual visible area is smaller than `100vh`, which can cause content to extend below the visible area and interfere with scroll behavior.

### The Fix Strategy
By setting `html`, `body`, and `#root` to use `height: 100%` with `overflow: auto` and `-webkit-overflow-scrolling: touch`, we create a proper scrolling context that iOS Safari/WebView understands.

---

## After Implementation

Once these changes are made, you'll need to:
1. Run `npm run build` to rebuild the web assets
2. Run `npx cap sync ios` to sync changes to the iOS project
3. Build and run again in Xcode (`Cmd + R`)

The app should then scroll smoothly in the iOS simulator and on physical devices.

