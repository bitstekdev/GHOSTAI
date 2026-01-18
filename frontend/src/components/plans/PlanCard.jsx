import { Check, ArrowRight } from "lucide-react";

const LIMIT_LABELS = {
  maxPages: "Pages",
  maxBooks: "Books",
  faceSwaps: "Face swaps",
  regenerations: "Regenerations",
  edits: "Edits",
  erases: "Erases",
};

const PlanCard = ({ plan, active, onSelect, onAction }) => {
  const limits = plan.limits || {};

  return (
    <div
      onMouseEnter={onSelect}
      onClick={onSelect}
      className={`
        relative rounded-2xl p-8 cursor-pointer transition-all duration-300
        backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5
        border border-white/10
        ${active ? "ring-2 ring-purple-500 shadow-xl" : "hover:border-white/20"}
      `}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 right-6 bg-purple-600 text-white text-xs px-4 py-1 rounded-full font-semibold">
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
        {plan.description && (
          <p className="text-white/60 text-sm mt-1">{plan.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-white">
            ₹{plan.price}
          </span>
          <span className="text-white/60 text-sm">
            / {plan.validityDays} days
          </span>
        </div>
      </div>

      {/* Limits */}
      <ul className="space-y-3 mb-8">
        {Object.entries(limits)
          .filter(([, value]) => value > 0)
          .map(([key, value]) => (
            <li
              key={key}
              className="flex items-center gap-3 text-white/80 text-sm"
            >
              <Check className="w-4 h-4 text-purple-400" />
              {value} {LIMIT_LABELS[key] || key}
            </li>
          ))}
      </ul>

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction?.(plan);
        }}
        className={`
          w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2
          transition-all
          ${
            active
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }
        `}
      >
        Choose Plan <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PlanCard;
