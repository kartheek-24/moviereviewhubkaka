const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <!-- Background gradient: deep cinema dark -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f0c1a"/>
      <stop offset="100%" stop-color="#1a1030"/>
    </linearGradient>

    <!-- Gold shimmer for star -->
    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe066"/>
      <stop offset="50%" stop-color="#f5a623"/>
      <stop offset="100%" stop-color="#c97d10"/>
    </linearGradient>

    <!-- Amber glow for film strip -->
    <linearGradient id="stripGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f5a623"/>
      <stop offset="100%" stop-color="#e8850a"/>
    </linearGradient>

    <!-- Outer glow filter -->
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Subtle inner shadow for depth -->
    <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Clip to rounded rect -->
    <clipPath id="roundedClip">
      <rect width="1024" height="1024" rx="200" ry="200"/>
    </clipPath>
  </defs>

  <!-- Rounded background -->
  <rect width="1024" height="1024" rx="200" ry="200" fill="url(#bgGrad)"/>

  <!-- Subtle radial spotlight in center -->
  <radialGradient id="spotlight" cx="50%" cy="48%" r="50%">
    <stop offset="0%" stop-color="#2a1f4a" stop-opacity="1"/>
    <stop offset="100%" stop-color="#0f0c1a" stop-opacity="0"/>
  </radialGradient>
  <rect width="1024" height="1024" rx="200" ry="200" fill="url(#spotlight)"/>

  <g clip-path="url(#roundedClip)">

    <!-- ===== FILM STRIP TOP ===== -->
    <!-- Strip bar -->
    <rect x="0" y="72" width="1024" height="110" fill="#1e1430"/>
    <rect x="0" y="72" width="1024" height="6" fill="url(#stripGrad)" opacity="0.9"/>
    <rect x="0" y="176" width="1024" height="6" fill="url(#stripGrad)" opacity="0.9"/>

    <!-- Film holes top row -->
    <rect x="32"  y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="116" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="200" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="284" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="368" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="452" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="536" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="620" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="704" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="788" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="872" y="90" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="956" y="90" width="54" height="74" rx="10" fill="#0a0812"/>

    <!-- ===== FILM STRIP BOTTOM ===== -->
    <rect x="0" y="842" width="1024" height="110" fill="#1e1430"/>
    <rect x="0" y="842" width="1024" height="6" fill="url(#stripGrad)" opacity="0.9"/>
    <rect x="0" y="946" width="1024" height="6" fill="url(#stripGrad)" opacity="0.9"/>

    <!-- Film holes bottom row -->
    <rect x="32"  y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="116" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="200" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="284" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="368" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="452" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="536" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="620" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="704" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="788" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="872" y="860" width="54" height="74" rx="10" fill="#0a0812"/>
    <rect x="956" y="860" width="54" height="74" rx="10" fill="#0a0812"/>

    <!-- ===== LARGE STAR (center, hero element) ===== -->
    <!-- Star: 5-pointed, centered at 512,480, outer radius 230, inner radius 92 -->
    <polygon
      points="
        512,250
        568,408 740,408
        603,508 655,666
        512,566 369,666
        421,508 284,408
        456,408
      "
      fill="url(#goldGrad)"
      filter="url(#starGlow)"
    />

    <!-- Star shine highlight -->
    <polygon
      points="
        512,250
        568,408 740,408
        603,508 655,666
        512,566 369,666
        421,508 284,408
        456,408
      "
      fill="none"
      stroke="#fff8dc"
      stroke-width="3"
      opacity="0.35"
    />

    <!-- Inner star gloss (top-left facet highlight) -->
    <polygon
      points="512,262 555,390 512,390"
      fill="#fff"
      opacity="0.18"
    />

    <!-- ===== TEXT: MR HUB ===== -->
    <!-- "MOVIE" -->
    <text
      x="512"
      y="730"
      text-anchor="middle"
      font-family="'Helvetica Neue', Arial, sans-serif"
      font-size="80"
      font-weight="800"
      letter-spacing="18"
      fill="#ffffff"
      opacity="0.95"
    >MOVIE</text>

    <!-- "REVIEW HUB" in amber -->
    <text
      x="512"
      y="812"
      text-anchor="middle"
      font-family="'Helvetica Neue', Arial, sans-serif"
      font-size="52"
      font-weight="700"
      letter-spacing="10"
      fill="#f5a623"
      opacity="0.9"
    >REVIEW HUB</text>

    <!-- Amber underline accent -->
    <rect x="312" y="826" width="400" height="5" rx="2.5" fill="url(#stripGrad)" opacity="0.7"/>

  </g>
</svg>
`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1024 },
});
const pngData = resvg.render();
const pngBuffer = pngData.asPng();

const outPath = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
fs.writeFileSync(outPath, pngBuffer);
console.log('Icon written to', outPath, '—', pngBuffer.length, 'bytes');

// Also write a copy to public for reference
const publicPath = path.join(__dirname, '../public/app-icon-1024.png');
fs.writeFileSync(publicPath, pngBuffer);
console.log('Copy written to', publicPath);
