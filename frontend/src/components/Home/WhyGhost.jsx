// import React from "react";
// import { Heart, Moon, Feather } from "lucide-react";

// const WhyGhost = () => {
//   return (
//     <section className="bg-charcoalBlack text-ghostWhite overflow-hidden relative border-y border-white/5 perspective-container pt-32">
//       <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-charcoalBlack pointer-events-none z-0" />
//       <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

//         {/* Header */}
//         <div className="text-center mb-24 reveal-hidden">
//           <h2 className="font-serif text-5xl md:text-7xl mb-12 leading-tight max-w-4xl mx-auto font-medium">
//             Not everything meaningful fits into photographs.
//           </h2>
//           <p className="text-2xl text-ghostWhite/40 max-w-2xl mx-auto leading-relaxed italic font-light">
//             Some moments are felt, not captured — a laugh in the kitchen, a bedtime
//             ritual, a grandfather’s voice.
//           </p>
//         </div>

//         {/* Cards */}
//         <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-polishedPurple/5 blur-[180px] pointer-events-none" />
//         <div className="grid md:grid-cols-3 gap-12">
//           {[
//             {
//               icon: Heart,
//               title: "Felt Moments",
//               desc:
//                 "Ghost exists to turn those moments into stories you can hold, read, and pass on.",
//             },
//             {
//               icon: Feather,
//               title: "Uniquely Yours",
//               desc:
//                 "Not templated. Not generic. Created uniquely — for one life, one family, one story.",
//             },
//             {
//               icon: Moon,
//               title: "Intimate Legacy",
//               desc:
//                 "Designed to feel like a book you’d keep forever. Simple inputs, meaningful outputs.",
//             },
//           ].map((item, idx) => (
//             <div
//               key={idx}
//               className="
//                 group
//                 p-12
//                 rounded-[2.5rem]
//                 bg-white/[0.02]
//                 border
//                 border-white/5
//                 reveal-hidden
//                 transition-all
//                 duration-700
//                 transform
//                 hover:-translate-y-4
//                 hover:rotate-x-12
//                 hover:border-polishedPurple/40
//               "
//               style={{ transitionDelay: `${idx * 150}ms` }}
//             >
//               {/* Icon */}
//               <div
//                 className="
//                   w-20
//                   h-20
//                   rounded-2xl
//                   bg-polishedPurple/10
//                   flex
//                   items-center
//                   justify-center
//                   mb-10
//                   transition-all
//                   duration-500
//                   group-hover:bg-polishedPurple
//                   group-hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]
//                 "
//               >
//                 <item.icon className="w-10 h-10 text-polishedPurple group-hover:text-ghostWhite transition-colors" />
//               </div>

//               {/* Text */}
//               <h3 className="font-serif text-3xl font-medium mb-6">{item.title}</h3>
//               <p className="text-ghostWhite/40 leading-relaxed text-lg font-light">{item.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default WhyGhost;

import React from "react";
import { Heart, Moon, Feather } from "lucide-react";

const WhyGhost = () => {
  return (
    <section className="bg-charcoalBlack text-ghostWhite overflow-hidden relative border-y border-white/5 perspective-container pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-24">
      <div className="absolute top-0 left-0 w-full h-32 sm:h-40 bg-gradient-to-b from-transparent to-charcoalBlack pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 sm:mb-20 md:mb-24 reveal-hidden">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-8 sm:mb-10 md:mb-12 leading-tight max-w-4xl mx-auto font-medium px-4">
            Not everything meaningful fits into photographs.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-ghostWhite/40 max-w-2xl mx-auto leading-relaxed italic font-light px-4">
            Some moments are felt, not captured — a laugh in the kitchen, a bedtime
            ritual, a grandfather's voice.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[200px] sm:h-[300px] bg-polishedPurple/5 blur-[180px] pointer-events-none" />
        
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {[
            {
              icon: Heart,
              title: "Felt Moments",
              desc:
                "Ghost exists to turn those moments into stories you can hold, read, and pass on.",
            },
            {
              icon: Feather,
              title: "Uniquely Yours",
              desc:
                "Not templated. Not generic. Created uniquely — for one life, one family, one story.",
            },
            {
              icon: Moon,
              title: "Intimate Legacy",
              desc:
                "Designed to feel like a book you'd keep forever. Simple inputs, meaningful outputs.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="
                group
                p-8 sm:p-10 md:p-12
                rounded-3xl sm:rounded-[2.5rem]
                bg-white/[0.02]
                border
                border-white/5
                reveal-hidden
                transition-all
                duration-700
                transform
                hover:-translate-y-2 sm:hover:-translate-y-4
                md:hover:rotate-x-12
                hover:border-polishedPurple/40
              "
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              {/* Icon */}
              <div
                className="
                  w-16 h-16 sm:w-20 sm:h-20
                  rounded-xl sm:rounded-2xl
                  bg-polishedPurple/10
                  flex
                  items-center
                  justify-center
                  mb-6 sm:mb-8 md:mb-10
                  transition-all
                  duration-500
                  group-hover:bg-polishedPurple
                  group-hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]
                "
              >
                <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-polishedPurple group-hover:text-ghostWhite transition-colors" />
              </div>

              {/* Text */}
              <h3 className="font-serif text-2xl sm:text-3xl font-medium mb-4 sm:mb-6">{item.title}</h3>
              <p className="text-ghostWhite/40 leading-relaxed text-base sm:text-lg font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGhost;
