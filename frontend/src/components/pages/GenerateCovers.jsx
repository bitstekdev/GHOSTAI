import { useState, useContext } from "react";
import { AppContext } from '../../context/AppContext';
import { useParams } from "react-router-dom";
import api from "../../services/axiosInstance";
import { Loader2, Sparkles } from "lucide-react";
import { ProgressStep6 } from "../helperComponents/Steps.jsx";

import coverImg from "../../assets/images/book-pages.png"; 

const GenerateCovers = () => {
  const { storyId } = useParams();
  const { navigateTo } = useContext(AppContext);

  const [loading, setLoading] = useState(false);

  const handleGenerateCovers = async () => {
    try {
      setLoading(true);
        
      const res = await api.post("/api/v1/images/generate-covers", {
        storyId: storyId,
      });
      console.log("Cover generation response:", res.data);

      navigateTo(`/flipbook/${storyId}`);
    } catch (err) {
      console.error("Cover generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center px-6 py-10">
      
      <ProgressStep6 />

      <div className="p-6 py-10 relative max-w-3xl w-full text-white">

        <h1 className="text-3xl font-bold text-purple-400 mb-4">
          Generate Cover Images
        </h1>

        <p className="text-gray-300 mb-6">
          Let the AI design stunning book covers for your story.
        </p>

        {/* BEAUTIFUL PNG IMAGE */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <img
              src={coverImg}
              alt="Book Animation"
              className="w-64 h-auto object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]"
            />
            <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full"></div>
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={handleGenerateCovers}
          disabled={loading}
          className={`w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2
            ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Generating Covers...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate Cover Images
            </>
          )}
        </button>

        {/* LOADING ANIMATION */}
        {loading && (
          <div className="mt-6">
            <p className="text-center text-purple-300 mb-2">
              Creating beautiful covers…✨ Please wait a for 2 to 5 minutes.
            </p>

            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-[scroll_1.5s_linear_infinite]"></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GenerateCovers;
