import React, { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(1);

  const plans = [
    {
      name: "Digital Storybook",
      price: "₹999",
      features: [
        "Personalized digital copy",
        "High-resolution illustrations",
        "Lifetime digital access",
        "Shareable link for family",
      ],
    },
    {
      name: "Printed Premium",
      price: "₹4,999",
      features: [
        "Hand-bound physical book",
        "Premium parchment paper",
        "Foil-stamped cover",
        "Includes digital copy",
        "Gift-wrapped packaging",
      ],
      featured: true,
    },
    {
      name: "Monthly Stories",
      price: "₹299",
      features: [
        "New story every month",
        "Track milestones in real-time",
        "Subscription-only themes",
        "Discounted print editions",
      ],
    },
  ];

  return (
    <section
      id="pricing"
      className="py-32 md:py-48 bg-charcoalBlack text-white border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-24 space-y-6 reveal-hidden" style={{ transitionDelay: "100ms" }}>
          <h2 className="font-serif text-5xl md:text-7xl text-white">
            Gifts of Memory
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-xl italic">
            Investment in the stories that truly matter.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {plans.map((plan, index) => {
            const isActive = activeIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className={` relative p-10 rounded-[3rem] border transition-all duration-700 cursor-pointer ${
                  isActive
                    ? "bg-polishedPurple border-polishedPurple scale-105 shadow-[0_30px_70px_rgba(147,51,234,0.35)]"
                    : "bg-white/5 border-white/10 hover:scale-[1.02]"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Badge */}
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase">
                    Most Treasured
                  </div>
                )}

                {/* Name */}
                <h3
                  className={`font-serif text-3xl mb-6 ${
                    isActive ? "text-white" : "text-purple-400"
                  }`}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <div
                  className={`text-5xl font-serif mb-10 ${
                    isActive ? "text-white" : "text-white/80"
                  }`}
                >
                  {plan.price}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className={`flex gap-3 ${
                        isActive ? "text-white" : "text-white/70"
                      }`}
                    >
                      <Check
                        className={`w-5 h-5 mt-1 ${
                          isActive ? "text-white" : "text-purple-400"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/signup");
                  }}
                  className={`w-full py-5 rounded-full font-serif text-xl flex justify-center gap-3 transition-all ${
                    isActive
                      ? "bg-white text-black hover:bg-white hover:text-black"
                      : "bg-polishedPurple text-white hover:bg-white hover:text-black"
                  }`}
                >
                  Choose This
                  <ArrowRight />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
