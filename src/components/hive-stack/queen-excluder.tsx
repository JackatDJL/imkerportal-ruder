import { themeColors } from "../hive-stack";

const QueenExcluderSVG = ({ height = 10, fill = themeColors.Koeniginnenabspehrgitter, isHovered = false }) => (
  <g>
    <rect x="10" y="0" width="130" height={height} fill={fill} stroke="#696969" strokeWidth="1" rx="1" />
    {Array.from({ length: 25 }).map((_, i) => (
      <line key={`v${i}`} x1={12 + i * 5} y1="1" x2={12 + i * 5} y2={height - 1} stroke="#D3D3D3" strokeWidth="0.5" />
    ))}
    <line x1="11" y1={height / 2} x2="139" y2={height / 2} stroke="#D3D3D3" strokeWidth="0.5" />
    {isHovered && <rect x="8" y="-2" width="134" height={height + 4} fill="none" stroke="#3B82F6" strokeWidth="2" rx="3" className="animate-pulse" />}
  </g>
);

export default QueenExcluderSVG;