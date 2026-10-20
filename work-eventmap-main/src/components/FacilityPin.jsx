import { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { iconSvgString } from "./FacilityIcon";

// A rounded-square pin with a cute facility symbol. Live facilities get a
// pulsing ring + LIVE badge; dimmed when a global "active only" filter is on.
export default function FacilityPin({ facility, isLive, isDimmed, isSelected, onSelect }) {
  const icon = useMemo(() => {
    const svg = iconSvgString(facility.icon, 22, "#FFFBEB");
    const liveBadge = isLive ? `<span class="pin-live-badge">LIVE</span>` : "";
    const html = `
      <div class="pin-shell ${isLive ? "live" : ""} ${isDimmed ? "dimmed" : ""} ${isSelected ? "selected" : ""}">
        <div class="pin-icon">${svg}</div>
        ${liveBadge}
      </div>`;
    return L.divIcon({
      className: "facility-pin",
      html,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -28],
    });
  }, [facility.icon, isLive, isDimmed, isSelected]);

  return (
    <Marker
      position={[facility.lat, facility.lng]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : isLive ? 500 : 0}
      eventHandlers={{ click: onSelect }}
    />
  );
}