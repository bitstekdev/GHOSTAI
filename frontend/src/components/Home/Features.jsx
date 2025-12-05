import React from 'react'
import { 
  FaRobot, 
  FaBookOpen, 
  FaImages, 
  FaUserSecret, 
  FaEraser, 
  FaUserFriends 
} from "react-icons/fa";

const Features = () => {
  
    const features = [
  {
    icon: <FaRobot />,
    title: "Latest AI Technology",
    desc: "Experience the future of creation with powerful AI tools designed to save time, spark creativity, and deliver smarter, faster results that feel effortless.",
  },
  {
    icon: <FaImages /> ,
    title: "Story and Image Generation",
    desc: "Turn your ideas into reality by generating engaging stories and striking visuals, helping you express creativity without limits or technical barriers.",
  },
  {
    icon: <FaBookOpen />,
    title: "Get 3D Book",
    desc: "Transform your imagination into immersive 3D books with interactive designs, making your content more dynamic, engaging, and ready to share with the world.",
  },
  {
    icon: <FaUserSecret />,
    title: "Face Swap",
    desc: "Effortlessly swap faces with advanced AI precision, opening up endless possibilities for fun edits, professional projects, or personalized creative storytelling.",
  },
  {
    icon: <FaEraser />,
    title: "Inpaint and Object Eraser",
    desc: "Remove unwanted objects or fix imperfections in your images with just a click, while our AI seamlessly restores and enhances your visuals to perfection.",
  },
  {
    icon: <FaUserFriends />,
    title: "Character Consistency",
    desc: "Ensure your characters stay visually consistent across every scene and story, making your narratives more professional, reliable, and easy to follow.",
  },
];

  return (
    <section id='features' className="bg-black text-white px-6 md:px-16 py-16">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-poppins relative inline-block">
          Our Key Features
          {/* <span className="absolute left-0 -bottom-2 w-full h-1 bg-gradient-to-r from-white to gray rounded-full"></span> */}
        </h2>
        <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
        Explore innovative features designed to inspire creativity and enhance your storytelling experience.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((item, i) => (
          <div
            key={i}
            className="relative group bg-[#0D0D0D] rounded-4xl p-6 border border-white/16 transition transform hover:-translate-y-2 hover:shadow-xl"
          >
            {/* Icon */}
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#404142] text-white text-xl mb-4">
              {item.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4">{item.desc}</p>

          </div>
        ))}
      </div>
    </section>
  );
}

export default Features