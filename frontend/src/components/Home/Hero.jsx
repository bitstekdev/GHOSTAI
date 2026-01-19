// import React from "react";
// import { Sparkles, ArrowRight, Play } from "lucide-react";
// import { FaGhost } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const Hero = () => {
//   const navigate = useNavigate();

//   return (
//     <section
//       id="home"
//       className="relative min-h-screen flex items-center justify-center overflow-hidden !pt-40 !pb-20 perspective-container bg-gradient-to-b from-black via-[#1E1E1E] to-black text-white"
//     >
//       {/* Background Atmosphere */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-2/4 -left-32 w-[850px] h-[850px] bg-polishedPurple/10 rounded-full blur-[180px] animate-pulse-slow" />
//         <div className="absolute bottom-1/4 -right-32 w-[850px] h-[850px] bg-polishedPurple/5 rounded-full blur-[180px]" />
//       </div>

//       {/* Floating Ghosts */}
//       <FaGhost className="absolute top-32 left-16 text-white/20 text-3xl animate-bounce" />
//       <FaGhost className="absolute top-32 right-16 text-white/20 text-2xl animate-bounce" />
//       <FaGhost className="absolute bottom-20 left-32 text-white/20 text-2xl animate-bounce" />
//       <FaGhost className="absolute bottom-20 right-32 text-white/20 text-3xl animate-bounce" />

//       <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        
//         {/* LEFT — Text */}
//         <div className="space-y-6 reveal-hidden">
//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-polishedPurple/10 border border-polishedPurple/20 text-polishedPurple text-xs font-bold tracking-widest uppercase">
//             <Sparkles className="w-4 h-4" />
//             Every memory is a story
//           </div>

//           <h1 className="font-serif text-4xl md:text-8xl leading-[1.05] font-bold tracking-tighter">
//             Some lives deserve <br />
//             <span className="italic magic-shine">to be remembered</span> <br />
//             as stories.
//           </h1>

//           <p className="text-2xl text-white/50 max-w-xl leading-relaxed font-light">
//             Turn your life, your child, or your memories into a beautiful,
//             personalized storybook — created just for you.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-6 pt-4">
//             <button
//               onClick={() => navigate("/signup")}
//               className="bg-polishedPurple text-grey px-10 py-6 rounded-full font-serif text-xl hover:bg-white hover:text-black transition-all duration-700 shadow-[0_0_50px_rgba(147,51,234,0.35)] group flex items-center gap-3"
//             >
//               Create Your Book
//               <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//             </button>

//             <button className="group flex items-center gap-4 text-white/70 hover:text-white transition-all px-8 py-6">
//               <span className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-polishedPurple group-hover:border-polishedPurple transition-all">
//                 <Play className="w-5 h-5 fill-current" />
//               </span>
//               <span className="font-serif text-xm">Watch Demo</span>
//             </button>
//           </div>
//         </div>

//         {/* RIGHT — 3D Book */}
//         <div className="relative reveal-hidden reveal-delay-400">
//           <div className="relative z-20 transform rotate-y-12 rotate-x-6 animate-3d-float group">
//             <div className="absolute inset-0 bg-polishedPurple/20 blur-[120px] group-hover:bg-polishedPurple/40 transition-all" />

//             <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.7)] aspect-[4/5] bg-black">
//               <img
//                 src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1200&auto=format&fit=crop"
//                 alt="Emotional storytelling"
//                 className="w-full h-full object-cover grayscale-[0.25] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
//               <div className="absolute bottom-12 left-10 right-10">
//                 <p className="font-serif italic text-3xl text-white leading-snug">
//                   “One day, your child will ask for a story about themselves…”
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Floating Secondary Card */}
//           <div
//             className="absolute -bottom-16 -left-16 w-56 h-72 rounded-3xl overflow-hidden border-4 border-black shadow-2xl z-30 animate-3d-float"
//             style={{ animationDelay: "2s" }}
//           >
//             <img
//               src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop"
//               alt="Story book close up"
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {/* Sparkle Glow */}
//           <div className="absolute top-0 -right-8 w-24 h-24 bg-gold/10 rounded-full blur-2xl animate-pulse" />
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;

import React from "react";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { FaGhost } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16 perspective-container bg-gradient-to-b from-black via-[#1E1E1E] to-black text-white"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -left-16 sm:-left-32 w-[400px] sm:w-[600px] md:w-[850px] h-[400px] sm:h-[600px] md:h-[850px] bg-polishedPurple/10 rounded-full blur-[120px] sm:blur-[180px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-16 sm:-right-32 w-[400px] sm:w-[600px] md:w-[850px] h-[400px] sm:h-[600px] md:h-[850px] bg-polishedPurple/5 rounded-full blur-[120px] sm:blur-[180px]" />
      </div>

      {/* Floating Ghosts - Responsive positioning */}
      <FaGhost className="absolute top-24 sm:top-32 left-4 sm:left-8 md:left-16 text-white/20 text-xl sm:text-2xl md:text-3xl animate-bounce" />
      <FaGhost className="absolute top-24 sm:top-32 right-4 sm:right-8 md:right-16 text-white/20 text-lg sm:text-xl md:text-2xl animate-bounce" />
      <FaGhost className="absolute bottom-12 sm:bottom-20 left-6 sm:left-16 md:left-32 text-white/20 text-lg sm:text-xl md:text-2xl animate-bounce" />
      <FaGhost className="absolute bottom-12 sm:bottom-20 right-6 sm:right-16 md:right-32 text-white/20 text-xl sm:text-2xl md:text-3xl animate-bounce" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center relative z-10">
        
        {/* LEFT — Text */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6 reveal-hidden text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-polishedPurple/10 border border-polishedPurple/20 text-polishedPurple text-xs sm:text-sm font-bold tracking-widest uppercase">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Every memory is a story
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] font-bold tracking-tighter">
            Some lives deserve <br />
            <span className="italic magic-shine">to be remembered</span> <br />
            as stories.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
            Turn your life, your child, or your memories into a beautiful,
            personalized storybook — created just for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 items-center lg:items-start">
            <button
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto bg-polishedPurple text-grey px-8 sm:px-10 py-4 sm:py-5 md:py-6 rounded-full font-serif text-lg sm:text-xl hover:bg-white hover:text-black transition-all duration-700 shadow-[0_0_30px_rgba(147,51,234,0.35)] sm:shadow-[0_0_50px_rgba(147,51,234,0.35)] group flex items-center justify-center gap-3 min-h-[44px]"
            >
              Create Your Book
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full sm:w-auto group flex items-center justify-center gap-3 sm:gap-4 text-white/70 hover:text-white transition-all px-6 sm:px-8 py-4 sm:py-5 md:py-6 min-h-[44px]">
              <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-polishedPurple group-hover:border-polishedPurple transition-all">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </span>
              <span className="font-serif text-sm sm:text-base">Watch Demo</span>
            </button>
          </div>
        </div>

        {/* RIGHT — 3D Book */}
        <div className="relative reveal-hidden reveal-delay-400 mt-8 lg:mt-0">
          <div className="relative z-20 transform md:rotate-y-12 md:rotate-x-6 animate-3d-float group">
            <div className="absolute inset-0 bg-polishedPurple/20 blur-[80px] sm:blur-[120px] group-hover:bg-polishedPurple/40 transition-all" />

            <div className="relative rounded-2xl sm:rounded-3xl md:rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.7)] sm:shadow-[0_50px_120px_rgba(0,0,0,0.7)] aspect-[3/4] sm:aspect-[4/5] bg-black max-w-md mx-auto lg:max-w-none">
              <img
                src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1200&auto=format&fit=crop"
                alt="Emotional storytelling"
                className="w-full h-full object-cover grayscale-[0.25] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-6 sm:left-8 md:left-10 right-6 sm:right-8 md:right-10">
                <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-white leading-snug">
                  "One day, your child will ask for a story about themselves…"
                </p>
              </div>
            </div>
          </div>

          {/* Floating Secondary Card - Hidden on mobile, visible on larger screens */}
          <div
            className="hidden md:block absolute -bottom-16 -left-16 w-48 h-60 lg:w-56 lg:h-72 rounded-2xl lg:rounded-3xl overflow-hidden border-4 border-black shadow-2xl z-30 animate-3d-float"
            style={{ animationDelay: "2s" }}
          >
            <img
              src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop"
              alt="Story book close up"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Sparkle Glow */}
          <div className="absolute top-0 -right-4 sm:-right-8 w-16 h-16 sm:w-24 sm:h-24 bg-gold/10 rounded-full blur-2xl animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;