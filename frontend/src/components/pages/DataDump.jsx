import { useState } from "react";
import { User, DollarSign, UploadCloud, Edit2 } from "lucide-react";
import { FaGhost} from "react-icons/fa";


const authorStyles = [
  {
    name: "Chetan Bhagat",
    pen: "Chetan Bhagat",
    genre: "Romance",
    color: "bg-purple-400",
  },
  {
    name: "Stephen King",
    pen: "Richard Bachman",
    genre: "Horror",
    color: "bg-cyan-600",
  },
  {
    name: "J. K. Rowling",
    pen: "J. K. Rowling",
    genre: "",
    color: "bg-pink-400",
  },
  {
    name: "Sudha Murty",
    pen: "Sudha Murty",
    genre: "",
    color: "bg-yellow-300",
  },
];

const DataDump = () => {
  const [authorName, setAuthorName] = useState("");
  const [penName, setPenName] = useState("");
  const [genre, setGenre] = useState("");

  return (
    <div className="flex-1 bg-[#0b0b0d] min-h-screen flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-white mb-2 w-full text-center">Data Dump</h1>
      <p className="text-gray-400 mb-8 w-full text-center">
        Upload your favorite author’s work and generate stories in their signature style
      </p>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
        {/* Left: Form */}
        <div className="bg-[#19181e] rounded-2xl p-8 flex-1 max-w-lg w-full">
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Author Name</label>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              className="w-full bg-[#23222a] border border-[#2b2b31] rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Chris Williams"
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
            <label className="block text-gray-300 mb-2">Pen Name</label>
            <input
              type="text"
              value={penName}
              onChange={e => setPenName(e.target.value)}
              className="w-full bg-[#23222a] border border-[#2b2b31] rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Chris Williams"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Genre</label>
            <input
              type="text"
              value={genre}
              onChange={e => setGenre(e.target.value)}
              className="w-full bg-[#23222a] border border-[#2b2b31] rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Fantasy"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Upload PDFs</label>
            <p className="text-xs text-gray-400 mb-2">
              Upload PDF to add GPT
            </p>
            <div className="border-2 border-dashed border-purple-500 rounded-xl p-6 flex flex-col items-center justify-center bg-[#23222a]">
              <UploadCloud className="h-10 w-10 text-purple-400 mb-2" />
              <p className="text-white font-semibold mb-2">
                Drag &amp; Drop PDFs Here
              </p>
              <p className="text-xs text-gray-400 mb-3">
                or click to browse files (PDF, max 20MB each)
              </p>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition">
                Browse Files
              </button>
            </div>
          </div>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-semibold transition-colors mt-4">
            Train Author Style
          </button>
        </div>
        {/* Right: Stats and Author Styles */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Stats */}
          <div className="flex gap-6 mb-2">
            <div className="flex-1 bg-gradient-to-b from-purple-600 to-purple-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <div className="text-gray-200 text-sm mb-1">Total Author Styles</div>
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
          {/* Author Styles */}
          <div className="bg-[#19181e] rounded-2xl p-6">
            <h2 className="text-lg text-white font-semibold mb-4">Author Styles</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              {authorStyles.map((author, idx) => (
                <div key={idx} className={`rounded-xl p-4 flex flex-col items-start ${author.color}`}>
                  <div className="text-white font-semibold text-lg mb-1">{author.name}</div>
                  {author.pen && (
                    <div className="text-gray-900 text-sm mb-1">{author.pen}</div>
                  )}
                  {author.genre && (
                    <div className="text-gray-900 text-sm mb-2">{author.genre}</div>
                  )}
                  <button className="flex items-center gap-1 text-gray-900 hover:text-purple-800 text-sm font-medium mt-2">
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

export default DataDump;
