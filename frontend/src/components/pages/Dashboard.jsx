// import React from 'react';
// import { RefreshCcw, CreditCard, Truck } from 'lucide-react';

// // Dashboard Page
// const Dashboard = () => {
//     return (
//         <div className="p-4 md:p-8">
//             <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Welcome Rabia</h1>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
//                     <h3 className="text-white text-sm mb-2">Total Stories Generated</h3>
//                     <div className="flex items-end justify-between">
//                         <p className="text-5xl font-bold text-white">0</p>
//                         <div className="flex gap-1 items-end h-16">
//                             {[40, 60, 50, 70, 55, 80, 65, 75].map((h, i) => (
//                                 <div key={i} className="w-2 bg-purple-300 rounded" style={{ height: `${h}%` }} />
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
//                     <div className="flex items-center justify-between mb-2">
//                         <h3 className="text-white text-sm">Stories in Progress</h3>
//                         <RefreshCcw size={20} className="text-gray-400" />
//                     </div>
//                     <p className="text-5xl font-bold text-white">0</p>
//                 </div>

//                 <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
//                     <div className="flex items-center justify-between mb-2">
//                         <h3 className="text-white text-sm">Credits</h3>
//                         <CreditCard size={20} className="text-gray-400" />
//                     </div>
//                     <p className="text-5xl font-bold text-white">200</p>
//                 </div>

//                 <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
//                     <div className="flex items-center justify-between mb-2">
//                         <h3 className="text-white text-sm">Orders Dispatched</h3>
//                         <Truck size={20} className="text-gray-400" />
//                     </div>
//                     <p className="text-5xl font-bold text-white">0</p>
//                 </div>
//             </div>

//             <div className="bg-gray-800 rounded-xl p-6">
//                 <h2 className="text-xl text-gray-300 mb-4">Last Working Story</h2>
//                 {[1, 2, 3, 4].map((i) => (
//                     <div key={i} className="bg-gray-900 rounded-lg p-4 mb-3 flex items-center justify-between">
//                         <div>
//                             <h3 className="text-white font-semibold">
//                                 {i % 2 === 0 ? 'The Secret Doorway' : 'Shadows Under the Silver Moon'}
//                             </h3>
//                             <p className="text-purple-400 text-sm">Child Birthday • 1d ago</p>
//                             <p className="text-gray-400 text-sm">Story in Progress</p>
//                         </div>
//                         <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
//                             Open
//                         </button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Dashboard;


import React, { useEffect, useState } from 'react';
import { RefreshCcw, CreditCard, Truck, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';
import { AppContext } from '../../context/AppContext';
import api from '../../services/axiosInstance';
import { useTourContext } from '../../context/TourContext';
import { dashboardTourSteps, tourStyles } from '../../config/tourSteps';

const Dashboard = () => {
    const { userData } = React.useContext(AppContext);
    const navigate = useNavigate();
    
    const [allStories, setAllStories] = useState([]);
    const [storiesInProgress, setStoriesInProgress] = useState([]);
    const [completedStories, setCompletedStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Use tour context
    const {
        run,
        stepIndex,
        startOnboardingTour,
        handleTourCallback: contextHandleCallback,
        shouldShowOnboardingTour,
        activeTour
    } = useTourContext();

    // Only run tour on dashboard if it's the onboarding tour
    const shouldRunTourOnThisPage = activeTour === 'onboarding' && 
        window.location.pathname === '/dashboard';

    // Fetch stories from API
    useEffect(() => {
        const fetchStories = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await api.get('/api/v1/story/my-stories', {
                    params: { page: 1, limit: 10 },
                });

                const stories = res.data?.data?.stories || [];
                setAllStories(stories);

                // Classify stories based on step
                const { inProgress, completed } = stories.reduce(
                    (acc, story) => {
                        if (story.step < 4) {
                            // Story not fully generated yet
                            acc.inProgress.push(story);
                        } else {
                            // Step 4 or more → story text is generated
                            acc.completed.push(story);
                        }
                        return acc;
                    },
                    { inProgress: [], completed: [] }
                );

                setStoriesInProgress(inProgress);
                setCompletedStories(completed);
            } catch (err) {
                console.error('Error fetching stories:', err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to load stories'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    // Auto-start tour for first-time users on Dashboard
    useEffect(() => {
        if (shouldShowOnboardingTour() && !loading) {
            const timer = setTimeout(() => {
                startOnboardingTour();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [shouldShowOnboardingTour, startOnboardingTour, loading]);

    const handleTourCallback = (data) => {
        const { status, type } = data;
        
        // Navigate to Generate Story when dashboard tour finishes
        if (type === 'tour:end' || status === 'finished') {
            setTimeout(() => {
                navigate('/generatestory');
            }, 500);
        }
        
        contextHandleCallback(data);
    }

    // Legacy auto-start tour (useTour) removed; using TourContext hook above

    const getResumeRoute = (story) => {
        const sid = story?._id;
        if (!sid) return '/generatestory';

        if (story.step <= 2) return `/questioner/${sid}`;
        if (story.step === 3) return `/templateselection/${sid}`;

        // step >= 4 → open flipbook
        return `/flipbook/${sid}`;
    };

    const handleOpenStory = (story) => {
        navigate(getResumeRoute(story));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1d ago';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    };

                return (
            <div className="p-4 md:p-8">
                {/* Joyride Tour Component */}
                <Joyride
                    steps={dashboardTourSteps}
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
                        last: 'Next Page',
                        next: 'Next',
                        skip: 'Skip Tour',
                    }}
                />

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        Welcome {userData?.name || 'Guest'}
                    </h1>
                    
                    {/* Tour Trigger Button */}
                    <button
                        onClick={startOnboardingTour}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg transition-colors"
                        title="Show dashboard tour"
                    >
                        <Info size={18} />
                        <span className="hidden md:inline">Start Tour</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="total-stories bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
                        <h3 className="text-white text-sm mb-2">Total Stories Generated</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-5xl font-bold text-white">{allStories.length}</p>
                            <div className="flex gap-1 items-end h-16">
                                {[40, 60, 50, 70, 55, 80, 65, 75].map((h, i) => (
                                    <div key={i} className="w-2 bg-purple-300 rounded" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="stories-in-progress bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white text-sm">Stories in Progress</h3>
                            <RefreshCcw size={20} className="text-gray-400" />
                        </div>
                        <p className="text-5xl font-bold text-white">{storiesInProgress.length}</p>
                    </div>

                    <div className="credits-card bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white text-sm">Credits</h3>
                            <CreditCard size={20} className="text-gray-400" />
                        </div>
                        <p className="text-5xl font-bold text-white">{userData?.credits || 0}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white text-sm">Orders Dispatched</h3>
                            <Truck size={20} className="text-gray-400" />
                        </div>
                        <p className="text-5xl font-bold text-white">{userData?.ordersDispatched || 0}</p>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                    <h2 className="text-xl text-gray-300 mb-4">Recent Stories</h2>
                    {loading && (
                        <p className="text-gray-400">Loading stories...</p>
                    )}
                    
                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}
                    
                    {!loading && !error && allStories.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">No stories yet. Start creating your first story!</p>
                            <button 
                                onClick={() => navigate('/generatestory')}
                                className="generate-story-button bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                            >
                                Create Your First Story
                            </button>
                        </div>
                    )}
                    
                    {!loading && !error && allStories.slice(0, 4).map((story) => (
                        <div key={story._id} className="story-item bg-gray-900 rounded-lg p-4 mb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-semibold">
                                    {story.title || 'Untitled Story'}
                                </h3>
                                <p className="text-purple-400 text-sm">
                                    {story.genre || 'Unknown Genre'} • {formatDate(story.createdAt)}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {story.step < 4 ? 'Story in Progress' : 'Story Completed'}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleOpenStory(story)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                {story.step < 4 ? 'Continue' : 'Open'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
};

export default Dashboard;