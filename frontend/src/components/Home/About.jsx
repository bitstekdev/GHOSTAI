// About.js
import React from "react";
import { FaBookReader, FaInfinity, FaRobot, FaHeart } from "react-icons/fa";
import ABT from "../../assets/images/about.jpg";

export default function About() {
  return (
    <section
      id="about"
      className="relative bg-black text-white py-20 px-6 md:px-20"
    >
      {/* Background Ghost AI effect */}
      {/* <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] bg-cover"></div> */}

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left - Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins relative inline-block text-center mb-12">
            About GHOST AI
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            At <span className="text-white font-semibold">GHOST AI</span>, 
            every story is born through the imagination of our AI — a storyteller that transforms ideas into living worlds. With Ghost AI, stories are not written, they are generated — unique, boundless, and personalized for every dream, every family’s legacy, and every brand with a vision.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            Our AI blends creativity, design, and emotion to craft unforgettable narratives. Every book, every experience, and every memory it generates is more than just words — it’s a universe waiting to be explored. Ghost AI ensures that every tale connects deeply, leaving behind a timeless impression.
          </p>
          <p>Let’s recreate the life which you already lived.</p>

          {/* Features / Highlights */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="flex items-center space-x-3 rounded-4xl p-4 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl">
                <FaBookReader className="text-white text-3xl" />
                <span>AI-Generated Storybooks</span>
            </div>
            <div className="flex items-center space-x-3 rounded-4xl p-4 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl">
                <FaInfinity className="text-white text-3xl" />
                <span>Infinite Story Universes</span>
            </div>
            <div className="flex items-center space-x-3 rounded-4xl p-4 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl">
                <FaRobot className="text-white text-3xl" />
                <span>Smart Storytelling with Ghost AI</span>
            </div>
            <div className="flex items-center space-x-3 rounded-4xl p-4 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl">
                <FaHeart className="text-white text-3xl" />
                <span>Emotion, Creativity & Imagination</span>
            </div>
          </div>
        </div>

        {/* Right - Image / Illustration */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/16">
            <img
              src={ABT}
              alt="About GHOST AI"
              className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
            />
          </div>
          {/* Glowing ghost effect */}
          {/* <div className="absolute -inset-2 rounded-2xl bg-purple-500 opacity-20 blur-2xl"></div> */}
        </div>
      </div>
    </section>
  );
}
