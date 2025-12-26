import React, { useState } from "react";
import api from "../../services/axiosInstance";
import { X, History, RotateCcw } from "lucide-react";

const ImageHistoryModal = ({ page, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRevert = async (versionIndex) => {
    if (!page.characterImage?._id) {
      setError("No image ID found");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/v1/images/revert", {
        imageId: page.characterImage._id,
        versionIndex,
      });

      if (res.data?.success) {
        await onUpdated?.();
        onClose();
      } else {
        setError(res.data?.message || "Revert failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to revert image");
    } finally {
      setLoading(false);
    }
  };

  const currentImage = page.characterImage;
  const oldImages = currentImage?.oldImages || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-2xl w-full max-w-4xl max-h-[90vh] p-6 relative overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <History size={24} className="text-purple-400" />
          <h2 className="text-2xl font-bold">
            Image History - Page {page.pageNumber}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Current Image */}
          <div className="border-2 border-purple-500 rounded-lg p-4 bg-gray-800/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                CURRENT
              </span>
              <span className="text-sm text-gray-400">
                {currentImage?.metadata?.model || "Active Version"}
              </span>
            </div>
            <img
              src={currentImage?.s3Url}
              alt="Current version"
              className="w-full max-h-64 object-contain rounded-lg bg-black/40"
            />
          </div>

          {/* Previous Versions */}
          {oldImages.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-300 mt-6">
                Previous Versions ({oldImages.length})
              </h3>
              {oldImages.map((oldImage, index) => (
                <div
                  key={index}
                  className="border border-gray-700 rounded-lg p-4 bg-gray-800/30 hover:bg-gray-800/50 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-400">
                        Version {oldImages.length - index}
                      </span>
                      <span className="text-xs text-gray-500">
                        {oldImage.version || "archived"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRevert(index)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <RotateCcw size={16} />
                      {loading ? "Reverting..." : "Revert to This"}
                    </button>
                  </div>
                  <img
                    src={oldImage.s3Url}
                    alt={`Version ${index}`}
                    className="w-full max-h-48 object-contain rounded-lg bg-black/40"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6">
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <History size={56} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  No Previous Versions Yet
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  This page hasn't been modified since initial generation
                </p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left">
                  <p className="text-xs text-blue-300 font-medium mb-2">💡 How to create history:</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-4">
                    <li>• Use <strong className="text-white">Face Swap</strong> to replace faces</li>
                    <li>• Use <strong className="text-white">Edit</strong> to modify the image</li>
                    <li>• Use <strong className="text-white">Regenerate</strong> to create a new version</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageHistoryModal;
