import React, { useState } from "react";
import api from "../../services/axiosInstance";
import { X } from "lucide-react";

// Face Swap Modal Component
const EditModal = ({ page, onClose, onUpdated }) => {
const [prompt, setPrompt] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleApply = async () => {
  try {
    setLoading(true);
    setError("");

    const ImageID = page.characterImage._id;

    const res = await api.post("/api/v1/images/edit", {
      characterImageId: ImageID,
      prompt,
    });

    if (res.data?.success) {
      await onUpdated?.();
      onClose();
    } else {
      setError(res.data?.message);
    }
  } catch (err) {
    console.error(err);
    setError("Edit failed");
  } finally {
    setLoading(false);
  }
};



  const currentImageUrl = page.characterImage?.s3Url;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-2xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4">
          Edit Image (Page {page.pageNumber})
        </h2>

        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-300">Current image:</p>
          {currentImageUrl ? (
            <div className="relative">
              <img
                src={currentImageUrl}
                alt={`Page ${page.pageNumber}`}
                className="w-full max-h-64 object-contain rounded-lg bg-black/40"
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                  <img
                    src="/src/assets/images/logo.gif"
                    alt="Loading..."
                    className="w-25 h-25"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500">
              No character image on this page.
            </div>
          )}
        </div>

       <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Enter Prompt to Edit Image:
          </label>
          <textarea
            rows={4}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>

       {/*  */}
        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium"
              disabled={loading}>
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold disabled:opacity-60"
              disabled={loading || !currentImageUrl}>
              {loading ? "Editing..." : "Apply Edits"}
            </button>
          </div>
      </div>
    </div>
  );
};

export default EditModal;