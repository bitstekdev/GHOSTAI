import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import { FaGhost } from 'react-icons/fa';
import GhostSidebar from './GhostSidebar';
import Logo from "../../assets/images/logo.gif";


const GenerateStory = () => {
  const [genre, setGenre] = useState('');
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [storyLength] = useState('3-5 Pages');
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [answers, setAnswers] = useState({});
  const questions = [
    "What moral or message should readers take away?",
    "What is the main conflict or challenge?",
    "How should the story end?",
    "What is the setting of the story?",
    "What emotional tone should the story have?",
    "Are there any specific plot twists?",
    "What are the character relationships?",
    "Any specific cultural elements to include?",
    "What age group is the story for?",
    "Any specific themes to emphasize?"
  ];

  const navigate = useNavigate();

  const genres = [
    'Family',
    'Romance',
    'Adventure',
    'Personalized Storybook',
    'Child-Birthday'
  ];

  return (
    <div className="flex min-h-screen">
      <GhostSidebar />
        <main className="flex-1 bg-[#0b0b0d] min-h-screen text-white relative">
        {!showQuestions && (
          <div className="p-8 relative">
            {/* Background Ghost Animations (scaled 1.3x) */}
      {
        (() => {
          const ghostClasses = [
            "absolute top-10 left-15 text-white/10 text-5xl animate-bounce",
            "absolute top-1/4 right-10 text-white/20 text-6xl animate-pulse",
            "absolute bottom-20 left-10 text-white/15 text-7xl animate-spin-slow",
            "absolute top-1/3 left-1/8 text-white/10 text-8xl animate-pulse",
            "absolute bottom-32 right-40 text-white/20 text-6xl animate-bounce",
            "absolute top-16 right-1/6 text-white/10 text-5xl animate-spin-slow",
            "absolute bottom-10 left-1/6 text-white/15 text-7xl animate-pulse",
            "absolute top-2/3 right-1/7 text-white/20 text-8xl animate-bounce",
            "absolute bottom-1/4 left-1/10 text-white/15 text-6xl animate-pulse",
            "absolute top-1/2 right-15 text-white/10 text-5xl animate-spin-slow",
          ];

          // define offsets for each ghost to avoid "ghostOffsets is not defined"
          const ghostOffsets = [0, -5, 10, -8, 5, 0, 12, -6, 3, 0];

          return ghostClasses.map((cls, i) => (
            <FaGhost
              key={i}
              className={cls}
              style={{ transform: `translateX(${ghostOffsets[i] ?? 0}%)` }}
            />
          ));
        })()
      }

            <div className="max-w-3xl mx-auto relative">
              <div className="flex items-center justify-center gap-3 p-6 border-b border-[#1c1c1c]">
                <img src={Logo} alt="GHOST.ai Logo" className="h-18 rounded-md" style={{ transform: 'scale(1.2)', transformOrigin: 'center' }} />
                <h1 className="text-5xl font-bold text-white tracking-wide" style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}>GHOST.ai</h1>
              </div>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <span className="text-purple-500">✎</span> Story Details
                </h1>
              </div>

              {/* Form */}
              <div className="space-y-8 text-[25px]">
                {/* Story Title */}
                <div className="space-y-2">
                  <label className="block text-gray-200">Story Title</label>
                  <input
                    type="text"
                    placeholder="ex."
              className="w-full bg-[#1c1c20] border border-[#2b2b31] rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          {/* Genre Dropdown */}
          <div className="space-y-2">
            <label className="block text-gray-200">Genre</label>
            <div className="relative">
              <button
                onClick={() => setIsGenreOpen(prev => !prev)}
                className="w-full bg-[#1c1c20] border border-[#2b2b31] rounded-lg p-3 text-left flex items-center justify-between hover:border-purple-500 transition-colors"
              >
                <span className="text-gray-400">{genre || 'Select genre'}</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
              {isGenreOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1c1c20] border border-[#2b2b31] rounded-lg py-2 z-50">
                  {genres.map((g) => (
                    <button
                      key={g}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#2a1f4f] hover:text-white transition-colors"
                      onClick={() => {
                        setGenre(g);
                        setIsGenreOpen(false);
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Story Length Dropdown */}
          <div className="space-y-2">
            <label className="block text-gray-200">Story Length</label>
            <div className="relative">
              <button
                className="w-full bg-[#1c1c20] border border-[#2b2b31] rounded-lg p-3 text-left flex items-center justify-between hover:border-purple-500 transition-colors"
              >
                <span className="text-gray-400">{storyLength}</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Select Characters */}
          {/* <div className="space-y-2">
            <label className="block text-gray-200">Select Characters</label>
            <button
              onClick={() => setShowCharacterModal(true)}
              className="w-full bg-[#1c1c20] border border-[#2b2b31] rounded-lg p-3 text-left text-gray-400 hover:border-purple-500 transition-colors"
            >
              {selectedCharacters.length > 0 
                ? `${selectedCharacters.length} characters selected`
                : 'Select Characters'
              }
            </button>
          </div> */}

          {/* Character Selection Modal */}
          {showCharacterModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
              <div className="bg-[#1c1c20] rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
                {/* <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Select Characters</h2>
                  <button 
                    onClick={() => setShowCharacterModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div> */}
                
                {/* Newly Added Characters */}
                <div className="mb-6">
                  <h3 className="text-gray-300 mb-3">Newly Added Characters</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Saketh', 'Lohith'].map((character) => (
                      <button
                        key={character}
                        onClick={() => {
                          if (selectedCharacters.includes(character)) {
                            setSelectedCharacters(prev => prev.filter(c => c !== character));
                          } else {
                            setSelectedCharacters(prev => [...prev, character]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full border ${
                          selectedCharacters.includes(character)
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-[#2b2b31] text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        {character}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Previous Characters */}
                <div className="mb-6">
                  <h3 className="text-gray-300 mb-3">Previous Characters</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Lohith', 'Marshall', 'Tony Stark'].map((character) => (
                      <button
                        key={character}
                        onClick={() => {
                          if (selectedCharacters.includes(character)) {
                            setSelectedCharacters(prev => prev.filter(c => c !== character));
                          } else {
                            setSelectedCharacters(prev => [...prev, character]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full border ${
                          selectedCharacters.includes(character)
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-[#2b2b31] text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        {character}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    className="px-4 py-2 border border-[#2b2b31] rounded-lg text-gray-300 hover:border-purple-500 flex items-center gap-2"
                  >
                    <span>Add Character</span>
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCharacterModal(false)}
                      className="px-4 py-2 border border-[#2b2b31] rounded-lg text-gray-300 hover:border-purple-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowCharacterModal(false)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="pt-4">
            <button
              onClick={() => setShowQuestions(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-semibold transition-colors"
            >
              Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showQuestions && (
        <div className="fixed inset-0 bg-[#0b0b0d] flex z-50">
          <GhostSidebar />
          {/* Main Content */}
          <div className="flex-1 ml-80 flex flex-col relative overflow-hidden">
            {/* Background Ghost Animations */}
            <FaGhost className="absolute top-1/5 right-16 text-white/20 text-7xl animate-pulse" style={{ transform: 'scale(1.3)' }} />
            <FaGhost className="absolute bottom-25 left-10 text-white/15 text-5xl animate-spin-slow" style={{ transform: 'scale(1.3)' }} />
            <FaGhost className="absolute top-2/5 left-1/3 text-white/10 text-7xl animate-pulse" style={{ transform: 'scale(1.3)' }} />
            <FaGhost className="absolute bottom-32 right-32 text-white/20 text-6xl animate-bounce" style={{ transform: 'scale(1.3)' }} />
            <FaGhost className="absolute top-25 right-1/4 text-white/10 text-5xl animate-spin-slow" style={{ transform: 'scale(1.3)' }} />
            <FaGhost className="absolute bottom-40 left-1/2 text-white/15 text-7xl animate-pulse" style={{ transform: 'scale(1.3)' }} />
            <FaGhost className="absolute top-2/4 right-1/4 text-white/20 text-5xl animate-bounce" style={{ transform: 'scale(1.3)' }} />
            <FaGhost className="absolute bottom-1/6 left-1/4 text-white/15 text-6xl animate-pulse" style={{ transform: 'scale(1.3)' }} />
            <FaGhost className="absolute top-1/9 right-10 text-white/10 text-5xl animate-spin-slow" style={{ transform: 'scale(1.3)' }} />

            {/* Header */}
            <div className="bg-[#1c1c20] border-b border-[#2b2b31] p-4 relative z-10">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-purple-500">✎</span> Story Questions
              </h1>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
              {questions.slice(0, currentStep + 1).map((question, index) => (
                <div key={index} className="space-y-4">
                  {/* Question (left side) */}
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="bg-[#1c1c20] rounded-2xl rounded-tl-none p-4 text-white shadow-lg text-lg">
                      {question}
                    </div>
                  </div>

                  {/* Answer (right side) - only show if answered */}
                  {answers[index] && (
                    <div className="flex items-start justify-end gap-2">
                      <div className="bg-purple-600 rounded-2xl rounded-tr-none p-4 text-white max-w-[80%] shadow-lg text-lg">
                        {answers[index]}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-[#1c1c20] border-t border-[#2b2b31] p-4 relative z-10">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={answers[currentStep] || ''}
                  onChange={(e) => setAnswers(prev => ({...prev, [currentStep]: e.target.value}))}
                  className="flex-1 bg-[#0b0b0d] border border-[#2b2b31] rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none text-lg"
                />
                <button
                  onClick={() => {
                    if (answers[currentStep]) {
                      if (currentStep < questions.length - 1) {
                        setCurrentStep(prev => prev + 1);
                      }
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors flex items-center gap-2"
                >
                  <span>Send</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    // navigate to the result page (route includes GhostSidebar)
                    navigate('/generate/result');
                  }}
                  className="bg-[#2b2b31] hover:bg-[#3b3b41] text-white rounded-lg px-6 py-3 font-semibold transition-colors flex items-center gap-2"
                >
                  <span>Finish</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default GenerateStory;