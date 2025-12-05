import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft } from 'lucide-react';

const FaceSwap = () => {
  const navigate = useNavigate();
  const [sourceImage, setSourceImage] = useState(null);
  const [targetImage, setTargetImage] = useState(null);
  const [numSourcePersons, setNumSourcePersons] = useState('');
  const [numTargetPersons, setNumTargetPersons] = useState('');
  const sourceInputRef = useRef(null);
  const targetInputRef = useRef(null);

  const handleSourceChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSourceImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleTargetChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTargetImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0b0d' }} className="flex flex-col items-center justify-center text-white p-10">
      <div className="w-full mb-6">
        <button onClick={() => navigate('/generate/preview')} className="flex items-center gap-2 text-gray-300 hover:text-white">
          <ArrowLeft size={20} />
          <span>Back to Preview</span>
        </button>
      </div>
      <h2 className="text-4xl font-bold mb-6">Face Swap</h2>

      <div className="flex gap-16 mb-10">
        {/* Source Image Container */}
        <div className="flex flex-col items-center gap-4 p-8 rounded-xl shadow-lg" style={{ backgroundColor: '#232326' }}>
          <span className="font-semibold mb-2 text-lg">Source Image</span>
          <div
            onClick={() => sourceInputRef.current?.click()}
            style={{ width: '364px', height: '364px', backgroundColor: '#2b2b2e', cursor: 'pointer' }}
            className="flex items-center justify-center rounded-lg overflow-hidden hover:bg-opacity-80 transition"
          >
            {sourceImage ? (
              <img src={sourceImage} alt="Source" className="object-contain w-full h-full" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload size={48} className="text-gray-400" />
                <span className="text-gray-400 text-center">Click to select image</span>
              </div>
            )}
          </div>
          <input
            ref={sourceInputRef}
            type="file"
            accept="image/*"
            onChange={handleSourceChange}
            className="hidden"
          />
          <button
            onClick={() => sourceInputRef.current?.click()}
            style={{ backgroundColor: '#9333ea' }}
            className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition text-white mt-2"
          >
            Browse Device
          </button>
        </div>

        {/* Target Image Container */}
        <div className="flex flex-col items-center gap-4 p-8 rounded-xl shadow-lg" style={{ backgroundColor: '#232326' }}>
          <span className="font-semibold mb-2 text-lg">Target Image</span>
          <div
            onClick={() => targetInputRef.current?.click()}
            style={{ width: '364px', height: '364px', backgroundColor: '#2b2b2e', cursor: 'pointer' }}
            className="flex items-center justify-center rounded-lg overflow-hidden hover:bg-opacity-80 transition"
          >
            {targetImage ? (
              <img src={targetImage} alt="Target" className="object-contain w-full h-full" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload size={48} className="text-gray-400" />
                <span className="text-gray-400 text-center">Click to select image</span>
              </div>
            )}
          </div>
          <input
            ref={targetInputRef}
            type="file"
            accept="image/*"
            onChange={handleTargetChange}
            className="hidden"
          />
          <button
            onClick={() => targetInputRef.current?.click()}
            style={{ backgroundColor: '#9333ea' }}
            className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition text-white mt-2"
          >
            Browse Device
          </button>
        </div>
      </div>

      <div className="flex gap-10 mb-8">
        <div className="flex flex-col items-start gap-2">
          <label className="text-sm font-medium">Number of persons in source image:</label>
          <input
            type="number"
            min="1"
            value={numSourcePersons}
            onChange={e => setNumSourcePersons(e.target.value)}
            style={{ backgroundColor: '#232326', borderColor: '#444' }}
            className="border rounded-md px-3 py-2 text-white w-40"
            placeholder="e.g. 2"
          />
        </div>

        <div className="flex flex-col items-start gap-2">
          <label className="text-sm font-medium">Number of persons to swap:</label>
          <input
            type="number"
            min="1"
            value={numTargetPersons}
            onChange={e => setNumTargetPersons(e.target.value)}
            style={{ backgroundColor: '#232326', borderColor: '#444' }}
            className="border rounded-md px-3 py-2 text-white w-40"
            placeholder="e.g. 1"
          />
        </div>
      </div>

      <button
        style={{ backgroundColor: '#9333ea' }}
        className="px-12 py-3 rounded-lg font-semibold hover:opacity-90 transition mt-8"
      >
        Swap Faces
      </button>
    </div>
  );
};

export default FaceSwap;
