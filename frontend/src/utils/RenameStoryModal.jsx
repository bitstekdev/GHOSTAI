import { useEffect, useState } from "react";
import api from "../services/axiosInstance";
import { Loader2, Sparkles } from "lucide-react";

const RenameStoryModal = ({ story, onClose, onSuccess }) => {
  const [selectedTitle, setSelectedTitle] = useState(story.title || "");
  const [aiTitles, setAiTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const canGenerateAI = story.step >= 5;

  // Generate titles
const generateTitles = async (isRegenerate = false) => {
  try {
    setLoadingTitles(true);
    setAiTitles([]);

    const url = isRegenerate
      ? "/api/v1/story/titles/regenerate"
      : "/api/v1/story/titles/generate";

    const payload = {
      storyId: story._id,
      selectedTitle,
      story: story.gist,
      genres: story.genres || (story.genre ? [story.genre] : []),
      previousTitles: isRegenerate ? aiTitles : undefined
    };

    const res = await api.post(url, payload);

    setAiTitles(res.data.data.titles || []);
    setRegenerate(true);
  } catch (err) {
    console.error("Title generation failed", err);
  } finally {
    setLoadingTitles(false);
  }
};


  // Save title
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await api.patch(`/api/v1/story/rename/${story._id}`, {
        title: selectedTitle
      });

      onSuccess(selectedTitle);
      onClose();
    } catch (err) {
      console.error("Rename failed", err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1c1c1e] rounded-xl p-6 w-full max-w-lg">
        <h3 className="text-white text-xl font-semibold mb-4">
          Rename Story
        </h3>

        {/* Title input */}
        <input
          className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white mb-4"
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
          placeholder="Enter story title..."
        />

        {/* AI Buttons */}
        {canGenerateAI && (
          <button
            onClick={() => generateTitles(regenerate)}
            disabled={loadingTitles}
            className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 mb-4"
          >
            {loadingTitles ? (
              <>
                <Loader2 className="animate-spin" />
                {regenerate ? "Regenerating..." : "Generating..."}
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {regenerate ? "Regenerate Better Titles" : "Generate Better Titles"}
              </>
            )}
          </button>
        )}

        {/* AI Titles */}
        {aiTitles.length > 0 && (
          <div className="space-y-2 mb-4">
            {aiTitles.map((t, i) => (
              <div
                key={i}
                onClick={() => setSelectedTitle(t)}
                className={`p-2 rounded-lg cursor-pointer border
                ${
                  selectedTitle === t
                    ? "border-purple-500 bg-gray-700"
                    : "border-gray-700 bg-gray-800"
                }`}
              >
                {t}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            {saveLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameStoryModal;
