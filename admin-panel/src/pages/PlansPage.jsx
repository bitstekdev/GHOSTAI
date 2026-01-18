
// import { useEffect, useState } from "react";
// import { fetchPlansByContext } from "../services/subscription.api";
// import PlansGrid from "../plans/PlansGrid";
// import { Filter } from "lucide-react";

// const PlansPage = () => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all"); // all | initial | purchase

//   useEffect(() => {
//     Promise.all([
//       fetchPlansByContext("initial"),
//       fetchPlansByContext("purchase"),
//     ])
//       .then(([initial, purchase]) => {
//         const merged = [...initial, ...purchase].reduce((acc, p) => {
//           acc[p._id] = p;
//           return acc;
//         }, {});
//         setPlans(Object.values(merged));
//       })
//       .finally(() => setLoading(false));
//   }, []);

//     const filteredPlans = plans.filter((p) => {
//       if (filter === "all") return true;
//       return p.showOnContext?.includes(filter);
//     });
      

//   if (loading) return <div className="text-white p-10">Loading plans…</div>;

//   return (
//     <div className="p-10">
//       <div className="flex items-center justify-between mb-10">
//         <h1 className="text-4xl font-serif text-white">Choose Your Plan</h1>

//         {/* Filter Dropdown */}
//         <div className="relative">
//           <select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 pr-10 appearance-none focus:outline-none"
//           >
//             <option value="all">All Plans</option>
//             <option value="initial">Initial Plans</option>
//             <option value="purchase">Purchase Plans</option>
//           </select>

//           <Filter
//             size={18}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//           />
//         </div>
//       </div>

//       <PlansGrid
//         plans={filteredPlans}
//         context={filter === "all" ? "purchase" : filter}
//         onAction={(plan) => console.log("Selected plan:", plan)}
//       />
//     </div>
//   );
// };

// export default PlansPage;

import { useEffect, useState } from "react";
import { Filter, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import api from "../services/axiosInstance";
import EditPlanModal from "../components/EditPlanModal";

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

  const filteredPlans = plans.filter((p) => {
    if (filter === "all") return true;
    return p.showOnContext?.includes(filter);
  });

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
      <div className="flex items-center justify-between mb-10">
        <h1 className="admin-title">Admin Plans</h1>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="admin-input pr-12"
          >
            <option value="all">All Plans</option>
            <option value="initial">Initial</option>
            <option value="purchase">Purchase</option>
            <option value="generate">Generate</option>
            <option value="upgrade">Upgrade</option>
          </select>
          <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlans.map((p) => (
          <div
            key={p._id}
            className="relative group bg-gradient-to-br from-[#0b0f13] to-[#020617] 
                       border border-white/10 rounded-2xl p-8 shadow-2xl 
                       hover:border-purple-500/40 transition-all duration-300
                       hover:shadow-purple-500/20"
          >
            <div className="absolute inset-0 rounded-2xl bg-polishedPurple/5 blur-2xl opacity-0 group-hover:opacity-100 transition" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold magic-shine mb-2">{p.name}</h2>
              <p className="text-polishedPurple text-4xl font-extrabold mb-6">₹{p.price}</p>

              <div className="text-white/80 space-y-2 mb-6">
                {p.limits?.maxPages !== undefined && <p>• {p.limits.maxPages} Pages</p>}
                {p.limits?.maxBooks !== undefined && <p>• {p.limits.maxBooks} Books</p>}
                {p.limits?.faceSwaps !== undefined && <p>• {p.limits.faceSwaps} Face Swaps</p>}
                {p.limits?.regenerations !== undefined && <p>• {p.limits.regenerations} Regenerations</p>}
                {p.limits?.edits !== undefined && <p>• {p.limits.edits} Edits</p>}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setEditPlan(p)}
                  className="w-12 h-12 rounded-xl bg-polishedPurple/20 border border-polishedPurple/40 flex items-center justify-center hover:bg-polishedPurple hover:text-white transition"
                  title="Edit Plan"
                >
                  <Pencil size={16} />
                </button>

                {!p.isArchived ? (
                  <button
                    onClick={() => archivePlan(p._id)}
                    className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition"
                    title="Archive"
                  >
                    <Archive size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => unarchivePlan(p._id)}
                    className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-400/40 flex items-center justify-center hover:bg-green-500 hover:text-black transition"
                    title="Unarchive"
                  >
                    <ArchiveRestore size={16} />
                  </button>
                )}

                <button
                  onClick={() => deletePlan(p._id)}
                  className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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