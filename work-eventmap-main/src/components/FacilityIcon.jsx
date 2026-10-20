// Cute, clean line-style SVG symbols for each facility type.
// Shared between the React component (drawer/header) and the leaflet divIcon HTML string.

export const ICON_PATHS = {
  floor: `<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2"/>`,
  projector: `<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 8h6"/>`,
  basketball: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/><path d="M5.6 5.6c3 4 3 8.8 0 12.8M18.4 5.6c-3 4-3 8.8 0 12.8"/>`,
  book: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
  dumbbell: `<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.829 2.829l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>`,
  curtain: `<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 7h18"/><path d="M8 7v14M12 7v14M16 7v14"/>`,
};

export const ICON_TYPES = Object.keys(ICON_PATHS);

export const ICON_LABELS = {
  floor: "Building Floor",
  projector: "Audio-Visual Room",
  basketball: "Court",
  book: "Classroom",
  dumbbell: "Gym",
  curtain: "Hall",
};

export function iconSvgString(type, size = 24, color = "currentColor") {
  const inner = ICON_PATHS[type] || ICON_PATHS.book;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export default function FacilityIcon({ type, size = 24, className = "", color = "currentColor", strokeWidth = 2 }) {
  const inner = ICON_PATHS[type] || ICON_PATHS.book;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}