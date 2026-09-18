import React from 'react';

// Hand-Drawn 35mm Vintage Film Projector with Beam
export const FilmProjectorArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 240 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', ...style }}
  >
    {/* Light Projector Beam */}
    <path
      d="M175 105 L310 45 L320 185 L175 125 Z"
      fill="url(#beamGradient)"
      opacity="0.18"
    />
    <defs>
      <linearGradient id="beamGradient" x1="175" y1="110" x2="310" y2="110" gradientUnits="userSpaceOnUse">
        <stop stopColor="#050505" stopOpacity="0.45" />
        <stop offset="1" stopColor="#050505" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Top Reel */}
    <circle cx="95" cy="55" r="32" stroke="#050505" strokeWidth="3" fill="#F3F1EB" />
    <circle cx="95" cy="55" r="12" stroke="#050505" strokeWidth="2.5" />
    <circle cx="95" cy="55" r="4" fill="#050505" />
    <line x1="95" y1="23" x2="95" y2="43" stroke="#050505" strokeWidth="2" strokeDasharray="3 2" />
    <line x1="95" y1="67" x2="95" y2="87" stroke="#050505" strokeWidth="2" strokeDasharray="3 2" />
    <line x1="63" y1="55" x2="83" y2="55" stroke="#050505" strokeWidth="2" strokeDasharray="3 2" />
    <line x1="107" y1="55" x2="127" y2="55" stroke="#050505" strokeWidth="2" strokeDasharray="3 2" />

    {/* Back Reel */}
    <circle cx="45" cy="70" r="28" stroke="#050505" strokeWidth="3" fill="#F3F1EB" />
    <circle cx="45" cy="70" r="10" stroke="#050505" strokeWidth="2" />
    <circle cx="45" cy="70" r="3" fill="#050505" />

    {/* Projector Body */}
    <rect x="55" y="85" width="105" height="75" rx="5" stroke="#050505" strokeWidth="3.5" fill="#050505" />
    {/* Body Details */}
    <circle cx="85" cy="120" r="14" stroke="#F3F1EB" strokeWidth="2" fill="none" />
    <circle cx="85" cy="120" r="5" fill="#F3F1EB" />
    <line x1="115" y1="105" x2="145" y2="105" stroke="#F3F1EB" strokeWidth="2" strokeLinecap="round" />
    <line x1="115" y1="115" x2="140" y2="115" stroke="#F3F1EB" strokeWidth="2" strokeLinecap="round" />
    <line x1="115" y1="125" x2="135" y2="125" stroke="#F3F1EB" strokeWidth="2" strokeLinecap="round" />

    {/* Lens Barrel */}
    <path d="M160 102 L185 96 L185 134 L160 128 Z" stroke="#050505" strokeWidth="3" fill="#F3F1EB" />
    <ellipse cx="185" cy="115" rx="3" ry="19" fill="#050505" />

    {/* Stand / Tripod Mount */}
    <path d="M100 160 L100 190" stroke="#050505" strokeWidth="4" strokeLinecap="round" />
    <path d="M70 215 L100 190 L130 215" stroke="#050505" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M100 190 L100 215" stroke="#050505" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Hand-Drawn Director's Clapperboard
export const ClapperboardArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style }}
  >
    {/* Bottom Slate */}
    <rect x="20" y="52" width="120" height="75" rx="4" stroke="#050505" strokeWidth="3" fill="#050505" />
    <line x1="25" y1="78" x2="135" y2="78" stroke="#F3F1EB" strokeWidth="1.5" />
    <line x1="75" y1="52" x2="75" y2="125" stroke="#F3F1EB" strokeWidth="1.5" />
    <text x="32" y="70" fill="#F3F1EB" fontSize="9" fontFamily="monospace" fontWeight="700">SCENE 24</text>
    <text x="85" y="70" fill="#F3F1EB" fontSize="9" fontFamily="monospace" fontWeight="700">TAKE 01</text>
    <text x="32" y="100" fill="#F3F1EB" fontSize="8" fontFamily="monospace">PROD: CINEAI</text>
    <text x="32" y="114" fill="#F3F1EB" fontSize="8" fontFamily="monospace">DIR: EDITORIAL</text>

    {/* Top Clapper Stick (Opened at angle) */}
    <g transform="rotate(-14 20 52)">
      <rect x="20" y="32" width="120" height="20" rx="2" stroke="#050505" strokeWidth="3" fill="#F3F1EB" />
      <path d="M36 32 L46 32 L36 52 L26 52 Z" fill="#050505" />
      <path d="M60 32 L70 32 L60 52 L50 52 Z" fill="#050505" />
      <path d="M84 32 L94 32 L84 52 L74 52 Z" fill="#050505" />
      <path d="M108 32 L118 32 L108 52 L98 52 Z" fill="#050505" />
      <path d="M132 32 L140 32 L132 52 L122 52 Z" fill="#050505" />
    </g>
    <circle cx="24" cy="52" r="3.5" fill="#050505" stroke="#F3F1EB" strokeWidth="1" />
  </svg>
);

// Hand-Drawn 35mm Film Reel
export const FilmReelArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style }}
  >
    <circle cx="80" cy="80" r="70" stroke="#050505" strokeWidth="3.5" fill="#F3F1EB" />
    <circle cx="80" cy="80" r="62" stroke="#050505" strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx="80" cy="80" r="28" stroke="#050505" strokeWidth="3" fill="#050505" />
    <circle cx="80" cy="80" r="10" stroke="#F3F1EB" strokeWidth="2" fill="#F3F1EB" />
    <circle cx="80" cy="80" r="4" fill="#050505" />

    {/* Spoke Cutouts */}
    <circle cx="80" cy="35" r="11" stroke="#050505" strokeWidth="2.5" fill="#E8E5DD" />
    <circle cx="80" cy="125" r="11" stroke="#050505" strokeWidth="2.5" fill="#E8E5DD" />
    <circle cx="35" cy="80" r="11" stroke="#050505" strokeWidth="2.5" fill="#E8E5DD" />
    <circle cx="125" cy="80" r="11" stroke="#050505" strokeWidth="2.5" fill="#E8E5DD" />
    <circle cx="48" cy="48" r="10" stroke="#050505" strokeWidth="2" fill="#E8E5DD" />
    <circle cx="112" cy="112" r="10" stroke="#050505" strokeWidth="2" fill="#E8E5DD" />
    <circle cx="112" cy="48" r="10" stroke="#050505" strokeWidth="2" fill="#E8E5DD" />
    <circle cx="48" cy="112" r="10" stroke="#050505" strokeWidth="2" fill="#E8E5DD" />
  </svg>
);

// Hand-Drawn 3D Cinema Glasses
export const GlassesArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 180 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style }}
  >
    {/* Temples */}
    <path d="M15 45 L5 25" stroke="#050505" strokeWidth="3" strokeLinecap="round" />
    <path d="M165 45 L175 25" stroke="#050505" strokeWidth="3" strokeLinecap="round" />

    {/* Frames */}
    <rect x="15" y="32" width="65" height="46" rx="6" stroke="#050505" strokeWidth="3.5" fill="#F3F1EB" />
    <rect x="100" y="32" width="65" height="46" rx="6" stroke="#050505" strokeWidth="3.5" fill="#F3F1EB" />

    {/* Lenses */}
    <rect x="22" y="38" width="51" height="34" rx="4" fill="#050505" opacity="0.85" />
    <rect x="107" y="38" width="51" height="34" rx="4" stroke="#050505" strokeWidth="2" fill="#E8E5DD" />

    {/* Lens reflections */}
    <line x1="28" y1="44" x2="38" y2="44" stroke="#F3F1EB" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="113" y1="44" x2="123" y2="44" stroke="#050505" strokeWidth="1.5" strokeLinecap="round" />

    {/* Bridge */}
    <path d="M80 46 Q90 40 100 46" stroke="#050505" strokeWidth="4" strokeLinecap="round" fill="none" />
  </svg>
);

// Hand-Drawn Ticket Stub
export const TicketStubArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 160 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style }}
  >
    {/* Ticket with side notches */}
    <path
      d="M10 15 
         H150 
         V38 
         A7 7 0 0 0 150 52 
         V75 
         H10 
         V52 
         A7 7 0 0 0 10 38 
         Z"
      stroke="#050505"
      strokeWidth="2.5"
      fill="#F3F1EB"
    />
    <line x1="108" y1="16" x2="108" y2="74" stroke="#050505" strokeWidth="1.5" strokeDasharray="3 3" />
    <text x="24" y="36" fill="#050505" fontSize="10" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">ADMIT ONE</text>
    <text x="24" y="52" fill="#6B6B65" fontSize="8" fontFamily="monospace">ROW D • SEAT 14</text>
    <text x="24" y="66" fill="#050505" fontSize="7" fontFamily="monospace" fontWeight="700">№ 840219</text>
    {/* Barcode representation */}
    <line x1="118" y1="26" x2="118" y2="64" stroke="#050505" strokeWidth="2.5" />
    <line x1="124" y1="26" x2="124" y2="64" stroke="#050505" strokeWidth="1.5" />
    <line x1="128" y1="26" x2="128" y2="64" stroke="#050505" strokeWidth="3" />
    <line x1="135" y1="26" x2="135" y2="64" stroke="#050505" strokeWidth="1" />
    <line x1="140" y1="26" x2="140" y2="64" stroke="#050505" strokeWidth="2.5" />
  </svg>
);

// Hand-Drawn Vintage Cinema Chair
export const CinemaChairArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 140 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style }}
  >
    {/* Headrest / Cushion Back */}
    <rect x="35" y="20" width="70" height="70" rx="8" stroke="#050505" strokeWidth="3" fill="#050505" />
    <line x1="58" y1="28" x2="58" y2="82" stroke="#F3F1EB" strokeWidth="1.5" />
    <line x1="82" y1="28" x2="82" y2="82" stroke="#F3F1EB" strokeWidth="1.5" />
    <circle cx="70" cy="35" r="4" fill="#F3F1EB" />

    {/* Folded Seat Base */}
    <path d="M30 90 L110 90 L102 115 L38 115 Z" stroke="#050505" strokeWidth="3" fill="#F3F1EB" />
    <line x1="42" y1="102" x2="98" y2="102" stroke="#050505" strokeWidth="1.5" strokeDasharray="3 3" />

    {/* Armrests */}
    <rect x="22" y="60" width="12" height="35" rx="3" stroke="#050505" strokeWidth="2.5" fill="#050505" />
    <rect x="106" y="60" width="12" height="35" rx="3" stroke="#050505" strokeWidth="2.5" fill="#050505" />

    {/* Sturdy Cast Iron Leg / Pedestal */}
    <path d="M70 115 L70 145" stroke="#050505" strokeWidth="4" strokeLinecap="round" />
    <path d="M45 145 L95 145" stroke="#050505" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// Hand-Drawn Popcorn Bucket
export const PopcornArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 130 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style }}
  >
    {/* Popcorn Kernels Cloud */}
    <circle cx="45" cy="36" r="14" stroke="#050505" strokeWidth="2.5" fill="#F3F1EB" />
    <circle cx="68" cy="26" r="16" stroke="#050505" strokeWidth="2.5" fill="#F3F1EB" />
    <circle cx="90" cy="36" r="13" stroke="#050505" strokeWidth="2.5" fill="#F3F1EB" />
    <circle cx="58" cy="42" r="12" stroke="#050505" strokeWidth="2.5" fill="#F3F1EB" />
    <circle cx="78" cy="42" r="12" stroke="#050505" strokeWidth="2.5" fill="#F3F1EB" />

    {/* Tapered Bucket */}
    <path d="M32 50 L42 135 L88 135 L98 50 Z" stroke="#050505" strokeWidth="3" fill="#F3F1EB" />
    {/* Bold Stripes */}
    <path d="M45 50 L52 135 L61 135 L56 50 Z" fill="#050505" />
    <path d="M69 50 L71 135 L79 135 L80 50 Z" fill="#050505" />
  </svg>
);

// Hand-Drawn Vintage Hollywood Camera
export const VintageCameraArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style }}
  >
    {/* Twin Top Mag Magazines (Mickey Mouse Ears) */}
    <circle cx="68" cy="48" r="26" stroke="#050505" strokeWidth="3" fill="#050505" />
    <circle cx="112" cy="48" r="26" stroke="#050505" strokeWidth="3" fill="#050505" />
    <circle cx="68" cy="48" r="8" fill="#F3F1EB" />
    <circle cx="112" cy="48" r="8" fill="#F3F1EB" />

    {/* Camera Body */}
    <rect x="52" y="70" width="76" height="60" rx="4" stroke="#050505" strokeWidth="3.5" fill="#F3F1EB" />
    <rect x="62" y="80" width="30" height="25" stroke="#050505" strokeWidth="2" fill="#050505" />
    <circle cx="106" cy="92" r="8" stroke="#050505" strokeWidth="2" />

    {/* Matte Box & Lens */}
    <path d="M128 85 L156 75 L156 115 L128 105 Z" stroke="#050505" strokeWidth="3" fill="#050505" />

    {/* Heavy Tripod Legs */}
    <path d="M90 130 L90 165" stroke="#050505" strokeWidth="3.5" />
    <path d="M65 175 L90 135 L115 175" stroke="#050505" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

// Hand-Drawn Classic Movie Palace / Theatre Facade
export const TheatreFacadeArt = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style }}
  >
    {/* Art Deco Roofline */}
    <path d="M30 50 L100 20 L170 50 Z" stroke="#050505" strokeWidth="3" fill="#050505" />
    <circle cx="100" cy="35" r="6" fill="#F3F1EB" />

    {/* Marquee Canopy */}
    <rect x="25" y="55" width="150" height="35" rx="3" stroke="#050505" strokeWidth="3" fill="#F3F1EB" />
    <text x="52" y="77" fill="#050505" fontSize="13" fontFamily="sans-serif" fontWeight="900" letterSpacing="3">C I N E A I</text>
    {/* Marquee Bulbs */}
    <circle cx="34" cy="84" r="2.5" fill="#050505" />
    <circle cx="50" cy="84" r="2.5" fill="#050505" />
    <circle cx="66" cy="84" r="2.5" fill="#050505" />
    <circle cx="82" cy="84" r="2.5" fill="#050505" />
    <circle cx="98" cy="84" r="2.5" fill="#050505" />
    <circle cx="114" cy="84" r="2.5" fill="#050505" />
    <circle cx="130" cy="84" r="2.5" fill="#050505" />
    <circle cx="146" cy="84" r="2.5" fill="#050505" />
    <circle cx="162" cy="84" r="2.5" fill="#050505" />

    {/* Entrance Pillars & Doors */}
    <rect x="40" y="90" width="120" height="60" stroke="#050505" strokeWidth="2.5" fill="#F3F1EB" />
    <line x1="75" y1="90" x2="75" y2="150" stroke="#050505" strokeWidth="2" />
    <line x1="125" y1="90" x2="125" y2="150" stroke="#050505" strokeWidth="2" />
    <rect x="85" y="105" width="30" height="45" stroke="#050505" strokeWidth="2" fill="#050505" />
  </svg>
);

// Hand-Drawn Large Organic Black Blobs
export const OrganicBlackBlob = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 340 340"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ pointerEvents: 'none', ...style }}
  >
    <path
      d="M170 20
         C255 18 318 82 320 170
         C322 258 250 318 160 320
         C70 322 20 258 20 170
         C20 82 85 22 170 20 Z"
      fill="#050505"
    />
    <circle cx="270" cy="90" r="8" fill="#F3F1EB" />
    <circle cx="70" cy="240" r="5" fill="#F3F1EB" />
    <circle cx="250" cy="250" r="4" fill="#F3F1EB" />
  </svg>
);

export const OrganicBlobSecondary = ({ className = '', style = {} }) => (
  <svg
    viewBox="0 0 280 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ pointerEvents: 'none', ...style }}
  >
    <path
      d="M140 15
         C210 10 265 65 268 140
         C271 215 210 265 135 268
         C60 271 12 215 15 140
         C18 65 70 20 140 15 Z"
      fill="#050505"
    />
    <circle cx="85" cy="80" r="6" fill="#F3F1EB" />
  </svg>
);
