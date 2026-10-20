import { X, Clock, CalendarDays, Banknote, CheckCircle2, Radio, MapPin, ScrollText } from "lucide-react";
import FacilityIcon, { ICON_LABELS } from "./FacilityIcon";

function StatusPill({ active, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
        active ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
      }`}
    >
      <Radio size={11} className={active ? "animate-pulse" : ""} />
      {label}
    </span>
  );
}

function formatTime(t) {
  if (!t) return "—";
  try {
    return new Date(t).toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return t;
  }
}

export default function FacilityDrawer({ facility, onClose }) {
  if (!facility) return null;
  const current = facility.current_activity;
  const upcoming = facility.upcoming_activities || [];

  return (
    <div className="drawer-enter pointer-events-auto absolute right-0 top-0 z-[1200] flex h-full w-full max-w-[420px] flex-col">
      <div className="glass-card flex h-full flex-col rounded-l-3xl">
        {/* Immersive header */}
        <div className="relative h-44 shrink-0 overflow-hidden rounded-t-3xl bg-gradient-to-br from-primary to-accent">
          {facility.photos?.[0] ? (
            <img
              src={facility.photos[0]}
              alt={facility.name}
              loading="lazy"
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FacilityIcon type={facility.icon} size={64} color="#FFFBEB" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-primary shadow-md transition hover:bg-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="tag-label text-white/80">{ICON_LABELS[facility.icon] || "Facility"}</span>
            <h2 className="text-2xl font-semibold tracking-tight">{facility.name}</h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
          {/* Status bar */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Radio size={13} className={current ? "text-accent" : "text-muted-foreground"} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Happening Now</span>
              </div>
              <p className="text-sm font-medium leading-snug text-foreground">
                {current ? current.name : "No current activity"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Clock size={13} className="text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Up Next</span>
              </div>
              <p className="text-sm font-medium leading-snug text-foreground">
                {upcoming[0] ? upcoming[0].name : "Nothing scheduled"}
              </p>
            </div>
          </div>

          {/* Description */}
          {facility.description && (
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{facility.description}</p>
          )}

          {/* Schedule */}
          <section className="mb-5">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarDays size={14} /> Schedule
            </h3>
            <div className="space-y-2">
              {current && (
                <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3">
                  <StatusPill active label="LIVE" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{current.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(current.start_time)} — {formatTime(current.end_time)}
                    </p>
                    {current.description && <p className="mt-1 text-xs text-muted-foreground">{current.description}</p>}
                  </div>
                </div>
              )}
              {upcoming.map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                  <CalendarDays size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(a.start_time)} — {formatTime(a.end_time)}
                    </p>
                    {a.description && <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>}
                  </div>
                </div>
              ))}
              {!current && upcoming.length === 0 && (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No activities scheduled.
                </p>
              )}
            </div>
          </section>

          {/* Rental terminal */}
          <section className="mb-2">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Banknote size={14} /> Venue Rental
            </h3>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-xs font-medium text-muted-foreground">Rental Cost</span>
                <span className="text-xl font-bold tracking-tight text-primary">
                  {facility.rental_cost || "—"}
                </span>
              </div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requirements</p>
              <ul className="space-y-1.5">
                {(facility.rental_requirements || []).length === 0 && (
                  <li className="text-xs text-muted-foreground">No special requirements.</li>
                )}
                {(facility.rental_requirements || []).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-accent" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Policies & Guidelines */}
          {facility.policies?.length > 0 && (
            <section className="mb-2">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ScrollText size={14} /> Policies & Guidelines
              </h3>
              <div className="space-y-3">
                {facility.policies.map((sec, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-3.5">
                    <p className="mb-2 text-sm font-semibold text-primary">{sec.heading}</p>
                    <ul className="space-y-1.5">
                      {sec.items.map((it, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs leading-relaxed text-foreground">
                          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-accent" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer coordinate */}
        <div className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          <MapPin size={12} />
          <span className="font-mono">{facility.lat.toFixed(5)}, {facility.lng.toFixed(5)}</span>
        </div>
      </div>
    </div>
  );
}