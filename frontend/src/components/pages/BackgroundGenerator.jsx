import { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import api from "../../services/axiosInstance";
import { useParams } from "react-router-dom";
import { Loader2, Images, Sparkles } from "lucide-react";
import { ProgressStep5 } from "../helperComponents/Steps.jsx";
import Book from "../../assets/images/book-animation.png";

const BackgroundGenerator = () => {
  const { navigateTo } = useContext(AppContext);
  const { storyId } = useParams();
  const [loading, setLoading] = useState(false);


  const handleGenerateBackgrounds = async () => {
    try {
      setLoading(true);

      const res = await api.post(`/api/v1/images/generate-backgrounds`, {
        storyId: storyId,
      });

      console.log("Background generation response:", res.data);

      // After generation go to next page
      navigateTo(`/generatecovers/${storyId}`);
    } catch (err) {
      console.error("Background generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center px-6 py-10">
      <ProgressStep5 />

      <div className="p-6 py-10 relative max-w-3xl w-full text-white text-center">
        {/* PAGE TITLE */}
        <h1 className="text-3xl font-bold text-purple-400 mb-4">
          Generate Background Images
        </h1>

        <p className="text-gray-300 mb-6">
          AI will generate beautiful backgrounds that match your story scenes.
        </p>

        {/* BOOK FLIP ANIMATION */}
        <div className="flex justify-center">
          <img
            src={Book}
            className="w-52 h-auto mb-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          />
        </div>

        {/* GENERATE BUTTON */}
        <button
          className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          onClick={handleGenerateBackgrounds}
          disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Generating Backgrounds...
            </>
          ) : (
            <>
              <Images size={20} />
              Generate Background Images
            </>
          )}
        </button>

        {/* ANIMATION AFTER CLICK */}
        {loading && (
          <div className="mt-8 text-center">
            <p className="text-purple-300 text-lg mb-3">
              ✨ Creating immersive story scenes... Please wait 2 to 5 minutes.
            </p>

            {/* Smooth progress animation */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-[scroll_1.5s_linear_infinite]"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundGenerator;
