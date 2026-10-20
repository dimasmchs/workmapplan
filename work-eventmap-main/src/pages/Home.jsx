import { useState, useMemo, useEffect } from "react";
import { Radio, MapPin, Loader2, Search, X, Building2, CalendarClock, Layers, ChevronRight } from "lucide-react";
import { api } from "@/api/client";
import FacilityDrawer from "@/components/FacilityDrawer";
import EventDrawer from "@/components/EventDrawer";
import FacilityIcon, { ICON_LABELS } from "@/components/FacilityIcon";
import { Image } from "@/components/ui/image";

const STATUS = {
  live: { label: "Live", className: "bg-accent/15 text-accent" },
  upcoming: { label: "Upcoming", className: "bg-primary/10 text-primary" },
  past: { label: "Ended", className: "bg-muted text-muted-foreground" },
};

const TABS = [
  { key: "all", label: "All", icon: Layers },
  { key: "facilities", label: "Facilities", icon: Building2 },
  { key: "events", label: "Events", icon: CalendarClock },
  { key: "live", label: "Live Now", icon: Radio },
];

function eventStatus(a, now) {
  const s = new Date(a.start_time).getTime();
  const e = new Date(a.end_time).getTime();
  if (s <= now && e > now) return "live";
  if (s > now) return "upcoming";
  return "past";
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

function FacilityCard({ entry, onClick }) {
  const hero = entry.data.photos?.[0];
  return (
    <button
      onClick={onClick}
      className="block w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {hero ? (
          <Image src={hero} fittingType="fill" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary to-accent">
            <FacilityIcon type={entry.icon} size={44} color="#FFFBEB" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        {entry.isLive && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            <Radio size={9} className="animate-pulse" /> LIVE
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/20 backdrop-blur">
            <FacilityIcon type={entry.icon} size={16} color="#FFFBEB" />
          </span>
          <span className="truncate text-sm font-semibold text-white">{entry.name}</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <span className="text-xs text-muted-foreground">
          {ICON_LABELS[entry.icon]}
          {entry.upcomingCount > 0 && ` · ${entry.upcomingCount} upcoming`}
        </span>
        <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
      </div>
    </button>
  );
}

function EventCard({ entry, onClick }) {
  const s = STATUS[entry.status];
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition hover:border-primary/30 hover:shadow-sm"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <FacilityIcon type={entry.facility_icon} size={24} color="hsl(198 89% 28%)" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{entry.name}</span>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.className}`}>
            <Radio size={9} className={entry.status === "live" ? "animate-pulse" : ""} /> {s.label}
          </span>
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {formatTime(entry.start_time)} · {entry.facility_name}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
    </button>
  );
}

export default function Home() {
  const [facilities, setFacilities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [facs, acts] = await Promise.all([
          api.entities.Facility.filter({}, { sort: "sort_order", limit: 100 }),
          api.entities.Activity.filter({}, { sort: "start_time", limit: 500 }),
        ]);
        setFacilities(facs.items || facs || []);
        setActivities(acts.items || acts || []);
      } catch (e) {
        console.error("Failed to load campus data", e);
      }
      setLoading(false);
    })();
  }, []);

  const now = Date.now();

  const facilityMap = useMemo(() => {
    const m = {};
    facilities.forEach((f) => (m[f.id] = f));
    return m;
  }, [facilities]);

  const enrichedFacilities = useMemo(() => {
    const byFac = {};
    activities.forEach((a) => ((byFac[a.facility_id] = byFac[a.facility_id] || []).push(a)));
    return facilities.map((f) => {
      const acts = (byFac[f.id] || []).slice().sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      const current = acts.find((a) => new Date(a.start_time).getTime() <= now && new Date(a.end_time).getTime() > now) || null;
      const upcoming = acts.filter((a) => new Date(a.start_time).getTime() > now);
      return { ...f, current_activity: current, upcoming_activities: upcoming };
    });
  }, [facilities, activities, now]);

  const liveCount = useMemo(
    () => activities.filter((a) => new Date(a.start_time).getTime() <= now && new Date(a.end_time).getTime() > now).length,
    [activities, now]
  );

  const eventEntries = useMemo(
    () =>
      activities.map((a) => {
        const fac = facilityMap[a.facility_id];
        return {
          type: "event",
          id: a.id,
          name: a.name,
          description: a.description,
          start_time: a.start_time,
          end_time: a.end_time,
          facility_id: a.facility_id,
          facility_name: fac?.name || "Unknown facility",
          facility_icon: fac?.icon || "book",
          status: eventStatus(a, now),
        };
      }),
    [activities, facilityMap, now]
  );

  const facilityEntries = useMemo(
    () =>
      enrichedFacilities.map((f) => ({
        type: "facility",
        id: f.id,
        name: f.name,
        icon: f.icon,
        isLive: !!f.current_activity,
        upcomingCount: f.upcoming_activities.length,
        data: f,
      })),
    [enrichedFacilities]
  );

  const searchLower = search.trim().toLowerCase();
  const matches = (name) => !searchLower || (name || "").toLowerCase().includes(searchLower);

  const visibleEntries = useMemo(() => {
    let list = [];
    if (filter === "all" || filter === "facilities") {
      list = list.concat(facilityEntries.filter((f) => matches(f.name)));
    }
    if (filter === "all" || filter === "events" || filter === "live") {
      let evs = eventEntries.filter((e) => matches(e.name) || matches(e.facility_name));
      if (filter === "live") evs = evs.filter((e) => e.status === "live");
      list = list.concat(evs);
    }

    const rank = (e) =>
      e.type === "facility" ? (e.isLive ? 0 : 2) : e.status === "live" ? 0 : e.status === "upcoming" ? 1 : 3;

    list.sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      if (ra === 0 && a.type !== b.type) return a.type === "event" ? -1 : 1;
      if (a.type === "facility" && b.type === "facility") return (a.data.sort_order || 0) - (b.data.sort_order || 0);
      if (a.type === "event" && b.type === "event") return new Date(a.start_time) - new Date(b.start_time);
      return 0;
    });
    return list;
  }, [filter, facilityEntries, eventEntries, searchLower]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const selectedFacility = selected?.type === "facility" ? enrichedFacilities.find((f) => f.id === selected.id) : null;
  const selectedEvent = selected?.type === "event" ? eventEntries.find((e) => e.id === selected.id) : null;

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <MapPin size={20} />
              </div>
              <div className="leading-tight">
                <p className="tag-label">PCU Dasmariñas</p>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">Campus Directory</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5">
              <Radio size={14} className="animate-pulse text-accent" />
              <span className="text-sm font-semibold text-accent">{liveCount}</span>
              <span className="text-sm text-muted-foreground">live</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5">
            <Search size={16} className="shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facilities or events..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="shrink-0 rounded-full p-0.5 text-muted-foreground transition hover:text-foreground" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              const activeTab = filter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    activeTab ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Live now
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary/40" /> Upcoming
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Ended
            </span>
          </div>
        </div>
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          {visibleEntries.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-sm font-medium text-foreground">No results</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different search or filter.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {visibleEntries.map((entry) =>
                entry.type === "facility" ? (
                  <FacilityCard key={`f-${entry.id}`} entry={entry} onClick={() => setSelected({ type: "facility", id: entry.id })} />
                ) : (
                  <EventCard key={`e-${entry.id}`} entry={entry} onClick={() => setSelected({ type: "event", id: entry.id })} />
                )
              )}
            </div>
          )}
        </div>
      </main>

      {/* Facility detail overlay */}
      {selectedFacility && (
        <div className="fixed inset-0 z-[1200]">
          <button className="absolute inset-0 bg-primary/30 backdrop-blur-sm" onClick={() => setSelected(null)} aria-label="Close" />
          <FacilityDrawer facility={selectedFacility} onClose={() => setSelected(null)} />
        </div>
      )}

      {/* Event detail overlay */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[1200]">
          <button className="absolute inset-0 bg-primary/30 backdrop-blur-sm" onClick={() => setSelected(null)} aria-label="Close" />
          <EventDrawer
            event={selectedEvent}
            onClose={() => setSelected(null)}
            onOpenFacility={(id) => setSelected({ type: "facility", id })}
          />
        </div>
      )}
    </div>
  );
}