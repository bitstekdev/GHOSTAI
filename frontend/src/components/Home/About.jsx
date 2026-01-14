import React from "react";

export default function About() {
  return (
    <section
      id="about"
      className="bg-charcoalBlack overflow-hidden perspective-container py-32 md:py-48"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-20 md:gap-32 items-center">

        {/* LEFT — Image / 3D Book */}
        <div className="order-2 md:order-1 relative reveal-hidden">
          
          {/* Main 3D Image */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] group border border-white/10 aspect-[4/3] transform transition-all duration-1000 hover:rotate-y-12 hover:scale-[1.02] bg-polishedPurple/5">
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop"
              alt="A vintage library atmosphere"
              className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-polishedPurple/10 mix-blend-color pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-charcoalBlack/10 via-transparent to-transparent" />
          </div>

          {/* Floating Quote Card */}
          <div className="absolute -top-10 -right-4 md:-right-10 p-6 md:p-8 bg-charcoalBlack/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-3d-float z-30 max-w-[220px] pointer-events-none">
            <p className="font-serif text-lg italic text-white leading-snug">
              "Every book is a universe waiting to be lived."
            </p>
          </div>

          {/* Ambient Glow */}
          <div className="absolute -bottom-20 -right-20 bg-polishedPurple w-80 h-80 opacity-10 rounded-full blur-[120px]" />
        </div>

        {/* RIGHT — Text */}
        <div
          className="order-1 md:order-2 space-y-8 md:space-y-12 reveal-hidden"
          style={{ transitionDelay: "300ms" }}
        >
          <div className="inline-block px-6 py-2 bg-polishedPurple/10 text-polishedPurple text-xs font-bold tracking-[0.3em] uppercase rounded-full border border-polishedPurple/20">
            The Studio
          </div>

          <h2 className="font-serif text-5xl md:text-8xl text-ghostWhite leading-tight font-medium tracking-tight">
            Ghost is a <br />
            <span className="italic magic-shine">storyteller.</span>
          </h2>

          <div className="space-y-8 md:space-y-10 text-xl md:text-2xl text-ghostWhite/50 leading-relaxed font-light">
            <p>
              Ghost blends imagination, emotion, and technology to create stories
              that feel deeply personal. Every book is unique.
            </p>

            <p className="font-serif italic text-ghostWhite/80 text-2xl md:text-3xl border-l-4 border-polishedPurple pl-8 md:pl-10 leading-relaxed">
              "We believe stories should feel like they belong to you, not a
              machine."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// // About.js
// import React from "react";
// import { FaBookReader, FaInfinity, FaRobot, FaHeart } from "react-icons/fa";
// import ABT from "../../assets/images/about.jpg";

// export default function About() {
//   return (
//     <section
//       id="about"
//       className="relative bg-black text-white py-20 px-6 md:px-20"
//     >
//       {/* Background Ghost AI effect */}
//       {/* <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] bg-cover"></div> */}

//       <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
//         {/* Left - Content */}
//         <div>
//           <h2 className="text-3xl md:text-4xl font-bold font-poppins relative inline-block text-center mb-12">
//             About GHOST AI
//           </h2>
//           <p className="text-lg text-gray-300 leading-relaxed mb-6">
//             At <span className="text-white font-semibold">GHOST AI</span>, 
//             every story is born through the imagination of our AI — a storyteller that transforms ideas into living worlds. With Ghost AI, stories are not written, they are generated — unique, boundless, and personalized for every dream, every family’s legacy, and every brand with a vision.
//           </p>
//           <p className="text-lg text-gray-300 leading-relaxed mb-6">
//             Our AI blends creativity, design, and emotion to craft unforgettable narratives. Every book, every experience, and every memory it generates is more than just words — it’s a universe waiting to be explored. Ghost AI ensures that every tale connects deeply, leaving behind a timeless impression.
//           </p>
//           <p>Let’s recreate the life which you already lived.</p>

//           {/* Features / Highlights */}
//           <div className="grid grid-cols-2 gap-6 mt-8">
//             <div className="flex items-center space-x-3 rounded-4xl p-4 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl">
//                 <FaBookReader className="text-white text-3xl" />
//                 <span>AI-Generated Storybooks</span>
//             </div>
//             <div className="flex items-center space-x-3 rounded-4xl p-4 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl">
//                 <FaInfinity className="text-white text-3xl" />
//                 <span>Infinite Story Universes</span>
//             </div>
//             <div className="flex items-center space-x-3 rounded-4xl p-4 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl">
//                 <FaRobot className="text-white text-3xl" />
//                 <span>Smart Storytelling with Ghost AI</span>
//             </div>
//             <div className="flex items-center space-x-3 rounded-4xl p-4 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl">
//                 <FaHeart className="text-white text-3xl" />
//                 <span>Emotion, Creativity & Imagination</span>
//             </div>
//           </div>
//         </div>

//         {/* Right - Image / Illustration */}
//         <div className="relative">
//           <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/16">
//             <img
//               src={ABT}
//               alt="About GHOST AI"
//               className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
//             />
//           </div>
//           {/* Glowing ghost effect */}
//           {/* <div className="absolute -inset-2 rounded-2xl bg-purple-500 opacity-20 blur-2xl"></div> */}
//         </div>
//       </div>
//     </section>
//   );
// }

// import React from "react";

// export default function About() {
//   return (
//     <section
//       id="about"
//       className="relative bg-gray-900 text-white py-32 md:py-48 overflow-hidden"
//     >
//       <div className="relative max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-20 md:gap-32 items-center">
        
//         {/* LEFT — Content */}
//         <div className="order-1 space-y-8 md:space-y-10">
//           <div className="inline-block px-6 py-2 bg-purple-500/10 text-purple-400 text-xs font-bold tracking-widest uppercase rounded-full border border-purple-500/20">
//             About GhostVERse.AI
//           </div>

//           <h2 className="font-serif text-5xl md:text-7xl text-white leading-tight font-medium tracking-tight">
//             Ghost is a <br/>
//             <span className="italic bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//               storyteller.
//             </span>
//           </h2>
          
//           <div className="space-y-8 md:space-y-10 text-xl md:text-2xl text-gray-400 leading-relaxed font-light">
//             <p>
//               Ghost blends imagination, emotion, and technology to create stories that feel deeply personal. Every book is unique.
//             </p>
//             <p className="font-serif italic text-gray-300 text-2xl md:text-3xl border-l-4 border-purple-500 pl-8 md:pl-10 leading-relaxed">
//               "We believe stories should feel like they belong to you, not a machine."
//             </p>
//           </div>
//         </div>

//         {/* RIGHT — 3D Book Visual */}
//         <div className="order-2 relative">
//           {/* Main 3D Image */}
//           <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-white/10 aspect-[4/3] transition-all duration-700 hover:scale-105 bg-purple-500/5">
//             <img
//               src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop"
//               alt="A vintage library atmosphere"
//               className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 opacity-60 group-hover:opacity-100"
//               onError={(e) => {
//                 e.currentTarget.src = "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop";
//               }}
//             />
//             <div className="absolute inset-0 bg-purple-500/10 mix-blend-color pointer-events-none"></div>
//             <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/90 via-transparent to-transparent"></div>
//           </div>

//           {/* Floating Quote Card */}
//           <div className="absolute -top-10 -right-6 md:-right-10 p-6 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-30 max-w-[220px] animate-float">
//             <p className="font-serif text-lg italic text-purple-400 leading-snug">
//               "Every book is a universe waiting to be lived."
//             </p>
//           </div>

//           {/* Ambient Glow */}
//           <div className="absolute -bottom-24 -right-24 bg-purple-500 w-96 h-96 opacity-10 rounded-full blur-3xl" />
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-20px); }
//         }
//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }
//       `}</style>
//     </section>
//   );
// }

