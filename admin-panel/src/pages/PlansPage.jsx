// import { useEffect, useState } from "react";
// import { fetchPlansByContext } from "../services/subscription.api";
// import PlansGrid from "../plans/PlansGrid";

// const PlansPage = () => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);

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

//   if (loading) return <div className="text-white p-10">Loading plans…</div>;

//   return (
//     <div className="p-10">
//       <h1 className="text-4xl font-serif text-white mb-10">
//         Choose Your Plan
//       </h1>

//       <PlansGrid
//         plans={plans}
//         context="purchase"
//         onAction={(plan) => {
//           console.log("Selected plan:", plan);}}
//       />
//     </div>
//   );
// };

// export default PlansPage;

import { useEffect, useState } from "react";
import { fetchPlansByContext } from "../services/subscription.api";
import PlansGrid from "../plans/PlansGrid";
import { Filter } from "lucide-react";

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | initial | purchase

  useEffect(() => {
    Promise.all([
      fetchPlansByContext("initial"),
      fetchPlansByContext("purchase"),
    ])
      .then(([initial, purchase]) => {
        const merged = [...initial, ...purchase].reduce((acc, p) => {
          acc[p._id] = p;
          return acc;
        }, {});
        setPlans(Object.values(merged));
      })
      .finally(() => setLoading(false));
  }, []);

    const filteredPlans = plans.filter((p) => {
      if (filter === "all") return true;
      return p.showOnContext?.includes(filter);
    });
      

  if (loading) return <div className="text-white p-10">Loading plans…</div>;

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-serif text-white">Choose Your Plan</h1>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 pr-10 appearance-none focus:outline-none"
          >
            <option value="all">All Plans</option>
            <option value="initial">Initial Plans</option>
            <option value="purchase">Purchase Plans</option>
          </select>

          <Filter
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      <PlansGrid
        plans={filteredPlans}
        context={filter === "all" ? "purchase" : filter}
        onAction={(plan) => console.log("Selected plan:", plan)}
      />
    </div>
  );
};

export default PlansPage;
