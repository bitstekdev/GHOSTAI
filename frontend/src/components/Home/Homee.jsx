import React from 'react'
import "../../index.css";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Footer from "./Footer";
import Features from "./Features";
import Pricing from "./Pricing";
import CTA from "./CTA";
import About from './About';

const Homee = () => {
  return (
     <div className="min-h-screen bg-black font-sans">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}

export default Homee