import React from "react";
import "../../styles/Hero.css"; 
import Img from "../../assets/images/Hero.jpg"; // Importing hero image
import { FaGhost } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Hero = () => {

  const navigate = useNavigate();

  return (
    <section id="home" className="flex flex-col items-center text-center px-6 md:px-16 py-16 text-white bg-gradient-to-b from-black via-[#1E1E1E] to-[#000000]">

       <FaGhost className="absolute top-32 left-16 text-white/20 text-3xl animate-bounce" />
      <FaGhost className="absolute top-32 right-16 text-white/20 text-2xl animate-bounce" />
      <FaGhost className="absolute bottom-64 left-64 text-white/20 text-2xl animate-bounce" />
      <FaGhost className="absolute bottom-64 right-64 text-white/20 text-3xl animate-bounce" />
      <FaGhost className="absolute bottom-6 left-12 text-white/20 text-2xl animate-bounce" />
      <FaGhost className="absolute bottom-6 right-12 text-white/20 text-3xl animate-bounce" />
      

      {/* Heading */}
      <h1 className="text-4xl md:text-6xl font-bold leading-tight mozrilla">
        Your Life. Your Story. Reimagined with<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
           GHOST.IO
        </span>
      </h1>

      {/* Subtext */}
      <p className="mt-6 text-gray-300 max-w-2xl text-sm md:text-base">
        Share your story here and watch it unfold into a book more magical, more vivid, and more you than you ever dreamed.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:opacity-80 transition cursor-pointer"
         onClick={() => navigate("/signup")}>
          Get Started
        </button>
        <button className="border border-white px-6 py-3 rounded-lg font-medium text-white hover:bg-white text-black hover:text-black transition cursor-pointer">
          Watch Demo
        </button>
      </div>

      {/* Hero Image with Floating Cards */}
      <div className="mt-12 relative max-w-xl w-full ">
        <img
          src={Img}
          alt="AI handshake"
          className="rounded-xl border border-white/16 shadow-lg w-full"
        />

        {/* Floating Badge Left */}
        <div className="absolute top-4 -left-20 bg-[#1a1a2e] px-4 py-2 rounded-xl shadow-lg text-sm hidden sm:block">
          <p className="text-gray-300">Generate story</p>
          <div className="flex space-x-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400"></div>
          </div>
        </div>

        {/* Floating Badge Right */}
        <div className="absolute bottom-4 -right-20 bg-[#1a1a2e] px-4 py-2 rounded-xl shadow-lg text-sm hidden sm:block">
          <p className="font-semibold">Story Hub</p>
          <p className="text-gray-400 text-xs">
            Join the community and add <br/> colors to your stories.
          </p>
          {/* <p className="text-purple-300 text-xs mt-2">More 20k+ users</p> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
