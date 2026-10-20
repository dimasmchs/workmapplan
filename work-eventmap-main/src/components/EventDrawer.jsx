import { X, Clock, Radio, CalendarDays, ArrowRight } from "lucide-react";
import FacilityIcon, { ICON_LABELS } from "./FacilityIcon";

function statusInfo(status) {
  if (status === "live") return { label: "Live now", pill: "bg-accent/15 text-accent", dot: true };
  if (status === "upcoming") return { label: "Upcoming", pill: "bg-primary/10 text-primary", dot: false };
  return { label: "Ended", pill: "bg-muted text-muted-foreground", dot: false };
}

function formatTime(t) {
  if (!t) return "—";
  try {
    return new Date(t).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return t;
  }
}

export default function EventDrawer({ event, onClose, onOpenFacility }) {
  if (!event) return null;
  const s = statusInfo(event.status);

  return (
    <div className="drawer-enter pointer-events-auto absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col">
      <div className="glass-card flex h-full flex-col rounded-l-3xl">
        {/* Header */}
        <div className="relative h-36 shrink-0 overflow-hidden rounded-t-3xl bg-gradient-to-br from-primary to-accent">
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/15">
              <FacilityIcon type={event.facility_icon} size={40} color="#FFFBEB" strokeWidth={1.5} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-primary shadow-md transition hover:bg-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.pill} bg-white/90`}>
              <Radio size={11} className={s.dot ? "animate-pulse" : ""} /> {s.label}
            </span>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">{event.name}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 rounded-2xl border border-border bg-card p-3.5">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock size={14} /> Schedule
            </div>
            <p className="text-sm font-medium leading-snug text-foreground">
              {formatTime(event.start_time)} — {formatTime(event.end_time)}
            </p>
          </div>

          {event.description && (
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
          )}

          <button
            onClick={() => onOpenFacility(event.facility_id)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition hover:bg-muted"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <FacilityIcon type={event.facility_icon} size={22} color="#FFFBEB" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Venue</span>
              <span className="block truncate text-sm font-semibold text-foreground">{event.facility_name}</span>
              <span className="block truncate text-xs text-muted-foreground">{ICON_LABELS[event.facility_icon]}</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          <CalendarDays size={12} />
          <span>Event hosted at {event.facility_name}</span>
        </div>
      </div>
    </div>
  );
}