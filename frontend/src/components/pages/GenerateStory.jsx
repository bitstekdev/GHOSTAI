import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import TemplateSelection from '../pages/TemplateSelection'; // adjust path if needed

const GenerateStory = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    length: '3-5 Pages',
    characters: [],
    familyMembers: '',
    theme: '',
    setting: ''
  });

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  if (step === 1) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-2">
          <PenTool size={32} className="text-purple-500" />
          Story Details
        </h1>

        <div className="space-y-6">
          <div>
            <label className="text-white block mb-2">Story Title</label>
            <input
              type="text"
              placeholder="ex:"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-white block mb-2">Genre</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            >
              <option value="">Select genre</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Adventure">Adventure</option>
              <option value="Family">Family</option>
            </select>
          </div>

          <div>
            <label className="text-white block mb-2">Story Length</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: e.target.value })}
            >
              <option value="3-5 Pages">3-5 Pages</option>
              <option value="5-10 Pages">5-10 Pages</option>
              <option value="10-15 Pages">10-15 Pages</option>
            </select>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
          >
            Select Characters
          </button>

          <button
            onClick={handleNext}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-2">
          <PenTool size={32} className="text-purple-500" />
          Fill out the Answers
        </h1>

        <div className="space-y-6">
          <div>
            <label className="text-white block mb-2">Who are the key family members?</label>
            <input
              type="text"
              placeholder="ex:"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              value={formData.familyMembers}
              onChange={(e) => setFormData({ ...formData, familyMembers: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <div className="h-2 bg-purple-600 rounded flex-1" />
            <div className="h-2 bg-gray-700 rounded flex-1" />
            <div className="h-2 bg-gray-700 rounded flex-1" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-2">
          <PenTool size={32} className="text-purple-500" />
          Fill out the Answers
        </h1>

        <div className="space-y-6">
          <div>
            <label className="text-white block mb-2">What is the central issue or emotional theme?</label>
            <input
              type="text"
              placeholder="ex:"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <div className="h-2 bg-purple-600 rounded flex-1" />
            <div className="h-2 bg-purple-600 rounded flex-1" />
            <div className="h-2 bg-gray-700 rounded flex-1" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-2">
          <PenTool size={32} className="text-purple-500" />
          Fill out the Answers
        </h1>

        <div className="space-y-6">
          <div>
            <label className="text-white block mb-2">Where does the story take place?</label>
            <input
              type="text"
              placeholder="ex:"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              value={formData.setting}
              onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <div className="h-2 bg-purple-600 rounded flex-1" />
            <div className="h-2 bg-purple-600 rounded flex-1" />
            <div className="h-2 bg-purple-600 rounded flex-1" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <TemplateSelection setStep={setStep} />;
};

export default GenerateStory;