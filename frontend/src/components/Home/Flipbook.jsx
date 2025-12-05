// src/components/Flipbook.jsx
import React, { useState } from "react";
import "../../styles/flipbook.css"; 
import coverImg from "../../assets/images/image (10).webp"; 
import img1 from "../../assets/images/image (3).webp";
import img2 from "../../assets/images/image (4).webp";
import img3 from "../../assets/images/image (5).webp";
import img4 from "../../assets/images/image (6).webp";
import img5 from "../../assets/images/image (7).webp";
import img6 from "../../assets/images/image (8).webp";
import img7 from "../../assets/images/image (9).webp";
import img8 from "../../assets/images/image (10).webp";
import img9 from "../../assets/images/image (11).webp";
import img10 from "../../assets/images/image (12).webp";

// Cover Page Component
const CoverPage = ({ title, subtitle, brand, background }) => {

  return (
    <div className="flex items-center justify-center relative overflow-hidden w-full h-full min-h-full min-w-full">
      {/* Background image */}
      <img
        src={background}
        alt="Cover background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ pointerEvents: "none" }}
      />

      {/* Overlay content */}
      <div className="absolute top-0 left-0 w-full z-10 text-center pt-12">
        <h1
          className="text-4xl font-elegant font-bold text-primary mb-2 tracking-wide"
          style={{
            color: "#fff",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-xl text-muted-foreground font-story italic"
            style={{
              color: "#fff",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.4)",
            }}
          >
            {subtitle}
          </p>
        )}
         {brand && (
          <p
            className="fixed bottom-4 left-1/2 -translate-x-1/2 text-2xl font-bold z-50"
            style={{
              color: "#fff",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.4)",
            }}
          >
            {brand}
          </p>
        )}
      </div>
    </div>
  );
};

// Flipbook Component
const Flipbook = () => {
  const [page, setPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const storyData = [
   {
    story: "In the heart of the tree, a glint of light beckoned, like a moonlit path through the shadows. Lina's fingers trailed across the worn bark, and her hand closed around a delicate lantern. As she lifted it, the lantern's soft glow illuminated the faces of those who had once held it, their stories etched like delicate constellations across its glassy surface.",
    image: img1
  },
  {
    story: "With lantern in hand, Lina felt an inexplicable pull, as if the wind itself was guiding her through the winding streets of Zephyra. The thatched roofs and wooden houses seemed to blend into a tapestry of earthy tones and rustic charm. As she navigated the village, a rustling in the bushes caught her attention – a sleek white fox with golden-tipped fur emerged, piercing her with sharp amber eyes that glowed faintly in the fading light.",
    image: img2
  },
  {
    story: "Unfamiliar but certain, Lina explained her desire to uncover the lantern's secrets and guide lost spirits back to their places in the world. Whisker listened intently, his tail twitching with every word. As the night deepened, the pair set off towards the edge of the village, their footsteps quiet on the dew-kissed grass.The wind carried the whispers of the past, guiding Lina towards the unknown. A gentle breeze rustled Whisker's fur, and he nodded knowingly, as if he'd been expecting this moment all along. Together, they stepped beyond the village boundaries, into a realm of moonlit possibilities.",
    image: img3
  },
  {
    story: "As they ventured into the unknown, the moon climbed higher in the sky, casting a silver glow across the landscape. Lina's cloak billowed behind her like a cloud, its brown threads woven with an air of resilience. Whisker padded silently by her side, his eyes ever watchful for signs of danger.A narrow path unwound before them, wending through a forest of towering trees, their branches tangled in a canopy of leaves that shivered in the breeze. The lantern's light danced through the gaps, casting an ethereal glow on the forest floor. Lina felt a sense of wonder kindling within – she was being led to a deeper truth.",
    image: img4
  },
   {
    story: "Deep within the forest, a figure emerged from the shadows. Eron, the banished sky mage, stood tall and lean, his flowing robes as blue as the evening sky on a summer's day. A silver beard wove its way down his chest, each strand studded with tiny stars that twinkled like diamonds. His eyes, deep and wise, locked onto Lina, shining with a warmth that put her at ease.",
    image: img5
  },
  {
    story: "With a wave of his staff, Eron invited Lina and Whisker to follow. Together, they traversed the forest, the trees growing taller and the shadows deepenening. A faint hum of magic wove its way through the air, a gentle vibration that Lina felt deep within her chest. Her heart pounded with excitement as the trees parted to reveal a glowing portal.Beyond the shimmering threshold, a realm of flickering lights and whispering shadows unfolded – the realm of the lost. The lantern's glow pierced the veil, guiding Lina deeper, into a world where memories dwelled like fog, waiting to be swept away.",
    image: img6
  },
     {
    story: "Within the realm, Lina encountered the wandering souls – their faces ethereal, their eyes clouded with confusion. Whisker moved through the mist, listening to their tales of forgotten loves, lost childhoods, and shattered dreams. As Lina reached out to touch a wandering hand, memories came flooding back. Tears pricked at the corners of her eyes as the forgotten stories began to resurface.",
    image: img7
  },
  {
    story: "As the night wore on, Lina guided more souls back to their rightful places in the world. Whisker's presence remained constant, a reassuring shadow in the darkness. The wind carried the whispers of their stories, weaving them into a patchwork quilt of hope and forgiveness. Eron stood firm, his staff glowing with a soft blue light that seemed to imbue the landscape with a sense of peace.With each memory restored, the lantern's glow grew brighter, illuminating the path ahead. Its light danced across Lina's face, revealing a truth she'd long held hidden within herself – a truth that would change the course of her life forever.",
    image: img8
  },
   {
    story: "But a shadow loomed on the horizon – the Wind Warden, shrouded in swirling mist, the flickers of lightning dancing beneath a deep hooded cloak. His very presence seemed to carry the weight of a thousand storms, his eyes cold and unforgiving as steel. Lina felt a shiver run down her spine as the Wind Warden's gaze locked onto the lantern.'The lantern's power is mine,' he declared, his voice like a howling gale. 'I will twist fate itself, bending the threads of destiny to suit my whim.' Eron stepped forward, his staff glowing brighter, but the Wind Warden laughed, the sound like the crash of thunder on a stormy night.",
    image: img9
  },
  {
    story: "Lina stood firm, her heart pounding in time with the lantern's pulsing light. She knew that the fate of the world, and her own, hung in the balance. Whisker, sensing her resolve, stood tall beside her, his eyes blazing with a fierce inner light. The Wind Warden's stormy form loomed closer, but Lina's determination stood strong against the tempest. Together, they prepared to face the darkness, armed with the lantern's power and the love that had guided her on this journey.",
    image: img10
  },
  ]; 

  const nextPage = () => {
    if (page < storyData.length) {
      setIsFlipping(true);
      setTimeout(() => {
        setPage(page + 1);
        setIsFlipping(false);
      }, 600); // match animation duration
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setPage(page - 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      {/* Flipbook Container */}
      <div className="w-full max-w-3xl aspect-[4/3] perspective">
        <div
          className={`relative w-full h-full shadow-2xl rounded-xl overflow-hidden transform-style-preserve-3d duration-700 ${
            isFlipping ? "flip" : ""
          }`}
        >
          {/* Cover Page */}
          {page === 0 ? (
            <CoverPage
              title="Lantern of the Lost"
              subtitle="A Story of Forgotten Realms"
              brand="Powered by GHOST.IO"
              background={coverImg}
            />
          ) : (
            /* Story Pages */
            <div className="flex w-full h-full">
              {/* Left Side (Story) */}
              <div className="w-1/2 p-10 flex items-center justify-center bg-[#12122b]">
  <p className="font-serif text-lg leading-relaxed tracking-wide text-gray-100">
    {storyData[page - 1].story}
  </p>
</div>

              {/* Right Side (Image) */}
              <div className="w-1/2 flex items-center justify-center bg-[#222244]">
                <img
                  src={storyData[page - 1].image}
                  alt="Story Illustration"
                  className="w-full h-full object-cover rounded-r-xl"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex mt-6 space-x-4">
        <button
          onClick={prevPage}
          disabled={page === 0}
          className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-purple-600 disabled:opacity-40 transition"
        >
          ◀ Previous
        </button>
        <button
          onClick={nextPage}
          disabled={page === storyData.length}
          className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-purple-600 disabled:opacity-40 transition"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default Flipbook;