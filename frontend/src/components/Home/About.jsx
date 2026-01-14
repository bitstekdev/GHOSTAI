// import React from "react";

// export default function About() {
//   return (
//     <section
//       id="about"
//       className="bg-charcoalBlack overflow-hidden perspective-container py-32 md:py-48"
//     >
//       <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-20 md:gap-32 items-center">

//         {/* LEFT — Image / 3D Book */}
//         <div className="order-2 md:order-1 relative reveal-hidden">
          
//           {/* Main 3D Image */}
//           <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] group border border-white/10 aspect-[4/3] transform transition-all duration-1000 hover:rotate-y-12 hover:scale-[1.02] bg-polishedPurple/5">
//             <img
//               src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop"
//               alt="A vintage library atmosphere"
//               className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
//               onError={(e) => {
//                 e.currentTarget.src =
//                   "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop";
//               }}
//             />
//             <div className="absolute inset-0 bg-polishedPurple/10 mix-blend-color pointer-events-none" />
//             <div className="absolute inset-0 bg-gradient-to-tr from-charcoalBlack/10 via-transparent to-transparent" />
//           </div>

//           {/* Floating Quote Card */}
//           <div className="absolute -top-10 -right-4 md:-right-10 p-6 md:p-8 bg-charcoalBlack/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-3d-float z-30 max-w-[220px] pointer-events-none">
//             <p className="font-serif text-lg italic text-white leading-snug">
//               "Every book is a universe waiting to be lived."
//             </p>
//           </div>

//           {/* Ambient Glow */}
//           <div className="absolute -bottom-20 -right-20 bg-polishedPurple w-80 h-80 opacity-10 rounded-full blur-[120px]" />
//         </div>

//         {/* RIGHT — Text */}
//         <div
//           className="order-1 md:order-2 space-y-8 md:space-y-12 reveal-hidden"
//           style={{ transitionDelay: "300ms" }}
//         >
//           <div className="inline-block px-6 py-2 bg-polishedPurple/10 text-polishedPurple text-xs font-bold tracking-[0.3em] uppercase rounded-full border border-polishedPurple/20">
//             The Studio
//           </div>

//           <h2 className="font-serif text-5xl md:text-8xl text-ghostWhite leading-tight font-medium tracking-tight">
//             Ghost is a <br />
//             <span className="italic magic-shine">storyteller.</span>
//           </h2>

//           <div className="space-y-8 md:space-y-10 text-xl md:text-2xl text-ghostWhite/50 leading-relaxed font-light">
//             <p>
//               Ghost blends imagination, emotion, and technology to create stories
//               that feel deeply personal. Every book is unique.
//             </p>

//             <p className="font-serif italic text-ghostWhite/80 text-2xl md:text-3xl border-l-4 border-polishedPurple pl-8 md:pl-10 leading-relaxed">
//               "We believe stories should feel like they belong to you, not a
//               machine."
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import React from "react";

export default function About() {
  return (
    <section
      id="about"
      className="bg-charcoalBlack overflow-hidden perspective-container py-20 sm:py-24 md:py-32 lg:py-48"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12">

        {/* LEFT — Image / 3D Book */}
        <div className="order-2 md:order-1 relative reveal-hidden">
          
          {/* Main 3D Image */}
          <div className="relative rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] sm:shadow-[0_40px_100px_rgba(0,0,0,0.7)] group border border-white/10 aspect-[16/9] sm:aspect-[4/3] transform transition-all duration-1000 hover:md:rotate-y-12 hover:scale-[1.02] bg-polishedPurple/5">
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop"
              alt="A vintage library atmosphere"
              className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-polishedPurple/10 mix-blend-color pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-charcoalBlack/10 via-transparent to-transparent" />
          </div>

          {/* Floating Quote Card */}
          <div className="absolute -top-6 sm:-top-10 right-4 sm:right-6 md:-right-4 lg:-right-10 p-4 sm:p-6 md:p-8 bg-charcoalBlack/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl animate-3d-float z-30 max-w-[160px] sm:max-w-[200px] md:max-w-[220px] pointer-events-none">
            <p className="font-serif text-sm sm:text-base md:text-lg italic text-white leading-snug">
              "Every book is a universe waiting to be lived."
            </p>
          </div>

          {/* Ambient Glow */}
          <div className="absolute -bottom-16 sm:-bottom-20 -right-16 sm:-right-20 bg-polishedPurple w-60 sm:w-80 h-60 sm:h-80 opacity-10 rounded-full blur-[120px]" />
        </div>

        {/* RIGHT — Text */}
        <div
          className="order-1 md:order-2 space-y-6 sm:space-y-8 md:space-y-12 reveal-hidden"
          style={{ transitionDelay: "300ms" }}
        >
          <div className="inline-block px-4 sm:px-6 py-2 bg-polishedPurple/10 text-polishedPurple text-xs sm:text-sm font-bold tracking-[0.3em] uppercase rounded-full border border-polishedPurple/20">
            The Studio
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-ghostWhite leading-tight font-medium tracking-tight">
            Ghost is a <br />
            <span className="italic magic-shine">storyteller.</span>
          </h2>

          <div className="space-y-6 sm:space-y-8 md:space-y-10 text-lg sm:text-xl md:text-2xl text-ghostWhite/50 leading-relaxed font-light">
            <p>
              Ghost blends imagination, emotion, and technology to create stories
              that feel deeply personal. Every book is unique.
            </p>

            <p className="font-serif italic text-ghostWhite/80 text-xl sm:text-2xl md:text-3xl border-l-4 border-polishedPurple pl-6 sm:pl-8 md:pl-10 leading-relaxed">
              "We believe stories should feel like they belong to you, not a
              machine."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}