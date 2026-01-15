// import React from "react";

// const WhoItIsFor = () => {
//   const personas = [
//     {
//       title: "For Children",
//       subtitle: "Let them be the hero of their own story.",
//       description:
//         "Bedtime stories where confidence, imagination, and joy grow naturally.",
//       image:
//         "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&q=80&w=800",
//     },
//     {
//       title: "For Families",
//       subtitle: "Preserve memories before they fade.",
//       description:
//         "Stories about parents, grandparents, journeys, sacrifices, and love.",
//       image:
//         "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
//     },
//     {
//       title: "For Gifting",
//       subtitle: "Give something no one else can.",
//       description:
//         "Birthdays, anniversaries, milestones — a story made only for them.",
//       image:
//         "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800",
//     },
//   ];

//   return (
//     <section className="py-40 bg-charcoalBlack relative overflow-hidden perspective-container">
//       <div className="max-w-7xl mx-auto px-6 md:px-12">

//         {/* Header */}
//         <div className="text-center mb-32 space-y-6 reveal-hidden">
//           <h2 className="font-serif text-5xl md:text-7xl text-ghostWhite">
//             Who is GHOST for?
//           </h2>
//           <p className="text-ghostWhite/40 max-w-xl mx-auto italic text-xl font-light">
//             Crafting connections across generations.
//           </p>
//         </div>

//         {/* Cards */}
//         <div className="grid md:grid-cols-3 gap-12">
//           {personas.map((p, i) => (
//             <div
//               key={i}
//               className="
//                 group
//                 cursor-default
//                 reveal-hidden
//                 transform
//                 transition-all
//                 duration-1000
//                 hover:rotate-y-6
//                 hover:-translate-y-4
//               "
//               style={{ transitionDelay: `${i * 200}ms` }}
//             >
//               {/* Image Card */}
//               <div className="relative h-[550px] rounded-[3rem] overflow-hidden mb-10 shadow-2xl border border-white/5 group-hover:border-polishedPurple/30">
//                 <img
//                   src={p.image}
//                   alt={p.title}
//                   className="
//                     w-full
//                     h-full
//                     object-cover
//                     grayscale-[0.2]
//                     transition-transform
//                     duration-1000
//                     group-hover:scale-110
//                     group-hover:grayscale-0
//                   "
//                 />

//                 {/* Overlay */}
//                 <div className="absolute inset-0 bg-gradient-to-t from-charcoalBlack/90 via-charcoalBlack/20 to-transparent" />

//                 {/* Title inside image */}
//                 <div className="absolute bottom-10 left-10 right-10 text-ghostWhite">
//                   <h3 className="font-serif text-3xl mb-3">{p.title}</h3>
//                   <div className="w-16 h-1 bg-polishedPurple mb-6 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
//                 </div>
//               </div>

//               {/* Text below image */}
//               <h4 className="font-medium text-2xl mb-4 text-ghostWhite group-hover:text-polishedPurple transition-colors leading-snug">
//                 {p.subtitle}
//               </h4>
//               <p className="text-ghostWhite/40 leading-relaxed text-lg font-light">
//                 {p.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default WhoItIsFor;

import React from "react";

const WhoItIsFor = () => {
  const personas = [
    {
      title: "For Children",
      subtitle: "Let them be the hero of their own story.",
      description:
        "Bedtime stories where confidence, imagination, and joy grow naturally.",
      image:
        "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "For Families",
      subtitle: "Preserve memories before they fade.",
      description:
        "Stories about parents, grandparents, journeys, sacrifices, and love.",
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "For Gifting",
      subtitle: "Give something no one else can.",
      description:
        "Birthdays, anniversaries, milestones — a story made only for them.",
      image:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800",
    },
  ];

  return (
    <section className="py-20 sm:py-28 md:py-36 lg:py-40 bg-charcoalBlack relative overflow-hidden perspective-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">

        {/* Header */}
        <div className="text-center mb-20 sm:mb-24 md:mb-32 space-y-4 sm:space-y-6 reveal-hidden">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-ghostWhite">
            Who is GHOST for?
          </h2>
          <p className="text-ghostWhite/40 max-w-xl mx-auto italic text-lg sm:text-xl font-light">
            Crafting connections across generations.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          {personas.map((p, i) => (
            <div
              key={i}
              className="
                group
                cursor-default
                reveal-hidden
                transform
                transition-all
                duration-1000
                hover:md:rotate-y-6
                hover:-translate-y-2 sm:hover:-translate-y-4
              "
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              {/* Image Card */}
              <div className="relative h-[300px] sm:h-[380px] md:h-[450px] lg:h-[550px] rounded-2xl sm:rounded-3xl md:rounded-[3rem] overflow-hidden mb-6 sm:mb-8 md:mb-10 shadow-xl sm:shadow-2xl border border-white/5 group-hover:border-polishedPurple/30">
                <img
                  src={p.image}
                  alt={p.title}
                  className="
                    w-full
                    h-full
                    object-cover
                    grayscale-[0.2]
                    transition-transform
                    duration-1000
                    group-hover:scale-110
                    group-hover:grayscale-0
                  "
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoalBlack/90 via-charcoalBlack/20 to-transparent" />

                {/* Title inside image */}
                <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-6 sm:left-8 md:left-10 right-6 sm:right-8 md:right-10 text-ghostWhite">
                  <h3 className="font-serif text-2xl sm:text-3xl mb-2 sm:mb-3">{p.title}</h3>
                  <div className="w-12 sm:w-16 h-1 bg-polishedPurple mb-4 sm:mb-6 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
                </div>
              </div>

              {/* Text below image */}
              <h4 className="font-medium text-xl sm:text-2xl mb-3 sm:mb-4 text-ghostWhite group-hover:text-polishedPurple transition-colors leading-snug">
                {p.subtitle}
              </h4>
              <p className="text-ghostWhite/40 leading-relaxed text-base sm:text-lg font-light">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoItIsFor;
