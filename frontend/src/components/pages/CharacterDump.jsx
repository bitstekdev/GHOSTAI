import { useState } from "react";
import { User, DollarSign, UploadCloud, Edit2 } from "lucide-react";
import pimage1 from "../../assets/images/pimage(1).jpg";
import pimage2 from "../../assets/images/pimage(2).jpg";
import pimage3 from "../../assets/images/pimage(3).jpg";
import pimage4 from "../../assets/images/pimage(4).jpg";
import { FaGhost} from "react-icons/fa";

const characters = [
  { name: "Naveed", trigger: "Naveed.18", img: pimage1 },
  { name: "Lohit", trigger: "Lohit.358", img: pimage2 },
  { name: "Shsahi", trigger: "Shsahi.1802", img: pimage3 },
  { name: "Shaad", trigger: "Shaad.22", img: pimage4 },
];

const CharacterDump = () => {
  const [characterName, setCharacterName] = useState("");
  const [triggerName, setTriggerName] = useState("");
  const [_images, _setImages] = useState([]);

  return (
    <div className="flex-1 bg-[#0b0b0d] min-h-screen flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-white mb-8 w-full text-center">
        Character Dump
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
        {/* Left: Form */}
        <div className="bg-[#19181e] rounded-2xl p-8 flex-1 max-w-lg w-full">
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Character Name</label>
            <input
              type="text"
              value={characterName}
              onChange={e => setCharacterName(e.target.value)}
              className="w-full bg-[#23222a] border border-[#2b2b31] rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Ayan"
            />
          </div>
          <div className="mb-6">
            <FaGhost className="absolute top-10 left-20 text-white/10 text-3xl animate-bounce" />
            <FaGhost className="absolute top-1/4 right-16 text-white/20 text-4xl animate-pulse" />
            <FaGhost className="absolute bottom-20 left-10 text-white/15 text-5xl animate-spin-slow" />
            <FaGhost className="absolute top-1/3 left-1/3 text-white/10 text-6xl animate-pulse" />
            <FaGhost className="absolute bottom-32 right-32 text-white/20 text-4xl animate-bounce" />
            <FaGhost className="absolute top-16 right-1/4 text-white/10 text-3xl animate-spin-slow" />
            <FaGhost className="absolute bottom-10 left-1/2 text-white/15 text-5xl animate-pulse" />
            <FaGhost className="absolute top-2/3 right-1/4 text-white/20 text-6xl animate-bounce" />
            <FaGhost className="absolute bottom-1/4 left-1/4 text-white/15 text-4xl animate-pulse" />
            <FaGhost className="absolute top-1/2 right-10 text-white/10 text-3xl animate-spin-slow" />
            <label className="block text-gray-300 mb-2">Trigger Name</label>
            <input
              type="text"
              value={triggerName}
              onChange={e => setTriggerName(e.target.value)}
              className="w-full bg-[#23222a] border border-[#2b2b31] rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Ayan.1802"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Upload Images</label>
            <p className="text-xs text-gray-400 mb-2">
              Upload up to 10 images to generate characters for your story
            </p>
            <div className="border-2 border-dashed border-purple-500 rounded-xl p-6 flex flex-col items-center justify-center bg-[#23222a]">
              <UploadCloud className="h-10 w-10 text-purple-400 mb-2" />
              <p className="text-white font-semibold mb-2">
                Drag &amp; Drop Images Here
              </p>
              <p className="text-xs text-gray-400 mb-3">
                or click to browse files (JPG, PNG, max 5MB each)
              </p>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition">
                Browse Files
              </button>
            </div>
          </div>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-semibold transition-colors mt-4">
            Add Character
          </button>
        </div>
        {/* Right: Stats and Characters */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Stats */}
          <div className="flex gap-6 mb-2">
            <div className="flex-1 bg-gradient-to-b from-purple-600 to-purple-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-200 text-sm mb-1">Characters Generated</div>
                <div className="text-3xl font-bold text-white">40</div>
              </div>
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 bg-gradient-to-b from-purple-600 to-purple-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-200 text-sm mb-1">Credits</div>
                <div className="text-3xl font-bold text-white">200</div>
              </div>
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
          {/* Generated Characters */}
          <div className="bg-[#19181e] rounded-2xl p-6">
            <h2 className="text-lg text-white font-semibold mb-4">Generated Characters</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              {characters.map((char, idx) => (
                <div key={idx} className="bg-[#23222a] rounded-xl p-4 flex flex-col items-center">
                  <img
                    src={char.img}
                    alt={char.name}
                    className="w-28 h-28 rounded-lg object-cover mb-3"
                  />
                  <div className="text-white font-semibold">{char.name}</div>
                  <div className="text-purple-400 text-sm mb-2">{char.trigger}</div>
                  <button className="flex items-center gap-1 text-gray-300 hover:text-purple-400 text-sm font-medium">
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDump;
