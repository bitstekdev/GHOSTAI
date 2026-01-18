import React, { useEffect, useState, useContext } from "react";
import { RefreshCcw, CreditCard, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import api from "../services/axiosInstance";

const Dashboard = () => {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();

  const [allStories, setAllStories] = useState([]);
  const [storiesInProgress, setStoriesInProgress] = useState([]);
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/api/v1/story/my-stories", {
          params: { page: 1, limit: 10 },
        });

        const stories = res.data?.data?.stories || [];
        setAllStories(stories);

        const { inProgress, completed } = stories.reduce(
          (acc, story) => {
            if (story.step < 5) acc.inProgress.push(story);
            else acc.completed.push(story);
            return acc;
          },
          { inProgress: [], completed: [] }
        );

        setStoriesInProgress(inProgress);
        setCompletedStories(completed);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load stories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const getResumeRoute = (story) => {
    const sid = story?._id;
    if (!sid) return "/generatestory";

    if (story.step <= 2) return `/questioner/${sid}`;
    if (story.step === 3) return `/templateselection/${sid}`;
    if (story.step === 4) return `/titlegenerator/${sid}`;
    if (story.step === 5 && story.currentJob)
      return `/generatorPage/${sid}?jobId=${story.currentJob}`;
    if (story.step === 6) return `/flipbook/${sid}`;

    return "/generatestory";
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "1d ago";
    if (diff < 7) return `${diff}d ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    return `${Math.floor(diff / 30)}mo ago`;
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
        Welcome {userData?.name || "Guest"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-purple-700 rounded-xl p-6">
          <h3 className="text-white text-sm mb-2">Total Stories</h3>
          <p className="text-5xl font-bold text-white">{allStories.length}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white text-sm mb-2">Stories in Progress</h3>
          <p className="text-5xl font-bold text-white">
            {storiesInProgress.length}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white text-sm mb-2">Credits</h3>
          <p className="text-5xl font-bold text-white">{userData?.credits || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white text-sm mb-2">Orders Dispatched</h3>
          <p className="text-5xl font-bold text-white">
            {userData?.ordersDispatched || 0}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl text-gray-300 mb-4">Recent Stories</h2>

        {loading && <p className="text-gray-400">Loading stories...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && allStories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No stories yet.</p>
            <button
              onClick={() => navigate("/generatestory")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
            >
              Create Your First Story
            </button>
          </div>
        )}

        {allStories.slice(0, 4).map((story) => (
          <div
            key={story._id}
            className="bg-gray-900 rounded-lg p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h3 className="text-white font-semibold">
                {story.title || "Untitled Story"}
              </h3>
              <p className="text-purple-400 text-sm">
                {story.genres?.join(", ") || "Unknown Genre"} •{" "}
                {formatDate(story.createdAt)}
              </p>
            </div>
            <button
              onClick={() => navigate(getResumeRoute(story))}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              {story.step <= 5 ? "Continue" : "Open"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
