import React from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const storiesInProgress = [
  {
    title: "Shadows Under the Silver Moon",
    genre: "Fantasy"
  },
  {
    title: "The Secret Doorway",
    genre: "Fantasy"
  },
  {
    title: "The Last Page of Autumn",
    genre: "Fantasy"
  },
  {
    title: "Beneath the Painted Sky",
    genre: "Fantasy"
  }
];

const completedStories = [
  {
    title: "Rainbow Adventure",
    coverImage: "/path-to-rainbow-adventure.jpg",
    genre: "Family",
    storyLength: "3-5 Pages",
    characters: ["Saketh", "Lohith", "Shashi"],
    status: "Ordered"
  },
  {
    title: "Sunny Day Surprise",
    coverImage: "/path-to-sunny-day.jpg",
    genre: "Family",
    storyLength: "3-5 Pages",
    characters: ["Saketh", "Lohith", "Shashi"],
    status: "Dispatched"
  },
  {
    title: "Forest of Wonders",
    coverImage: "/path-to-forest-wonders.jpg",
    genre: "Family",
    storyLength: "3-5 Pages",
    characters: ["Saketh", "Lohith", "Shashi"],
    status: "Ordered"
  }
];

const Stories = () => {
  const navigate = useNavigate();
  const navigateToGenerate = () => navigate('/generate');

  return (
    <div className="flex-1 bg-[#0b0b0d] min-h-screen p-8">
      {/* Stories in Progress */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Stories in Progress</h2>
        <div className="space-y-3">
          {storiesInProgress.map((story, index) => (
            <div 
              key={index}
              className="bg-[#1c1c1e] rounded-lg p-4 flex items-center justify-between group hover:bg-[#23222a] transition-colors"
            >
              <div>
                <h3 className="text-white font-medium">{story.title}</h3>
                <p className="text-purple-400 text-sm">{story.genre}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/generate/preview')}
                  className="text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Continue <ArrowUpRight className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Stories Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Stories</h2>
          <button 
            onClick={navigateToGenerate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Generate Story
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedStories.map((story, index) => (
            <div 
              key={index}
              className="bg-[#1c1c1e] rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500/20 transition-all"
            >
              <div className="aspect-square bg-purple-900/20"></div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{story.title}</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Genre : {story.genre}</p>
                  <p className="text-gray-400 text-sm">Story Length: {story.storyLength}</p>
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
                  {story.status && (
                    <p className={`text-sm ${
                      story.status === 'Ordered' ? 'text-green-400' : 
                      story.status === 'Dispatched' ? 'text-blue-400' : ''
                    }`}>
                      {story.status}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => navigate('/generate/preview')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 mt-4 transition-colors"
                >
                  View Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stories;