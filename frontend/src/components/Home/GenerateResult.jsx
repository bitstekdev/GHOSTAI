import React from 'react';
import { useNavigate } from 'react-router-dom';
import GhostSidebar from './GhostSidebar';
import CardSwap, { Card } from './CardSwap';
const GenerateResult = () => {
  const navigate = useNavigate();
  return (
    <div className="p-16 bg-[#0b0b0d] min-h-screen text-white relative">
      <div className="max-w-[90%] mx-auto relative z-10">
        <h2 className="text-4xl font-bold text-white mb-8">Book Templates</h2>
        <div className="bg-[#1c1c20] p-10 rounded-lg shadow-lg border border-[#2b2b31]">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left column: story details */}
            <div className="col-span-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-purple-400 font-semibold">Story Title</h3>
                  <p className="text-white mt-2">The Happy face</p>
                </div>

                <div>
                  <h3 className="text-purple-400 font-semibold">Genre</h3>
                  <p className="text-white mt-2">Family</p>
                </div>

                {/* <div>
                  <h3 className="text-purple-400 font-semibold">Characters</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Saketh', 'Lohith', 'Shashi'].map((c) => (
                      <span key={c} className="px-4 py-2 rounded-full bg-[#242427] text-gray-200">{c}</span>
                    ))}
                  </div>
                </div> */}

                <div>
                  <h3 className="text-purple-400 font-semibold">Gist</h3>
                  <div className="mt-2 bg-[#151418] p-4 rounded-lg border border-[#2b2b31] text-gray-300">
                    The Happy Face, featuring a young man and his cheerful family exploring a colorful garden full of butterflies, vibrant flowers, and a joyful atmosphere. Design a whimsical cover and back page that capture the book's happy and enchanting mood.
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => navigate('/generate/preview')}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors flex items-center gap-2"
                  >
                    <span>Generate Story</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right column: templates with CardSwap */}
            <div className="col-span-8">
              <div className="h-[560px] relative">
                <CardSwap cardDistance={80} verticalDistance={40} delay={4500} pauseOnHover={true}>
                  <Card>
                    <div className="w-full h-full flex items-center justify-center bg-[#3a3a3a]">
                      <img
                        src="/images/template-portrait.png"
                        alt="Portrait template"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/420x520/444/fff?text=Portrait'; }}
                      />
                    </div>
                  </Card>

                  <Card>
                    <div className="w-full h-full flex items-center justify-center bg-[#3a3a3a]">
                      <img
                        src="/images/template-landscape.png"
                        alt="Landscape template"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/520x420/555/fff?text=Landscape'; }}
                      />
                    </div>
                  </Card>

                  <Card>
                    <div className="w-full h-full flex items-center justify-center bg-[#3a3a3a]">
                      <img
                        src="/images/template-square.png"
                        alt="Square template"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/480x480/666/fff?text=Square'; }}
                      />
                    </div>
                  </Card>
                </CardSwap>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateResult;
