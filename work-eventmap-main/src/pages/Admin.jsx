import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, ShieldCheck, Lock, MapPin, LogIn, RefreshCw } from "lucide-react";
import { api } from "@/api/client";
import FacilityIcon from "@/components/FacilityIcon";
import FacilityEditor from "@/components/FacilityEditor";
import ActivityManager from "@/components/ActivityManager";

export default function Admin() {
  const [me, setMe] = useState(undefined); // undefined = loading
  const [facilities, setFacilities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // facility object | "new" | null

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [facs, acts] = await Promise.all([
        api.entities.Facility.filter({}, { sort: "sort_order", limit: 100 }),
        api.entities.Activity.filter({}, { sort: "start_time", limit: 500 }),
      ]);
      setFacilities(facs.items || facs || []);
      setActivities(acts.items || acts || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    api.auth.me().then((u) => setMe(u)).catch(() => setMe(null));
    loadAll();
  }, [loadAll]);

  // Loading auth state
  if (me === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  // Not an admin — gate
  if (!me || me.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="glass-card w-full max-w-md rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Lock size={26} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Admin access required</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The campus map is public, but managing facilities and activities is restricted to admins.
            Sign in with an admin account to continue.
          </p>
          <button
            onClick={() => api.auth.redirectToLogin("/admin")}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <LogIn size={16} /> Sign in as admin
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            Need admin access? Ask an existing admin to promote your account.
          </p>
        </div>
      </div>
    );
  }

  const actsFor = (fid) => activities.filter((a) => a.facility_id === fid);

  function handleSaved(updated) {
    loadAll();
    setSelected(updated);
  }
  function handleDeleted(id) {
    loadAll();
    setSelected(null);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar — facility list */}
      <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MapPin size={18} />
          </div>
          <div className="leading-tight">
            <p className="tag-label">PCU Dasma</p>
            <h1 className="text-sm font-semibold text-foreground">Admin Console</h1>
          </div>
          <button onClick={loadAll} className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted" title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="px-3 py-2">
          <button
            onClick={() => setSelected("new")}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={16} /> Add Facility
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-accent" size={20} />
            </div>
          ) : (
            facilities.map((f) => {
              const active = selected && selected !== "new" && selected.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                    active ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <FacilityIcon type={f.icon} size={18} color="#FFFBEB" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{f.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {actsFor(f.id).length} activities
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-border px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck size={13} className="text-accent" /> Signed in as {me.email}
          </span>
        </div>
      </aside>

      {/* Main — editor + activity manager */}
      <main className="flex flex-1 overflow-hidden">
        {selected ? (
          <>
            <div className="w-[440px] shrink-0 border-r border-border bg-card">
              <FacilityEditor
                facility={selected === "new" ? null : selected}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
                onBack={() => setSelected(null)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selected === "new" ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Save the new facility to manage its activities.
                </div>
              ) : (
                <div className="mx-auto max-w-xl">
                  <h2 className="mb-3 text-lg font-semibold text-foreground">{selected.name} — Schedule</h2>
                  <ActivityManager
                    facilityId={selected.id}
                    activities={actsFor(selected.id)}
                    onChanged={loadAll}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <MapPin size={28} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Select a facility to edit, or add a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}