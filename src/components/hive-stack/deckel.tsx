import { themeColors } from "../hive-stack";

const DeckelSVG = ({ height = 25, fill = themeColors.Deckel, isHovered = false }) => (
  <g>
    <path d={`M 10 ${height} L 75 5 L 140 ${height} L 130 ${height + 5} L 75 10 L 20 ${height + 5} Z`} fill={fill} stroke="#654321" strokeWidth="1" />
    <rect x="70" y="3" width="10" height="3" fill="#654321" rx="1" />
    <circle cx="50" cy={height - 8} r="2" fill="#654321" />
    <circle cx="100" cy={height - 8} r="2" fill="#654321" />
    {isHovered && (
      <path d={`M 8 ${height + 2} L 75 3 L 142 ${height + 2} L 132 ${height + 7} L 75 8 L 18 ${height + 7} Z`} fill="none" stroke="#3B82F6" strokeWidth="2" className="animate-pulse" />
    )}
  </g>
);

export default DeckelSVG;