// import React, { useState, useEffect } from "react";
// import { ArrowRight } from "lucide-react";
// import "../../styles/Hero.css";
// import logoImg from "../../assets/images/Ghostlogo1.png";
// import { useNavigate } from "react-router-dom";

// const Navbar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <nav
//       className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500
//       ${
//         isScrolled
//           ? "bg-charcoalBlack/80 backdrop-blur-lg py-3 border-b border-polishedPurple/20"
//           : "bg-transparent py-5"
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-4 md:px-16 flex justify-between items-center text-white">

//         {/* LOGO */}
//         <div
//           className="text-2xl font-bold hover:text-purple-400 logoFont cursor-pointer flex items-center"
//           onClick={() => navigate("/")}
//         >
//           <img src={logoImg} alt="Ghostverse.ai Logo" className="h-9 inline" />
//           <span className="ml-[-0.5px]">hostverse.ai</span>
//         </div>

//         {/* DESKTOP MENU + BUTTON */}
//         <div className="hidden md:flex items-center space-x-6 font-poppins">

//           <ul className="flex space-x-8 text-lg">
//             <li>
//               <a href="#home" className="hover:text-purple-400">Home</a>
//             </li>
//             <li>
//               <a href="#about" className="hover:text-purple-400">About Us</a>
//             </li>
//             <li>
//               <a href="#pricing" className="hover:text-purple-400">Pricing</a>
//             </li>
//           </ul>

//           <button
//             className="relative items-center justify-center bg-white text-black font-semibold px-6 py-2 rounded-2xl group transition-all duration-300 hover:pr-10"
//             onClick={() => navigate("/signup")}
//           >
//             <span className="relative z-10">START STORY</span>
//             <span className="absolute inset-0 rounded-2xl group-hover:pr-10 transition-all duration-300" />
//           </button>
//         </div>

//         {/* MOBILE HAMBURGER */}
//         <div
//           className="md:hidden text-3xl cursor-pointer select-none"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           {menuOpen ? "✖" : "☰"}
//         </div>
//       </div>

//       {/* MOBILE DROPDOWN */}
//       {menuOpen && (
//         <div className="absolute top-full right-6 mt-4 w-56 bg-[#1a1a2e] rounded-xl shadow-lg py-6 px-6 flex flex-col space-y-4 z-50 text-white">
//           <a href="#home" onClick={() => setMenuOpen(false)} className="hover:text-purple-300">
//             Home
//           </a>
//           <a href="#about" onClick={() => setMenuOpen(false)} className="hover:text-purple-300">
//             About Us
//           </a>
//           <a href="#pricing" onClick={() => setMenuOpen(false)} className="hover:text-purple-300">
//             Pricing
//           </a>
//           <button
//             className="w-full border border-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
//             onClick={() => navigate("/signup")}
//           >
//             START STORY
//           </button>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

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

  // Close menu when clicking on a link
  const handleNavClick = (href) => {
    setMenuOpen(false);
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500
        ${
          isScrolled
            ? "bg-charcoalBlack/80 backdrop-blur-lg py-2 sm:py-3 border-b border-polishedPurple/20"
            : "bg-transparent py-3 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex justify-between items-center text-white">

          {/* LOGO */}
          <div
            className="text-xl sm:text-2xl font-bold hover:text-purple-400 logoFont cursor-pointer flex items-center transition-colors"
            onClick={() => navigate("/")}
          >
            <img src={logoImg} alt="Ghostverse.ai Logo" className="h-7 sm:h-9 inline" />
            <span className="ml-[-0.5px] hidden xs:inline">hostverse.ai</span>
            <span className="ml-[-0.5px] xs:hidden">host</span>
          </div>

          {/* DESKTOP MENU + BUTTON */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 font-poppins">

            <ul className="flex space-x-6 lg:space-x-8 text-base lg:text-lg">
              <li>
                <a href="#home" className="hover:text-purple-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-purple-400 transition-colors">About Us</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a>
              </li>
            </ul>

            <button
              className="relative flex items-center justify-center bg-white text-black font-semibold px-5 lg:px-6 py-2 rounded-2xl group transition-all duration-300 hover:pr-8 lg:hover:pr-10 min-h-[40px]"
              onClick={() => navigate("/signup")}
            >
              <span className="relative z-10 text-sm lg:text-base">START STORY</span>
              <ArrowRight className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4" />
            </button>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            className="md:hidden text-2xl sm:text-3xl cursor-pointer select-none z-[110] min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✖" : "☰"}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU BACKDROP */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden animate-fadeIn"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && (
        <div className="fixed top-16 sm:top-20 right-4 left-4 sm:right-6 sm:left-auto sm:w-64 bg-charcoalBlack/95 backdrop-blur-xl rounded-2xl shadow-2xl py-6 px-6 flex flex-col space-y-4 z-[100] text-white border border-white/10 animate-slideDown md:hidden">
          <a 
            href="#home" 
            onClick={() => handleNavClick("#home")} 
            className="hover:text-purple-300 transition-colors py-2 text-base min-h-[44px] flex items-center"
          >
            Home
          </a>
          <a 
            href="#about" 
            onClick={() => handleNavClick("#about")} 
            className="hover:text-purple-300 transition-colors py-2 text-base min-h-[44px] flex items-center"
          >
            About Us
          </a>
          <a 
            href="#pricing" 
            onClick={() => handleNavClick("#pricing")} 
            className="hover:text-purple-300 transition-colors py-2 text-base min-h-[44px] flex items-center"
          >
            Pricing
          </a>
          <button
            className="w-full border-2 border-white px-4 py-3 rounded-xl hover:bg-purple-600 hover:border-purple-600 transition-all min-h-[44px] font-semibold"
            onClick={() => {
              setMenuOpen(false);
              navigate("/signup");
            }}
          >
            START STORY
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;