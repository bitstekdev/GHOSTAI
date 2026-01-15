import React, { useEffect, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';
import api from '../../services/axiosInstance';
import { useTourContext } from '../../context/TourContext';
import { storiesTourSteps, tourStyles } from '../../config/tourSteps';
import StoryMenu from '../../utils/StoryMenu';
import RenameStoryModal from '../../utils/RenameStoryModal';

const Stories = () => {
  const navigate = useNavigate();
  const navigateToGenerate = () => navigate('/generatestory');

  const [allStories, setAllStories] = useState([]);
  const [storiesInProgress, setStoriesInProgress] = useState([]);
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // menu state ----------------
const [openMenuId, setOpenMenuId] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [storyToDelete, setStoryToDelete] = useState(null);
const [delLoading, setDelLoading] = useState(false);
const [showRenameModal, setShowRenameModal] = useState(false);
const [storyToRename, setStoryToRename] = useState(null);




  const formatGenres = (s) => {
    if (!s) return "Unknown Genre";
    if (Array.isArray(s.genres) && s.genres.length) return s.genres.join(", ");
    return s.genre || "Unknown Genre";
  };

  // Use tour context
  const {
    run,
    stepIndex,
    handleTourCallback: contextHandleCallback,
    activeTour,
  } = useTourContext();

  // Only run tour on this page if it's the onboarding tour
  const shouldRunTourOnThisPage =
    activeTour === "onboarding" && window.location.pathname === "/stories";

  const handleTourCallback = (data) => {
    const { status, type } = data;

    // Tour ends here - mark as complete
    if (type === "tour:end" || status === "finished" || status === "skipped") {
      localStorage.setItem("tour_onboarding_completed", "true");
    }

    contextHandleCallback(data);
  };

  // 🔹 Fetch from /my-stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/api/v1/story/my-stories", {
          params: { page: 1, limit: 12 },
        });

        const stories = res.data?.data?.stories || [];
        setAllStories(stories);

        // Use only STEP to classify generation progress
        const { inProgress, completed } = stories.reduce(
          (acc, story) => {
            // Still in creation flow (Q&A, template, title)
            if (story.step <= 4) {
              acc.inProgress.push(story);
              return acc;
            }

            // Step 5: Book generation running
            if (story.step === 5 && story.currentJob) {
              acc.inProgress.push(story);
              return acc;
            }

            // Step 6: Fully completed
            if (story.step === 6 && !story.currentJob) {
              acc.completed.push(story);
              return acc;
            }

            // Fallback safety
            acc.inProgress.push(story);
            return acc;
          },
          { inProgress: [], completed: [] }
        );

        setStoriesInProgress(inProgress);
        setCompletedStories(completed);
      } catch (err) {
        console.error("Error fetching stories:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load stories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);


// resume route logic----------------
      const getResumeRoute = (story) => {
      const sid = story?._id;
      if (!sid) return "/generatestory";

      if (story.step <= 2) return `/questioner/${sid}`;
      if (story.step === 3) return `/templateselection/${sid}`;
      if (story.step === 4) return `/titlegenerator/${sid}`;

      // if failed during book generation
      if (story.step === 5 && story.status === "failed" && !story.currentJob) {
        return `/titlegenerator/${sid}`;
      }

      // Step 5: Book generation in progress
      if (story.step === 5 && story.currentJob) {
        return `/generatorPage/${sid}?jobId=${story.currentJob}`;
      }

      // Step 5 completed → flipbook
      if (story.step === 6 && !story.currentJob) {
        return `/flipbook/${sid}`;
      }

      return `/generatestory`;
    };

  // Handle Continue Button
  const handleContinue = (story) => {
    // If in questioner phase (step 2), load conversation into localStorage
    if (story.step === 2 && story.conversation && story.conversation.length > 0) {
      localStorage.setItem(
        'conversationData',
        JSON.stringify({
          storyId: story._id,
          conversation: story.conversation,
        })
      );
    }
    
    // Navigate to the correct step
    navigate(getResumeRoute(story));
  };

  const handleViewBook = (id) => {
    navigate(`/flipbook/${id}`);
  };

// Delete Story Logic ----------------

const handleDeleteStory = async () => {
  if (!storyToDelete?._id) return;
  setDelLoading(true);
  try {
    await api.delete(`/api/v1/story/${storyToDelete._id}`);

    setStoriesInProgress(prev =>
      prev.filter(s => s._id !== storyToDelete._id)
    );
    setCompletedStories(prev =>
      prev.filter(s => s._id !== storyToDelete._id)
    );

    setShowDeleteModal(false);
    setStoryToDelete(null);
  } catch (err) {
    console.error("Delete failed", err);
    alert("Failed to delete story");
  } finally {
    setDelLoading(false);
  }
};


const handleDeleteClick = (story) => {
  setStoryToDelete(story);
  setShowDeleteModal(true);
};


// Rename Story Logic ----------------
const handleRename = (story) => {
  setStoryToRename(story);
  setShowRenameModal(true);
};

// /--------------------------


  return (
    <div className="flex-1 bg-[#0b0b0d] min-h-screen p-8">
      {/* Joyride Tour Component */}
      <Joyride
        steps={storiesTourSteps}
        run={run && shouldRunTourOnThisPage}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        callback={handleTourCallback}
        styles={tourStyles}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish Tour',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
      
      {/* Stories in Progress */}
      <div className="stories-in-progress-section mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Stories in Progress</h2>
        <div className="space-y-3">
          {storiesInProgress.length === 0 && (
            <p className="text-gray-400">No stories in progress right now.</p>
          )}

          {storiesInProgress.map((story) => (
            <div 
              key={story._id}
              className="bg-[#1c1c1e] rounded-lg p-4 flex items-center justify-between group hover:bg-[#23222a] transition-colors min-h-[64px] md:min-h-[72px] lg:min-h-[80px]"
            >
              <div>
                <h3 className="text-white font-medium">{story.title}</h3>
                <p className="text-purple-400 text-sm">{formatGenres(story)}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Step {story.step} of 6
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleContinue(story)}
                  className="text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Continue <ArrowUpRight className="h-4 w-4" />
                </button>
              <StoryMenu
                  story={story}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onRename={handleRename}
                  onDelete={handleDeleteClick}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Stories Section */}
      <div className="completed-stories-section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Stories</h2>
          <button 
            onClick={navigateToGenerate}
            className="create-new-story-button bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Generate Story
          </button>
        </div>

        {loading && (
          <p className="text-gray-400">Loading stories...</p>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedStories.map((story) => (
              <div 
                key={story._id}
                className="bg-[#1c1c1e] rounded-xl relative overflow-hidden hover:ring-2 hover:ring-purple-500/20 transition-all w-full"
              >
                {/* Cover image from DB */}
                <div className="w-full h-full md:h-[260px] lg:h-[320px] bg-purple-900/20">
                  <img
                    src={
                      story.coverImage?.s3Url ||
                      story.coverImage?.url ||
                      '/fallback-cover.jpg'
                    }
                    alt={story.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/fallback-cover.jpg';
                    }}
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold mb-2">{story.title}</h3>
                      <StoryMenu
                      story={story}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onRename={handleRename}
                      onDelete={handleDeleteClick}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Genre : {formatGenres(story)}</p>
                    <p className="text-gray-400 text-sm">
                      Story Length: {story.storyLength || `${story.numOfPages || 0} pages`}
                    </p>

                    {Array.isArray(story.characters) && story.characters.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Characters :</p>
                        <div className="flex flex-wrap gap-2">
                          {story.characters.map((char, idx) => (
                            <span 
                              key={idx}
                              className="bg-purple-500/10 text-purple-300 text-xs px-2 py-1 rounded-full"
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {story.status && (
                      <p
                        className={`text-sm ${
                          story.status === 'Ordered'
                            ? 'text-green-400'
                            : story.status === 'Dispatched'
                            ? 'text-blue-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {story.status}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleViewBook(story._id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 mt-4 transition-colors text-sm md:text-base"
                  >
                    View Book
                  </button>
                </div>
              </div>
            ))}

            {completedStories.length === 0 && (
              <p className="text-gray-400 col-span-full">
                No stories yet. Generate your first story!
              </p>
            )}
          </div>
        )}
      </div>


    {/* // delete model////////////////////////////////////// */}

    {showDeleteModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-[#1c1c1e] rounded-xl p-6 w-full max-w-sm">
      <h3 className="text-white text-lg font-semibold mb-3">
        Delete Story?
      </h3>

      <p className="text-gray-400 text-sm mb-6">
        Are you sure you want to delete story title:{" "}
        <span className="text-white font-medium">
          {storyToDelete?.title}
        </span>
        ? after this action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 text-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteStory}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
          disabled={delLoading}
        >
          {delLoading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}

{/* // Rename Story Modal///////// */}
{showRenameModal && storyToRename && (
  <RenameStoryModal
    story={storyToRename}
    onClose={() => {
      setShowRenameModal(false);
      setStoryToRename(null);
    }}
    onSuccess={(newTitle) => {
      setStoriesInProgress(prev =>
        prev.map(s =>
          s._id === storyToRename._id ? { ...s, title: newTitle } : s
        )
      );
      setCompletedStories(prev =>
        prev.map(s =>
          s._id === storyToRename._id ? { ...s, title: newTitle } : s
        )
      );
    }}
  />
)}

    </div>
  );
};

export default Stories;