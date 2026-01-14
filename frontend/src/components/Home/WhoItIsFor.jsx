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
    <section className="py-40 bg-charcoalBlack relative overflow-hidden perspective-container">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="text-center mb-32 space-y-6 reveal-hidden">
          <h2 className="font-serif text-5xl md:text-7xl text-ghostWhite">
            Who is GHOST for?
          </h2>
          <p className="text-ghostWhite/40 max-w-xl mx-auto italic text-xl font-light">
            Crafting connections across generations.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-12">
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
                hover:rotate-y-6
                hover:-translate-y-4
              "
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              {/* Image Card */}
              <div className="relative h-[550px] rounded-[3rem] overflow-hidden mb-10 shadow-2xl border border-white/5 group-hover:border-polishedPurple/30">
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
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoalBlack/90 via-charcoalBlack/20 to-transparent" />

                {/* Title inside image */}
                <div className="absolute bottom-10 left-10 right-10 text-ghostWhite">
                  <h3 className="font-serif text-3xl mb-3">{p.title}</h3>
                  <div className="w-16 h-1 bg-polishedPurple mb-6 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
                </div>
              </div>

              {/* Text below image */}
              <h4 className="font-medium text-2xl mb-4 text-ghostWhite group-hover:text-polishedPurple transition-colors leading-snug">
                {p.subtitle}
              </h4>
              <p className="text-ghostWhite/40 leading-relaxed text-lg font-light">
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
