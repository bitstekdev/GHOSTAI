import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../services/axiosInstance";

const EditPlanModal = ({ open, plan, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    badge: "",
    validityDays: 30,
    description: "",
    showOnContext: [],
    limits: {
      maxPages: "",
      maxBooks: "",
      faceSwaps: "",
      regenerations: "",
      edits: "",
      erases: "",
    },
    printType: "",
    printSubType: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name || "",
        price: plan.price || "",
        badge: plan.badge || "",
        validityDays: plan.validityDays || 30,
        description: plan.description || "",
        showOnContext: plan.showOnContext || [],
        limits: plan.limits || {
          maxPages: "",
          maxBooks: "",
          faceSwaps: "",
          regenerations: "",
          edits: "",
          erases: "",
        },
        printType: plan.printType || "",
        printSubType: plan.printSubType || "",
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("limits.")) {
      const key = name.split(".")[1];
      setForm(p => ({ ...p, limits: { ...p.limits, [key]: value } }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const toggleCtx = (c) => {
    setForm(p => ({
      ...p,
      showOnContext: p.showOnContext.includes(c)
        ? p.showOnContext.filter(x => x !== c)
        : [...p.showOnContext, c]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        badge: form.badge,
        validityDays: Number(form.validityDays),
        description: form.description,
        showOnContext: form.showOnContext,
        printType: plan.type === "purchase" ? form.printType : undefined,
        printSubType: plan.type === "purchase" ? form.printSubType : undefined,
        limits: plan.type === "subscription"
          ? Object.fromEntries(Object.entries(form.limits).map(([k,v]) => [k, Number(v || 0)]))
          : undefined,
      };

      await api.put(`/api/v1/subscriptions/plans/${plan._id}`, payload);
      alert("Plan updated successfully!");
      onSaved();
      onClose();
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!open || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="admin-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gradient-to-br from-[#0b0f13] to-[#020617] pb-4">
          <h2 className="text-3xl font-bold magic-shine">Edit: {plan.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* BASIC INFO */}
          <div>
            <h3 className="admin-section">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="admin-input"
                name="name"
                placeholder="Plan Name"
                value={form.name}
                onChange={handleChange}
              />
              <input
                className="admin-input"
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
              />
              <input
                className="admin-input"
                name="badge"
                placeholder="Badge"
                value={form.badge}
                onChange={handleChange}
              />
              <input
                className="admin-input"
                type="number"
                name="validityDays"
                placeholder="Validity (days)"
                value={form.validityDays}
                onChange={handleChange}
              />
            </div>
            <textarea
              className="admin-input w-full mt-4"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {/* CONTEXT */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <h3 className="admin-section">Show On Context</h3>
            <div className="flex gap-4 flex-wrap">
              {["initial","purchase","generate","upgrade","all"].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCtx(c)}
                  className={`admin-chip ${form.showOnContext.includes(c) ? "admin-chip-active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* LIMITS - only for subscription */}
          {plan.type === "subscription" && (
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h2 className="admin-section mb-4">Limits</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {[
                  ["maxPages","Max Pages","📄"],
                  ["maxBooks","Max Books","📚"],
                  ["faceSwaps","Face Swaps","🙂"],
                  ["regenerations","Regenerations","♻️"],
                  ["edits","Edits","✏️"],
                  ["erases","Erases","🧹"],
                ].map(([key,label,icon]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs text-white/60 flex items-center gap-2">
                      <span>{icon}</span>{label}
                    </label>
                    <input
                      type="number"
                      value={form.limits[key] || 0}
                      onChange={e => setForm(p=>({...p, limits:{...p.limits, [key]:e.target.value}}))}
                      className="admin-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRINT OPTIONS - only for purchase */}
          {plan.type === "purchase" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Print Type</label>
                <select
                  name="printType"
                  value={form.printType}
                  onChange={handleChange}
                  className="admin-input w-full"
                >
                  <option value="">Select Print Type</option>
                  <option value="softcover">softcover</option>
                  <option value="hardcover">hardcover</option>
                  <option value="both">both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Print Series</label>
                <select
                  name="printSubType"
                  value={form.printSubType}
                  onChange={handleChange}
                  className="admin-input w-full"
                >
                  <option value="">Select Print Series</option>
                  <option value="Spark">Spark</option>
                  <option value="Bloom">Bloom</option>
                  <option value="Wander">Wander</option>
                  <option value="Heirloom">Heirloom</option>
                  <option value="Legacy">Legacy</option>
                  <option value="Heritage">Heritage</option>
                </select>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-4 mt-10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn-primary flex-1 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 border border-white/30 rounded-2xl py-4 text-white font-semibold hover:bg-white/20 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPlanModal;
