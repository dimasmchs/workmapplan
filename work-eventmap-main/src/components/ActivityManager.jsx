import { useState } from "react";
import { Plus, Trash2, Pencil, Clock, X, Save } from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function fromLocalInput(v) {
  return v ? new Date(v).toISOString() : null;
}
function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ActivityManager({ facilityId, activities, onChanged }) {
  const [editing, setEditing] = useState(null); // null | {} (new) | activity
  const [form, setForm] = useState({ name: "", description: "", start_time: "", end_time: "" });
  const [saving, setSaving] = useState(false);

  const list = (activities || []).slice().sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  function startNew() {
    setEditing({});
    setForm({ name: "", description: "", start_time: "", end_time: "" });
  }
  function startEdit(a) {
    setEditing(a);
    setForm({ name: a.name, description: a.description || "", start_time: toLocalInput(a.start_time), end_time: toLocalInput(a.end_time) });
  }
  function cancel() {
    setEditing(null);
  }

  async function save() {
    if (!form.name.trim() || !form.start_time || !form.end_time) return alert("Name, start and end are required.");
    setSaving(true);
    const payload = {
      facility_id: facilityId,
      name: form.name.trim(),
      description: form.description.trim(),
      start_time: fromLocalInput(form.start_time),
      end_time: fromLocalInput(form.end_time),
    };
    try {
      if (editing?.id) {
        await api.entities.Activity.update(editing.id, payload);
      } else {
        await api.entities.Activity.create(payload);
      }
      setEditing(null);
      onChanged();
    } catch (err) {
      console.error(err);
      alert("Save failed — make sure you are signed in as an admin.");
    }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Delete this activity?")) return;
    try {
      await api.entities.Activity.delete(id);
      onChanged();
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock size={14} /> Activities
        </h3>
        {!editing && (
          <Button onClick={startNew} size="sm" variant="outline" className="h-7 px-2 text-xs">
            <Plus size={13} className="mr-1" /> Add
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2.5 rounded-xl border border-accent/30 bg-accent/5 p-3">
          <div>
            <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Activity name" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Start</Label>
              <Input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">End</Label>
              <Input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} size="sm" className="flex-1 bg-primary text-primary-foreground">
              <Save size={13} className="mr-1" /> {saving ? "…" : "Save"}
            </Button>
            <Button onClick={cancel} size="sm" variant="outline">
              <X size={13} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {list.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              No activities yet.
            </p>
          )}
          {list.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{a.name}</p>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => startEdit(a)} className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(a.id)} className="grid h-6 w-6 place-items-center rounded text-destructive hover:bg-destructive/10">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{fmt(a.start_time)} → {fmt(a.end_time)}</p>
              {a.description && <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}