import { Check } from "lucide-react";

const PlanSelector = ({ plans, selected, onSelect }) => {
  if (!plans?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isSelected = selected === plan._id;

        return (
          <div
            key={plan._id}
            onClick={() => onSelect(plan._id)}
            className={`relative cursor-pointer rounded-2xl border p-6 transition-all
              ${
                isSelected
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-800 hover:border-gray-600"
              }`}
          >
            {/* Popular badge */}
            {plan.isPopular && (
              <span className="absolute -top-3 right-4 bg-purple-600 text-xs px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            {/* Selected check */}
            {isSelected && (
              <div className="absolute top-4 right-4 bg-purple-600 rounded-full p-1">
                <Check size={14} />
              </div>
            )}

            {/* Badge */}
            <span className="text-xs uppercase tracking-wider text-gray-400">
              {plan.badge}
            </span>

            {/* Name */}
            <h3 className="text-lg font-bold mt-2">
              {plan.name}
            </h3>

            {/* Price */}
            <p className="text-2xl font-bold mt-4">
              ₹{plan.price}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-400 mt-3">
              {plan.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PlanSelector;
