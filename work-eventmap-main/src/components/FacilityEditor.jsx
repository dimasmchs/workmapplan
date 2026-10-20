import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { Save, Trash2, Plus, X, Upload, ArrowLeft, ScrollText } from "lucide-react";
import FacilityIcon, { ICON_TYPES, ICON_LABELS, iconSvgString } from "./FacilityIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";

const CAMPUS_CENTER = [14.2923, 120.9612];

function makeIcon(type) {
  return L.divIcon({
    className: "facility-pin",
    html: `<div class="pin-shell selected"><div class="pin-icon">${iconSvgString(type, 22, "#FFFBEB")}</div></div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

function DragMarker({ lat, lng, icon, onChange }) {
  const [pos, setPos] = useState([lat, lng]);
  useEffect(() => setPos([lat, lng]), [lat, lng]);
  return (
    <Marker
      position={pos}
      icon={icon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const ll = e.target.getLatLng();
          setPos([ll.lat, ll.lng]);
          onChange(ll.lat, ll.lng);
        },
      }}
    />
  );
}

export default function FacilityEditor({ facility, onSaved, onDeleted, onBack }) {
  const isNew = !facility?.id;
  const [form, setForm] = useState(() => ({
    name: facility?.name || "",
    description: facility?.description || "",
    icon: facility?.icon || "book",
    lat: facility?.lat ?? CAMPUS_CENTER[0],
    lng: facility?.lng ?? CAMPUS_CENTER[1],
    rental_cost: facility?.rental_cost || "",
    rental_requirements: (facility?.rental_requirements || []).join("\n"),
    photos: facility?.photos || [],
    policies: (facility?.policies || []).map((s) => ({ heading: s.heading || "", items: (s.items || []).join("\n") })),
    sort_order: facility?.sort_order ?? 0,
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const icon = useMemo(() => makeIcon(form.icon), [form.icon]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.integrations.Core.UploadPublicFile({ file });
      set("photos", [...form.photos, res.file_url]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!form.name.trim()) return alert("Facility name is required.");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon,
      lat: Number(form.lat),
      lng: Number(form.lng),
      rental_cost: form.rental_cost.trim(),
      rental_requirements: form.rental_requirements.split("\n").map((s) => s.trim()).filter(Boolean),
      photos: form.photos,
      policies: form.policies
        .map((s) => ({ heading: s.heading.trim(), items: s.items.split("\n").map((x) => x.trim()).filter(Boolean) }))
        .filter((s) => s.heading || s.items.length),
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (isNew) {
        const created = await api.entities.Facility.create(payload);
        onSaved(created);
      } else {
        await api.entities.Facility.update(facility.id, payload);
        onSaved({ ...facility, ...payload });
      }
    } catch (err) {
      console.error(err);
      alert("Save failed — make sure you are signed in as an admin.");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!facility?.id) return onBack();
    if (!confirm(`Delete "${facility.name}"? This also removes its activities.`)) return;
    try {
      await api.entities.Facility.delete(facility.id);
      onDeleted(facility.id);
    } catch (err) {
      console.error(err);
      alert("Delete failed — make sure you are signed in as an admin.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <button onClick={onBack} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
          <ArrowLeft size={18} />
        </button>
        <h2 className="flex-1 text-base font-semibold text-foreground">{isNew ? "New Facility" : "Edit Facility"}</h2>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
        {/* Name */}
        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. AVR NAB" />
        </div>

        {/* Icon */}
        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Symbol</Label>
          <div className="grid grid-cols-3 gap-2">
            {ICON_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => set("icon", t)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition ${
                  form.icon === t ? "border-accent bg-accent/10" : "border-border hover:bg-muted"
                }`}
              >
                <FacilityIcon type={t} size={22} color={form.icon === t ? "hsl(196 100% 44%)" : "hsl(198 89% 28%)"} />
                <span className="text-[10px] font-medium text-muted-foreground">{ICON_LABELS[t]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
        </div>

        {/* Pin position */}
        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pin Position — drag to reposition
          </Label>
          <div className="mb-2 flex gap-2">
            <Input type="number" step="0.00001" value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="Lat" />
            <Input type="number" step="0.00001" value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="Lng" />
          </div>
          <div className="h-48 overflow-hidden rounded-xl border border-border">
            <MapContainer center={[form.lat, form.lng]} zoom={17} zoomControl={false} className="h-full w-full" style={{ height: "100%" }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={20} />
              <DragMarker lat={form.lat} lng={form.lng} icon={icon} onChange={(la, lo) => { set("lat", la); set("lng", lo); }} />
            </MapContainer>
          </div>
        </div>

        {/* Rental */}
        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rental Cost</Label>
          <Input value={form.rental_cost} onChange={(e) => set("rental_cost", e.target.value)} placeholder="e.g. ₱5,000 / day" />
        </div>
        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requirements (one per line)</Label>
          <Textarea value={form.rental_requirements} onChange={(e) => set("rental_requirements", e.target.value)} rows={3} placeholder={"Letter of intent\nFaculty approval"} />
        </div>

        {/* Photos */}
        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Photos (stored publicly)</Label>
          <p className="mb-2 text-[11px] text-muted-foreground">The first photo is the hero shown on the directory list — use a 16:9 image.</p>
          <div className="mb-2 flex flex-wrap gap-2">
            {form.photos.map((p, i) => (
              <div key={i} className="relative h-16 w-24 overflow-hidden rounded-lg border border-border">
                <img src={p} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => set("photos", form.photos.filter((_, j) => j !== i))}
                  className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-black/60 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="grid h-16 w-24 cursor-pointer place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted">
              {uploading ? <span className="text-xs">…</span> : <Upload size={18} />}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Order</Label>
          <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
        </div>

        {/* Policies & Guidelines */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ScrollText size={13} /> Policies & Guidelines
            </Label>
            <button
              onClick={() => set("policies", [...form.policies, { heading: "", items: "" }])}
              className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
            >
              <Plus size={12} /> Section
            </button>
          </div>
          <div className="space-y-3">
            {form.policies.map((sec, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Input
                    value={sec.heading}
                    onChange={(e) => {
                      const next = [...form.policies];
                      next[i] = { ...next[i], heading: e.target.value };
                      set("policies", next);
                    }}
                    placeholder="Section heading"
                    className="text-sm"
                  />
                  <button
                    onClick={() => set("policies", form.policies.filter((_, j) => j !== i))}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                  >
                    <X size={15} />
                  </button>
                </div>
                <Textarea
                  value={sec.items}
                  onChange={(e) => {
                    const next = [...form.policies];
                    next[i] = { ...next[i], items: e.target.value };
                    set("policies", next);
                  }}
                  rows={4}
                  placeholder={"One policy per line"}
                  className="text-xs"
                />
              </div>
            ))}
            {form.policies.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
                No policy sections. Click "Section" to add.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border px-5 py-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save size={16} className="mr-1.5" /> {saving ? "Saving…" : "Save"}
        </Button>
        {!isNew && (
          <Button onClick={handleDelete} variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}