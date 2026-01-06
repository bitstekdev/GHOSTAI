import React from "react";
import {
  MessageCircle,
  Send,
  Phone,
  ArrowRight,
} from "lucide-react";
import {
  FaGoogle,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import SignUp from "./SignUp";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <footer className="relative bg-charcoalBlack text-ghostWhite/40 py-32 border-t border-ghostWhite/5 overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-polishedPurple/5 rounded-full blur-[140px]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-24 mb-32">

          {/* BRAND */}
          <div className="space-y-8">
            <h2 className="font-serif text-4xl text-ghostWhite">
              Ghostverse.ai
            </h2>
           <p className="text-2xl italic leading-relaxed max-w-lg font-light">
              One day, your child will ask, <br />
              <span className="text-ghostWhite font-medium">“Tell me a story about when I was little.”</span> <br />
              Ghost helps you answer — beautifully.
            </p>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.35em] text-ghostWhite mb-8 font-bold">
              Navigation
            </h3>
            <ul className="space-y-5 text-lg font-light">
              <li>
                <a href="#home" className="hover:text-polishedPurple transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-polishedPurple transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-polishedPurple transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.35em] text-ghostWhite mb-8 font-bold">
              Contact
            </h3>
            <div className="space-y-4 text-lg font-light">
              <p>+91 99999 99999</p>
              <p>+91 88888 88888</p>
              <p className="text-ghostWhite/60">help@ghost.ai</p>
            </div>

            {/* CHAT ICONS */}
            <div className="flex gap-4 mt-8">
              {[MessageCircle, Send, Phone].map((Icon, i) => (
                <span
                  key={i}
                  className="w-11 h-11 rounded-full border border-ghostWhite/20 flex items-center justify-center hover:bg-polishedPurple hover:text-ghostWhite hover:border-polishedPurple transition-all cursor-pointer"
                >
                  <Icon size={18} />
                </span>
              ))}
            </div>
          </div>

          {/* LOCATION & SOCIAL */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.35em] text-ghostWhite mb-8 font-bold">
              Location
            </h3>
            <p className="text-lg font-light leading-relaxed mb-10">
              2972 Hitech City <br />
              Hyderabad, Telangana <br />
              India
            </p>

            <h3 className="text-xs uppercase tracking-[0.35em] text-ghostWhite mb-6 font-bold">
              Follow
            </h3>
            <div className="flex gap-4">
              {[FaFacebookF, FaGoogle, FaInstagram, FaYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-11 h-11 rounded-full border border-ghostWhite/20 flex items-center justify-center hover:bg-ghostWhite hover:text-charcoalBlack transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-16 border-t border-ghostWhite/5 flex flex-col md:flex-row justify-between items-center gap-10 text-xs uppercase tracking-[0.4em]">
          <p>© 2025 — GHOSTVERSE.AI</p>
          <p>
            A <span className="text-ghostWhite/60">BITSTEK</span> Product
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
