import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import PlansGrid  from "./PlansGrid";

const InitialPlansPage = ({ context = "initial" }) => {
  const { getPlansByContext } = useContext(AppContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlansByContext(context);
        console.log("Fetched plans:", data);
        setPlans(data);
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [context]);

  const handlePlanAction = (plan) => {
    console.log("Selected plan:", plan);
    // 👉 navigate to checkout / payment
  };

  if (loading) return <div>Loading plans...</div>;

  return (
    <>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          Choose Your Plan
        </h1>
        <p className="text-white/60 text-center mb-12">
          Simple pricing. No hidden charges.
        </p>

        <PlansGrid
          plans={plans}
          context={context}
          onAction={handlePlanAction}
        />
      </div>
    </>
  );
};

export default InitialPlansPage;
