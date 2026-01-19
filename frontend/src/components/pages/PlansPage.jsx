import { useEffect, useState } from "react";
import { fetchPlansByContext } from "../../services/subscription.api";
import PlansGrid from "../plans/PlansGrid";

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-white p-10">Loading plans…</div>;

  return (
    <div className="p-10">
      <h1 className="text-4xl font-serif text-white mb-10">
        Choose Your Plan
      </h1>

      <PlansGrid
        plans={plans}
        context="purchase"
        onAction={(plan) => {
          console.log("Selected plan:", plan);
          // NEXT: create order here
        }}
      />
    </div>
  );
};

export default PlansPage;
