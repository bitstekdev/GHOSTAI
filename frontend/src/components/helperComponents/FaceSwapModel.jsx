import React, { useState } from "react";
import api from "../../services/axiosInstance";
import { X } from "lucide-react";

// Face Swap Modal Component
const FaceSwapModal = ({ storyId, page, onClose, onUpdated }) => {
  const [file, setFile] = useState(null);
  const [sourceIndex, setSourceIndex] = useState("");
  const [targetIndex, setTargetIndex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setError("");
  };



const handleApply = async () => {
  if (!file) {
    setError("Please choose a face image to upload.");
    return;
  }

  
  try {
    setLoading(true);
    setError("");


    const formData = new FormData();
    formData.append("source", file);
    formData.append("characterImageId", page.characterImage._id);
    formData.append("source_index", sourceIndex);
    formData.append("target_index", targetIndex);
    formData.append("upscale", 0);
    formData.append("codeformer_fidelity", 0.5);
    formData.append("background_enhance", "true");
    formData.append("face_restore", "true");
    formData.append("face_upsample", "false");
    formData.append("output_format", "PNG");

    const res = await api.post("/api/v1/images/faceswap", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    if (res.data?.success) {
      await onUpdated?.();
      onClose();
    } else {
      setError(res.data?.message);
    }
  } catch (err) {
    console.error(err);
    setError("Face swap failed");
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
          Face Swap (Page {page.pageNumber})
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
          <label className="block text-sm mb-2">
            Upload a face image to swap into this page:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
          />
          {file && (
            <p className="mt-1 text-xs text-gray-400">Selected: {file.name}</p>
          )}
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs mb-1 text-gray-400">
              Number <small>(Current Image face Number)</small>
            </label>
            <input
              type="number"
              min={-1}
              value={sourceIndex}
              onChange={(e) => setSourceIndex(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1 text-gray-400">
              Number <small>(Uploaded Image face Number)</small>
            </label>
            <input
              type="number"
              min={-1}
              value={targetIndex}
              onChange={(e) => setTargetIndex(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <div className="flex justify-between items-center">
          <div className="w-1/2">
            <p className="text-xs text-red-700">
              Note: If Image has one Character → Number is -1, If multiple
              Characters → specify which Character to swap by its Number (0 for
              first, 1 for second, etc.)
            </p>
          </div>
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
              {loading ? "Applying..." : "Apply Face Swap"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceSwapModal;