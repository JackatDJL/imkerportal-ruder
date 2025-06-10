import { defaultPalettes, type ColorPalette } from "./color-system";

interface HexagonIconProps {
  className?: string;
  palette?: ColorPalette;
}

export default function HexagonIcon({
  className,
  palette = defaultPalettes.hive,
}: HexagonIconProps) {
  const colors = palette!.colours;

  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Dynamic gradient definitions */}
        {colors.map((color, index) => {
          const nextColor = colors[(index + 1) % colors.length];
          return (
            <linearGradient
              key={`hex${index + 1}`}
              id={`hex${index + 1}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={nextColor} />
            </linearGradient>
          );
        })}

        {/* Icon background circle for contrast */}
        <filter id="iconBg" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="rgba(0,0,0,0.1)"
          />
        </filter>
      </defs>

      {/* Main honeycomb cluster */}
      {/* Center hexagon */}
      <path
        d="M60 35L70 41V53L60 59L50 53V41L60 35Z"
        fill="url(#hex2)"
        stroke="white"
        strokeWidth="3"
      />

      {/* Top hexagon */}
      <path
        d="M60 15L70 21V33L60 39L50 33V21L60 15Z"
        fill="url(#hex1)"
        stroke="white"
        strokeWidth="3"
      />

      {/* Top-right hexagon */}
      <path
        d="M77 25L87 31V43L77 49L67 43V31L77 25Z"
        fill="url(#hex3)"
        stroke="white"
        strokeWidth="3"
      />

      {/* Bottom-right hexagon */}
      <path
        d="M77 45L87 51V63L77 69L67 63V51L77 45Z"
        fill="url(#hex4)"
        stroke="white"
        strokeWidth="3"
      />

      {/* Bottom hexagon */}
      <path
        d="M60 55L70 61V73L60 79L50 73V61L60 55Z"
        fill="url(#hex5)"
        stroke="white"
        strokeWidth="3"
      />

      {/* Bottom-left hexagon */}
      <path
        d="M43 45L53 51V63L43 69L33 63V51L43 45Z"
        fill="url(#hex6)"
        stroke="white"
        strokeWidth="3"
      />

      {/* Top-left hexagon */}
      <path
        d="M43 25L53 31V43L43 49L33 43V31L43 25Z"
        fill="url(#hex1)"
        stroke="white"
        strokeWidth="3"
      />

      {/* Small scattered hexagons */}
      <path
        d="M25 20L30 23V29L25 32L20 29V23L25 20Z"
        fill="url(#hex2)"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M95 35L100 38V44L95 47L90 44V38L95 35Z"
        fill="url(#hex4)"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M15 50L20 53V59L15 62L10 59V53L15 50Z"
        fill="url(#hex3)"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M100 60L105 63V69L100 72L95 69V63L100 60Z"
        fill="url(#hex5)"
        stroke="white"
        strokeWidth="2"
      />

      {/* Tiny hexagons */}
      <path
        d="M105 20L107 21V25L105 26L103 25V21L105 20Z"
        fill="url(#hex1)"
        stroke="white"
        strokeWidth="1"
      />
      <path
        d="M8 35L10 36V40L8 41L6 40V36L8 35Z"
        fill="url(#hex6)"
        stroke="white"
        strokeWidth="1"
      />

      {/* Icon background circle for better contrast */}
      <circle
        cx="60"
        cy="47"
        r="18"
        fill="rgba(255,255,255,0.9)"
        filter="url(#iconBg)"
      />
      <circle
        cx="60"
        cy="47"
        r="16"
        fill="rgba(255,255,255,0.95)"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="1"
      />
    </svg>
  );
}
