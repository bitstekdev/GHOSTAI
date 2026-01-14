import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import "../../styles/Hero.css";
import logoImg from "../../assets/images/Ghostlogo1.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500
      ${
        isScrolled
          ? "bg-charcoalBlack/80 backdrop-blur-lg py-3 border-b border-polishedPurple/20"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-16 flex justify-between items-center text-white">

        {/* LOGO */}
        <div
          className="text-2xl font-bold hover:text-purple-400 logoFont cursor-pointer flex items-center"
          onClick={() => navigate("/")}
        >
          <img src={logoImg} alt="Ghostverse.ai Logo" className="h-9 inline" />
          <span className="ml-[-0.5px]">hostverse.ai</span>
        </div>

        {/* DESKTOP MENU + BUTTON */}
        <div className="hidden md:flex items-center space-x-6 font-poppins">

          <ul className="flex space-x-8 text-lg">
            <li>
              <a href="#home" className="hover:text-purple-400">Home</a>
            </li>
            <li>
              <a href="#about" className="hover:text-purple-400">About Us</a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-purple-400">Pricing</a>
            </li>
          </ul>

          <button
            className="relative items-center justify-center bg-white text-black font-semibold px-6 py-2 rounded-2xl group transition-all duration-300 hover:pr-10"
            onClick={() => navigate("/signup")}
          >
            <span className="relative z-10">START STORY</span>
            <span className="absolute inset-0 rounded-2xl group-hover:pr-10 transition-all duration-300" />
          </button>
        </div>

        {/* MOBILE HAMBURGER */}
        <div
          className="md:hidden text-3xl cursor-pointer select-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div className="absolute top-full right-6 mt-4 w-56 bg-[#1a1a2e] rounded-xl shadow-lg py-6 px-6 flex flex-col space-y-4 z-50 text-white">
          <a href="#home" onClick={() => setMenuOpen(false)} className="hover:text-purple-300">
            Home
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)} className="hover:text-purple-300">
            About Us
          </a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="hover:text-purple-300">
            Pricing
          </a>
          <button
            className="w-full border border-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
            onClick={() => navigate("/signup")}
          >
            START STORY
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
