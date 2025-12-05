import React from "react";
import "../../styles/Hero.css"; // Importing styles for the footer
import {  MessageCircle, Send, Phone } from "lucide-react"; // using lucide-react icons
import { FaGoogle,FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa"; // because lucide-react doesn’t have Google logo

const Footer = () => {
  return (
 <footer className="bg-gradient-to-b from-[#1E1E1E] to-black text-gray-400 px-6 md:px-16 py-12">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-20">

        {/* Brand Info */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 logoFont">GHOST.ai</h2>
          <p className="text-sm leading-relaxed">
            From personal tales to ghostwriting, our platform makes storytelling simple for everyone.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm uppercase mb-4 text-gray-500 tracking-wider">Navigation</h3>
          <div>
            <ul className="space-y-2">
              <li>
    <a href="#home" className="hover:text-white cursor-pointer">Home</a>
  </li>
  <li>
    <a href="#about" className="hover:text-white cursor-pointer">About Us</a>
  </li>
  <li>
    <a href="#features" className="hover:text-white cursor-pointer">Features</a>
  </li>
  <li>
    <a href="#pricing" className="hover:text-white cursor-pointer">Pricing</a>
  </li>
            </ul>
          </div>
        </div>

        {/* Contact & Socials */}
        <div>
          <h3 className="text-sm uppercase mb-4 text-gray-500 tracking-wider">Contact Us</h3>
          <p>+91 9999999999</p>
          <p>+91 8888888888</p>
          <p className="mt-2">help@ghost.ai</p>

          {/* Socials */}
          <h3 className="text-sm uppercase mt-6 mb-4 text-gray-500 tracking-wider">Follow Us</h3>
          <div className="flex space-x-4 mb-6">
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white hover:text-black transition">
              <FaFacebookF size={18} />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white hover:text-black transition">
              <FaGoogle size={18} />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white hover:text-black transition">
              <FaInstagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white hover:text-black transition">
              <FaYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Location */}
        <div>
        <div>
          <h3 className="text-sm uppercase mb-4 text-gray-500 tracking-wider">Location</h3>
          <p className="leading-relaxed">
            2972 Hitech City <br />
            Hyderabad, Telangana, India 
          </p>
        </div>
         {/* Chat */}
          <h3 className="text-sm uppercase mb-4 mt-4 text-gray-500 tracking-wider">Let’s Chat</h3>
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white hover:text-black transition">
              <MessageCircle size={18} />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white hover:text-black transition">
              <Send size={18} />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:bg-white hover:text-black transition">
              <Phone size={18} />
            </a>
          </div>
          </div>
      </div>

      {/* Divider */}
      {/* <hr className="my-10 border-gray-700" /> */}

      {/* Bottom Bar */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p>© 2025 — <span className="text-white">GHOST.ai</span>. All rights reserved.</p>
        <p className="mt-2 md:mt-0">
          A <a href="https://bitstek.io/" className="hover:text-white" target="_blank" >BITSTEK</a> product
        </p>
      </div>
    </footer>
  );
};

export default Footer;
