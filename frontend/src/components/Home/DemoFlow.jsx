import React, { useState, useEffect } from "react";

const DemoFlow = () => {
  const [stage, setStage] = useState(0);

  const stages = [
    {
      title: "Some lives deserve to be remembered as stories.",
      desc: "Every quiet moment holds a universe inside.",
      img: "https://images.unsplash.com/photo-1464335441584-904f47a6104c?auto=format&fit=crop&q=80&w=1200",
      duration: 5000,
    },
    {
      title: "Tell us about them.",
      desc: "Names, laughter, and the details that make them who they are.",
      img: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&q=80&w=1200",
      duration: 6000,
    },
    {
      title: "The magic begins.",
      desc: "Ghost transforms fragments of memory into beautiful art.",
      img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1200",
      duration: 6000,
    },
    {
      title: "This story is theirs.",
      desc: "A personalized legacy to be passed down through time.",
      img: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=1200",
      duration: 8000,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, stages[stage].duration);

    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <section className="bg-charcoalBlack py-40 overflow-hidden relative border-y border-white/5 perspective-container">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-24 reveal-hidden">
          <span className="px-6 py-2 rounded-full bg-polishedPurple/10 border border-polishedPurple/20 text-polishedPurple text-sm font-bold tracking-[0.4em] uppercase">
            The Experience
          </span>
        </div>

        {/* Demo Stage */}
        <div className="relative h-[750px] w-full rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] bg-black/40 border border-white/5 group">
          {stages.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-[3000ms] flex items-center justify-center p-20 ${
                stage === i
                  ? "opacity-100 scale-100 rotate-x-0 blur-0"
                  : "opacity-0 scale-110 rotate-x-6 blur-2xl pointer-events-none"
              }`}
            >
              <img
                src={s.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30 transform group-hover:scale-105 transition-transform duration-[10000ms]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-charcoalBlack via-transparent to-charcoalBlack opacity-70" />

              <div className="relative z-10 max-w-4xl text-center space-y-12">
                <h3 className="font-serif text-5xl md:text-7xl text-ghostWhite leading-tight">
                  {s.title}
                </h3>
                <div className="w-32 h-px bg-polishedPurple/50 mx-auto" />
                <p className="text-ghostWhite/50 font-serif italic text-3xl lowercase tracking-wide font-light">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Progress */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-8 z-20">
            {stages.map((_, i) => (
              <button
                key={i}
                onClick={() => setStage(i)}
                className={`h-1.5 transition-all duration-[1500ms] rounded-full hover:bg-polishedPurple/60 ${
                  stage === i ? "bg-polishedPurple w-24" : "bg-ghostWhite/10 w-8"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center reveal-hidden">
          <p className="text-ghostWhite/20 font-serif text-lg uppercase tracking-[0.6em] italic">
            — A story uniquely theirs —
          </p>
        </div>
      </div>
    </section>
  );
};

export default DemoFlow;
