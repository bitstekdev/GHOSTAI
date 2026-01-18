import { useState } from "react";
import PlanCard from "./PlanCard";

const PlansGrid = ({ plans = [], onAction }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!plans.length) return null;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            active={index === activeIndex}
            onSelect={() => setActiveIndex(index)}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
};

export default PlansGrid;