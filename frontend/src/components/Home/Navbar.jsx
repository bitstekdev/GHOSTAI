import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import "../../styles/Hero.css";
import logoImg from "../../assets/images/logo.gif"; 
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate()
  

  return (
    <nav className="w-full px-4 py-2 md:px-16  flex justify-between items-center text-white bg-transparent relative">
      {/* Logo */}
      <div className="text-2xl font-bold text-white-400 hover:text-purple-400 logoFont cursor-pointer ">
        <img src={logoImg} alt="GHOST.ai Logo" className="h-15 inline" />
        <span className="ml-[-12px]">
        GHOST.ai
        </span>
      </div>

   <div className="flex items-center space-x-6 font-poppins">

      {/* Desktop Menu */}

      <ul className="hidden md:flex space-x-8 text-lg">
  <li>
    <a href="#home" className="hover:text-purple-400 cursor-pointer">Home</a>
  </li>
  <li>
    <a href="#about" className="hover:text-purple-400 cursor-pointer">About Us</a>
  </li>
  <li>
    <a href="#features" className="hover:text-purple-400 cursor-pointer">Features</a>
  </li>
  <li>
    <a href="#pricing" className="hover:text-purple-400 cursor-pointer">Pricing</a>
  </li>
</ul>

      {/* Desktop Sign Up Button */}
       <button
      className="hidden md:inline-flex relative items-center justify-center bg-white text-black font-poppins font-semibold px-6 py-2 rounded-2xl group transition-all duration-300 hover:pr-10 cursor-pointer"
      onClick={() => navigate("/signup")}
    >
      {/* Text */}
      <span className="relative z-10">Sign Up</span>

      {/* Arrow */}
      <ArrowRight
        className="absolute right-4 w-5 h-5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
      />

      {/* Invisible spacer that grows on hover */}
      <span className="absolute inset-0 rounded-2xl group-hover:pr-10 transition-all duration-300"></span>
    </button>

   </div>

      {/* Mobile Hamburger Icon */}
      <div
        className="md:hidden text-3xl cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✖" : "☰"}
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-16 right-6 w-56 bg-[#1a1a2e] rounded-xl shadow-lg py-6 px-6 flex flex-col space-y-4 z-50">
          <a href="#home" className="hover:text-purple-300">Home</a>
          <a href="#about" className="hover:text-purple-300">About Us</a>
          <a href="#features" className="hover:text-purple-300">Features</a>
          <a href="#pricing" className="hover:text-purple-300">Pricing</a>
          <button className="w-full border border-white px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition"
          onClick={() => navigate("/signup")}>
            Sign up
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
