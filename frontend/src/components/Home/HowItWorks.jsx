import React from "react";
import { Sparkles } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      title: "Share your details",
      desc: "Tell us a name, a precious memory, or a feeling. No complex forms, just your thoughts.",
    },
    {
      num: "02",
      title: "Ghost transforms",
      desc: "Our storyteller weaves your details into a rich narrative with handcrafted illustrations.",
    },
    {
      num: "03",
      title: "Receive your gift",
      desc: "Get a digital book or a beautifully printed premium keepsake delivered to your door.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-charcoalBlack py-32 md:py-48 border-y border-white/5 overflow-hidden perspective-container"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-20 md:gap-24 items-center">

          {/* LEFT — Steps */}
          <div className="reveal-hidden space-y-12 md:space-y-16">
            <h2 className="font-serif text-5xl md:text-7xl text-ghostWhite">
              How it works
            </h2>

            <div className="space-y-12 md:space-y-16">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="flex gap-8 md:gap-10 group reveal-hidden"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="font-serif text-5xl md:text-6xl text-polishedPurple/20 group-hover:text-polishedPurple transition-all duration-700 shrink-0 transform group-hover:scale-110 group-hover:rotate-12">
                    {s.num}
                  </div>

                  <div className="space-y-2 md:space-y-3 pt-2">
                    <h3 className="text-2xl font-medium text-ghostWhite group-hover:text-polishedPurple transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-ghostWhite/40 leading-relaxed text-lg font-light">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — 3D Collage */}
          <div
            className="relative h-[600px] md:h-[700px] reveal-hidden flex items-center justify-center"
            style={{ transitionDelay: "400ms" }}
          >
            {/* Top Card */}
            <div className="absolute top-0 right-0 w-64 md:w-72 h-80 md:h-96 rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] rotate-12 z-10 border border-white/5 transition-all duration-1000 hover:rotate-0">
              <img
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop"
                alt="Writing desk"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-polishedPurple/10 z-10" />
            </div>

            {/* Bottom Card */}
            <div className="absolute bottom-0 left-0 w-72 md:w-80 h-[450px] md:h-[500px] rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] -rotate-6 z-20 border border-white/5 transition-all duration-1000 hover:rotate-0">
              <img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop"
                alt="Library atmosphere"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-polishedPurple/10 z-10" />
            </div>

            {/* Center Card (FIXED TEXT VISIBILITY) */}
            <div className="relative w-80 md:w-96 h-[550px] md:h-[600px] rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.7)] z-0 transition-all duration-1000 hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop"
                alt="A child exploring books"
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-polishedPurple/40 to-transparent z-10" />

              {/* Text — ALWAYS ABOVE OVERLAY */}
              <div className="absolute bottom-10 left-10 right-10 flex items-center gap-4 text-ghostWhite z-20">
                <Sparkles className="w-8 h-8 shrink-0" />
                <span className="font-serif italic text-xl">
                  The Magic of Memory
                </span>
              </div>
            </div>

            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-polishedPurple/5 rounded-full blur-[160px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
