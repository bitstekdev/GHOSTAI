import { Check, ArrowRight } from "lucide-react";

const PlanCard = ({ plan, active, onSelect, onAction }) => {
  return (
    <div
      onMouseEnter={onSelect}
      onClick={onSelect}
      className={`relative p-6 sm:p-8 md:p-10 rounded-3xl min-h-[560px] border transition-all duration-500 cursor-pointer
        ${
          active
            ? "bg-polishedPurple border-polishedPurple scale-105 shadow-[0_30px_70px_rgba(147,51,234,0.35)]"
            : "bg-white/5 border-white/10 hover:scale-[1.02]"
        }`}
    >
      {/* Badge */}
      {(plan.isPopular || plan.badge) && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase">
          {plan.badge || "Popular"}
        </div>
      )}

      {/* Plan Name */}
      <h3 className="font-serif text-2xl sm:text-3xl mb-4 text-white">
        {plan.name}
      </h3>

      {/* Price */}
      <div className="text-3xl sm:text-4xl font-serif mb-2 text-white">
        {plan.price === 0 ? "Free" : `₹${plan.price}`}
      </div>

      {/* Validity */}
      {plan.validityDays && plan.price > 0 && (
        <p className="text-sm text-white/60 mb-4">
          Valid for {plan.validityDays} days
        </p>
      )}

      {/* Description */}
      <p className="text-white/60 mb-6">{plan.description}</p>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex gap-3 text-white/80">
            <Check className="w-4 h-4 mt-1 text-purple-400 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction?.(plan);
        }}
        className={`w-full py-4 rounded-full font-serif text-lg flex justify-center items-center gap-3 transition-all
          ${
            active
              ? "bg-white text-black"
              : "bg-polishedPurple text-white hover:bg-white hover:text-black"
          }`}
      >
        Choose Plan <ArrowRight />
      </button>
    </div>
  );
};

export default PlanCard;
