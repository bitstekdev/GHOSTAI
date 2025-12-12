import { useState, useContext } from "react";
import api from "../../services/axiosInstance";
import { PenTool } from "lucide-react";
import { AppContext } from '../../context/AppContext'
import {ProgressStep1} from '../helperComponents/Steps.jsx'

const GenerateStory = () => {
  const {navigateTo} = useContext(AppContext)

  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    length: "3",
    numCharacters: "2",
    characterDetails: [],
  });

  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [charName, setCharName] = useState("");
  const [charDesc, setCharDesc] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Add or Edit Character
  const handleAddCharacter = () => {
    if (!charName.trim() || !charDesc.trim()) return;

    const newChar = { name: charName.trim(), details: charDesc.trim() };

    setFormData((prev) => {
      let updated = [...prev.characterDetails];

      if (editIndex !== null) {
        updated[editIndex] = newChar;
      } else {
        updated.push(newChar);
      }

      return { ...prev, characterDetails: updated };
    });

    setCharName("");
    setCharDesc("");
    setEditIndex(null);
    setShowCharacterForm(false);
  };

  const handleDeleteCharacter = (i) => {
    setFormData((prev) => ({
      ...prev,
      characterDetails: prev.characterDetails.filter((_, idx) => idx !== i),
    }));
  };

  const handleEditCharacter = (i) => {
    const char = formData.characterDetails[i];
    setCharName(char.name);
    setCharDesc(char.details);
    setEditIndex(i);
    setShowCharacterForm(true);
  };


  // Submit Form-------------------------------------
const handleSubmit = async () => {
  console.log("Submitting Form Data:", formData);

  try {
    setLoading(true);
    const response = await api.post("/api/v1/story/start", formData);

    console.log("API Response:", response.data);

    const { storyId, data } = response.data;

    // STORE first question & story ID
    localStorage.setItem(
      "conversationData",
      JSON.stringify({
        storyId,
        conversation: data.conversation, // first question
      })
    );

    // Navigate to Questioner UI
    navigateTo(`/questioner/${storyId}`);

  } catch (error) {
    setMsg(error.response?.data?.message || "An error occurred");
    console.error("Error submitting story:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center px-6 py-10">
      <ProgressStep1 />
    <div className="relative p-6 py-10 max-w-3xl w-full">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-2">
        <PenTool size={32} className="text-purple-500" />
        Story Details
      </h1>

      <div className="space-y-6">

        {/* Story Title */}
        <div>
          <label className="text-white block mb-2">Story Title</label>
          <input
            type="text"
            placeholder="Enter story title"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        {/* Genre */}
        <div>
          <label className="text-white block mb-2">Genre</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
          >
            <option value="">Select genre</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Adventure">Adventure</option>
            <option value="Family">Family</option>
            <option value="Mystery">Mystery</option>
            <option value="Housewarming">Housewarming</option>
            <option value="Corporate Promotion">Corporate Promotion</option>
            <option value="Marriage">Marriage</option>
            <option value="Baby Shower">Baby Shower</option>
            <option value="Birthday">Birthday</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Friends">Friends</option>
          </select>
        </div>

{/* 3 row */}
        <div className="flex justify-center gap-4">
        {/* Story Length */}
          <div className="w-1/2">
          <label className="text-white block mb-2">Story Length</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            value={formData.length}
            onChange={(e) =>
              setFormData({ ...formData, length: e.target.value })
            }
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} Page{(i + 1) > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          </div>
          {/* number of characters */}
          <div className="w-1/2">
          <label className="text-white block mb-2">Number of Characters</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            value={formData.numCharacters}
            onChange={(e) =>
              setFormData({ ...formData, numCharacters: e.target.value })
            }
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} Character{(i + 1) > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          </div>
        </div>

        {/* Character Section */}
        <div className="space-y-3">
          <label className="text-white block mb-2">Character Details</label>

          {/* Pills */}
          <div className="flex flex-wrap gap-2">
            {formData.characterDetails.map((char, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-purple-700 text-white px-3 py-1 rounded-full cursor-pointer"
                onClick={() => handleEditCharacter(i)}
              >
                <span>{char.name}</span>
                <button
                  className="text-red-300 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCharacter(i);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Character Button */}
          {!showCharacterForm && (
            <button
              onClick={() => setShowCharacterForm(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
            >
              + Add Character Details
            </button>
          )}

          {/* Character Add Form */}
          {showCharacterForm && (
            <div className="space-y-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <input
                type="text"
                placeholder="Character Name (e.g., Sreeram)"
                className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded"
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
              />

              <textarea
                placeholder="Character Details (comma separated)"
                className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded"
                rows={3}
                value={charDesc}
                onChange={(e) => setCharDesc(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleAddCharacter}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                >
                  {editIndex !== null ? "Update Character" : "Add Character"}
                </button>

                <button
                  onClick={() => {
                    setShowCharacterForm(false);
                    setCharName("");
                    setCharDesc("");
                    setEditIndex(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
         {msg && <p className="text-red-500">{msg}</p>}

        {/* Submit - aligned to the right */}
        <div className="flex flex-col items-end mt-[-20px]">
          <p className="text-gray-400 text-sm text-right">Let's begin your story</p> 
          <button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 w-1/2 text-white py-3 px-6 rounded-lg mt-4"
          >
            {loading ? "Creating..." : "Next"}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default GenerateStory;
