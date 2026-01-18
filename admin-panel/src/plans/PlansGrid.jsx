import { useState } from "react";
import PlanCard from "./PlanCard";
import { preparePlans } from "./plans.utils";

const PlansGrid = ({
  plans = [],
  context = "all", // initial | purchase | all
  onAction,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const preparedPlans = preparePlans(plans, context);

  if (!preparedPlans.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {preparedPlans.map((plan, index) => (
        <PlanCard
          key={plan._id}
          plan={plan}
          active={index === activeIndex}
          onSelect={() => setActiveIndex(index)}
          onAction={onAction}
        />
      ))}
    </div>
  );
};

export default PlansGrid;
