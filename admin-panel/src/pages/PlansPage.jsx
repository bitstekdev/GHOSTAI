import { useEffect, useState } from "react";
import {
  Filter,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import api from "../services/axiosInstance";
import EditPlanModal from "../components/EditPlanModal";

/* -------------------- PLAN CARD -------------------- */
const PlanCard = ({ plan, onEdit, onArchive, onUnarchive, onDelete }) => {
  const isSubscription = plan.type === "subscription";
  const isPurchase = plan.type === "purchase";

  const accent = isSubscription
    ? "purple"
    : "cyan";

  return (
    <div
      className={`relative group rounded-2xl p-8 shadow-2xl transition-all duration-300
        bg-gradient-to-br from-[#0b0f13] to-[#020617]
        border ${
          isSubscription
            ? "border-purple-500/30 hover:border-purple-500"
            : "border-cyan-500/30 hover:border-cyan-500"
        }
        hover:shadow-${accent}-500/20`}
    >
      {/* Glow */}
      <div
        className={`absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition
          ${
            isSubscription
              ? "bg-purple-500/10"
              : "bg-cyan-500/10"
          }`}
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{plan.name}</h2>

          {plan.badge && (
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium
                ${
                  isSubscription
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-cyan-500/20 text-cyan-300"
                }`}
            >
              {plan.badge}
            </span>
          )}
        </div>

        {/* PRICE */}
        <p
          className={`text-4xl font-extrabold mb-6
            ${
              isSubscription
                ? "text-purple-400"
                : "text-cyan-400"
            }`}
        >
          ₹{plan.price}
          {isSubscription && (
            <span className="text-sm text-gray-400 ml-1">/mo</span>
          )}
        </p>

        {/* PURCHASE DETAILS */}
        {isPurchase && (
          <div className="text-gray-300 space-y-2 mb-6">
            <p>
              <span className="text-gray-500">Print Type:</span>{" "}
              <span className="capitalize">{plan.printType}</span>
            </p>

            {plan.printSubType && (
              <p>
                <span className="text-gray-500">Edition:</span>{" "}
                {plan.printSubType}
              </p>
            )}

            <p className="text-sm text-gray-400 italic">
              One-time printed book purchase
            </p>
          </div>
        )}

        {/* SUBSCRIPTION LIMITS */}
        {isSubscription && (
          <div className="text-white/80 space-y-2 mb-6">
            <p>• {plan.limits.maxPages} Pages</p>
            <p>• {plan.limits.maxBooks} Books</p>
            <p>• {plan.limits.faceSwaps} Face Swaps</p>
            <p>• {plan.limits.regenerations} Regenerations</p>
            <p>• {plan.limits.edits} Edits</p>

            {plan.limits.characterTraining > 0 && (
              <p>• {plan.limits.characterTraining} Character Trainings</p>
            )}

            <p className="text-sm text-gray-400 mt-2">
              Valid for {plan.validityDays} days
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mt-6">
          {/* EDIT */}
          <button
            onClick={() => onEdit(plan)}
            className={`w-12 h-12 rounded-xl
              bg-${accent}-500/10 border border-${accent}-500/30
              text-${accent}-300
              flex items-center justify-center
              hover:bg-${accent}-500/20 hover:border-${accent}-500
              hover:shadow-lg hover:shadow-${accent}-500/20
              transition-all`}
            title="Edit"
          >
            <Pencil size={16} />
          </button>

          {/* ARCHIVE / RESTORE */}
          {!plan.isArchived ? (
            <button
              onClick={() => onArchive(plan._id)}
              className="w-12 h-12 rounded-xl
                         bg-amber-500/10 border border-amber-500/30
                         text-amber-300
                         flex items-center justify-center
                         hover:bg-amber-500/20 hover:border-amber-500
                         hover:shadow-lg hover:shadow-amber-500/20 transition-all"
              title="Archive"
            >
              <Archive size={16} />
            </button>
          ) : (
            <button
              onClick={() => onUnarchive(plan._id)}
              className="w-12 h-12 rounded-xl
                         bg-emerald-500/10 border border-emerald-500/30
                         text-emerald-300
                         flex items-center justify-center
                         hover:bg-emerald-500/20 hover:border-emerald-500
                         hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              title="Restore"
            >
              <ArchiveRestore size={16} />
            </button>
          )}

          {/* DELETE */}
          <button
            onClick={() => onDelete(plan._id)}
            className="w-12 h-12 rounded-xl
                       bg-red-500/10 border border-red-500/30
                       text-red-400
                       flex items-center justify-center
                       hover:bg-red-500/20 hover:border-red-500
                       hover:shadow-lg hover:shadow-red-500/20 transition-all"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};


/* -------------------- MAIN PAGE -------------------- */
const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editPlan, setEditPlan] = useState(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/subscriptions/plans");
      setPlans(data.plans);
    } catch (err) {
      console.error("Error loading plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  /* -------- FILTER BY CONTEXT -------- */
  const filteredPlans = plans.filter((p) => {
    if (filter === "all") return true;
    return p.showOnContext?.includes(filter);
  });

  /* -------- SPLIT BY TYPE -------- */
  const subscriptionPlans = filteredPlans.filter(
    (p) => p.type === "subscription"
  );
  const purchasePlans = filteredPlans.filter(
    (p) => p.type === "purchase"
  );

  /* -------- ACTIONS -------- */
  const updatePlan = async (id, data) => {
    await api.put(`/api/v1/subscriptions/plans/${id}`, data);
    loadPlans();
  };

  const archivePlan = async (id) => {
    await api.put(`/api/v1/subscriptions/plans/archiveplan/${id}`);
    loadPlans();
  };

  const unarchivePlan = async (id) => {
    await api.put(`/api/v1/subscriptions/plans/unarchiveplan/${id}`);
    loadPlans();
  };

  const deletePlan = async (id) => {
    if (!confirm("Delete this plan permanently?")) return;
    await api.delete(`/api/v1/subscriptions/plans/deleteplan/${id}`);
    loadPlans();
  };

  if (loading) return <div className="text-white p-10">Loading plans…</div>;

  return (
    <div className="p-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="admin-title">All Plans</h1>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="admin-input pr-12"
          >
            <option value="all">All Plans</option>
            <option value="initial">Initial</option>
            <option value="purchase">Purchase</option>
            <option value="upgrade">Upgrade</option>
          </select>
          <Filter
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* TWO HALVES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* SUBSCRIPTIONS */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">
            Subscription Plans ({subscriptionPlans.length})
          </h2>

          {subscriptionPlans.length === 0 ? (
            <p className="text-gray-400">No subscription plans</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptionPlans.map((p) => (
                <PlanCard
                  key={p._id}
                  plan={p}
                  onEdit={setEditPlan}
                  onArchive={archivePlan}
                  onUnarchive={unarchivePlan}
                  onDelete={deletePlan}
                />
              ))}
            </div>
          )}
        </div>

        {/* PURCHASE */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">
            Purchase Plans ({purchasePlans.length})
          </h2>

          {purchasePlans.length === 0 ? (
            <p className="text-gray-400">No purchase plans</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purchasePlans.map((p) => (
                <PlanCard
                  key={p._id}
                  plan={p}
                  onEdit={setEditPlan}
                  onArchive={archivePlan}
                  onUnarchive={unarchivePlan}
                  onDelete={deletePlan}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      <EditPlanModal
        open={!!editPlan}
        plan={editPlan}
        onClose={() => setEditPlan(null)}
        onSaved={loadPlans}
      />
    </div>
  );
};

export default PlansPage;
