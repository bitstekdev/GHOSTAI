import React from 'react'
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {

    const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-r from-black via-neutral-900 to-black rounded-2xl text-center px-6 py-16 md:py-20 max-w-4xl mx-auto overflow-hidden border border-white/16 mb-16 mt-16">
      {/* Decorative Stars */}
      <span className="absolute top-6 left-8 text-white/20 text-3xl">✦</span>
      <span className="absolute top-6 right-8 text-white/20 text-2xl">✦</span>
      <span className="absolute bottom-6 left-1/4 text-white/20 text-2xl">✦</span>
      <span className="absolute bottom-6 right-12 text-white/20 text-3xl">✦</span>

      {/* Main Content */}
      <h1 className="text-2xl md:text-4xl font-semibold text-white mb-4">
        Your imagination has no limitation.
      </h1>
      <p className="text-lg md:text-xl text-white mb-8">
        Get Started in a journey with our GHOST AI.
      </p>

      {/* Button */}
      <button className="md:inline-flex relative items-center justify-center bg-white text-black font-poppins font-semibold px-6 py-2 rounded-2xl group transition-all duration-300 hover:pr-10 cursor-pointer"
        onClick={() => navigate("/signup")}
      >
         <span className="relative z-10">Create an Account</span>
            <ArrowRight
              className="absolute right-4 w-5 h-5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            />
            <span className="absolute inset-0 rounded-2xl group-hover:pr-10 transition-all duration-300"></span>
      </button>
    </section>
  )
}

export default CTA