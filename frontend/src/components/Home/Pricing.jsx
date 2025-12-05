import React from 'react'
import { ArrowRight , CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {

     const navigate = useNavigate();

   const plans = [
    {
      name: "Basic",
      price: "$0",
      features: [
        "20+ AI Document Templates",
        "Regular Support Business",
        "10 Images per month",
        "Live Chat Support",
      ],
      
    },
    {
      name: "Premium",
      price: "$9.99",
      features: [
        "20+ AI Document Templates",
        "Regular Support Business",
        "10 Images per month",
        "Live Chat Support",
        "1 Speech to Text per month",
      ],
    
    },
    {
      name: "Enterprise",
      price: "$99.9",
      features: [
        "20+ AI Document Templates",
        "Regular Support Business",
        "10 Images per month",
        "Live Chat Support",
        "1 Speech to Text per month",
      ],
     
    },
  ];

  return (
   <section id='pricing' className="text-center bg-black text-white px-6 md:px-16 py-16">
   <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-poppins relative inline-block">
            Pricing Plans
          {/* <span className="absolute left-0 -bottom-2 w-full h-1 bg-gradient-to-r from-white to gray rounded-full"></span> */}
        </h2>
        <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
        Explore innovative features designed to inspire creativity and enhance your storytelling experience.
        </p>
      </div>

  <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto px-6">
    {plans.map((plan, index) => (
      <div
        key={index}
        className="border border-white/16 rounded-xl p-8 text-left flex flex-col justify-between transition transform hover:-translate-y-2 hover:shadow-xl bg-[#0D0D0D]"
      >
        {/* Top content */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">{plan.name}</h3>

          <ul className="space-y-3 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Button fixed at bottom */}
        <div className="mt-8 flex flex-col items-center">
            <div className="text-3xl font-bold mb-6">{plan.price}</div>
          <button className="md:inline-flex relative items-center justify-center bg-white text-black font-poppins font-semibold px-6 py-2 rounded-2xl group transition-all duration-300 hover:pr-10 cursor-pointer"
          onClick={() => navigate("/signup")}>
            <span className="relative z-10">Get Started</span>
            <ArrowRight
              className="absolute right-4 w-5 h-5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            />
            <span className="absolute inset-0 rounded-2xl group-hover:pr-10 transition-all duration-300"></span>
          </button>
        </div>
      </div>
    ))}
  </div>
</section>

  );
};


export default Pricing