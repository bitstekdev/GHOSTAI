import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGhost, FaPaintBrush } from 'react-icons/fa';
import { ArrowLeft, Edit, Eraser, ChevronLeft, ChevronRight, X } from 'lucide-react';
import GhostSidebar from './GhostSidebar';
import BookFlip from './BookFlip';

const BookPreview = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --- BASE SIZES (easy to tune). These are the "original" sizes; we'll apply 0.9 factor below.
  const BASE = {
    sidebarW: 260,      // px
    editW: 420,         // px
    gapBetween: 56,     // px (space between edit and preview)
    maxContainer: 1350, // px
    previewMaxWhenOpen: 850,
    previewMaxWhenClosed: 1200,
    editHeightVh: 85,   // vh
  };

  const SCALE = 0.9; // reduce by 10%

  // scaled sizes
  const sidebarW = Math.round(BASE.sidebarW * SCALE); // px
  const editW = Math.round(BASE.editW * SCALE); // px
  const gapBetween = Math.round(BASE.gapBetween * SCALE); // px
  const maxContainer = Math.round(BASE.maxContainer * SCALE); // px
  const previewMaxWhenOpen = Math.round(BASE.previewMaxWhenOpen * SCALE); // px
  const previewMaxWhenClosed = Math.round(BASE.previewMaxWhenClosed * SCALE); // px
  const editHeightVh = (BASE.editHeightVh * SCALE).toFixed(1); // vh decimal

  const pages = [
    { id: 1, content: 'Once upon a time,\nin a garden where magic bloomed...', image: '/src/assets/coverpage.png', type: 'cover' },
    { id: 2, content: 'The Happy Face, featuring a young man and his cheerful family exploring a colorful garden full of butterflies, vibrant flowers, and a joyful atmosphere...', image: '/src/assets/pages1.png', type: 'content' },
    { id: 3, content: 'A magical journey through nature\'s wonders...', image: '/src/assets/backpage.png', type: 'back' },
  ];

  const handleToolClick = (type) => {
    if (type === 'edit') setIsEditOpen(prev => !prev);
    if (type === 'faceswap') navigate('/faceswap');
  };


  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white relative">
      <div className="flex min-h-screen">
        {/* Left Sidebar column (scaled) */}
        <div style={{ width: `${sidebarW}px`, flexShrink: 0 }}>
          <GhostSidebar />
        </div>

        {/* Main right column (content) */}
        <main className="flex-1 p-10 space-y-8 transition-all duration-300">
          {/* decorative ghosts (optional) */}
          <FaGhost className="absolute top-24 right-24 text-white/10 text-6xl pointer-events-none" />
          <FaGhost className="absolute bottom-32 left-[320px] text-white/8 text-7xl pointer-events-none" />

          {/* Toolbar */}
          <div className="mx-auto" style={{ maxWidth: `${maxContainer}px` }}>
            <div className="bg-[#1c1c20] rounded-xl p-6 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-5">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-300 hover:text-white text-lg">
                  <ArrowLeft size={22} />
                  <span>Back</span>
                </button>
              </div>

              <div className="flex items-center gap-10">
                <div className="flex items-center gap-8">
                  <button onClick={() => handleToolClick('edit')} className="flex flex-col items-center gap-2 text-gray-300 hover:text-white text-base">
                    <Edit size={24} />
                    <span>Edit</span>
                  </button>

                  {/* <button className="flex flex-col items-center gap-2 text-gray-300 hover:text-white text-base">
                    <FaPaintBrush size={22} />
                    <span>Inpaint</span>
                  </button> */}

                  {/* <button className="flex flex-col items-center gap-2 text-gray-300 hover:text-white text-base">
                    <Eraser size={22} />
                    <span>Eraser</span>
                  </button> */}

                  <button onClick={() => handleToolClick('faceswap')} className="flex flex-col items-center gap-2 text-gray-300 hover:text-white text-base">
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4" strokeWidth="2" />
                    </svg>
                    <span>Face Swap</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit panel + Preview row (scaled and spaced) */}
          <div className="mx-auto flex transition-all duration-300" style={{ maxWidth: `${maxContainer}px`, gap: `${gapBetween}px` }}>
            {/* Edit panel (scaled width & height) */}
            <div
              className={`transition-all duration-300 ${isEditOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{ width: isEditOpen ? `${editW}px` : '0px', overflow: 'hidden' }}
            >
              <div
                className={`bg-[#2b2b2e] rounded-2xl p-6 shadow-2xl flex flex-col transition-all duration-300`}
                style={{ height: `${editHeightVh}vh`, transform: isEditOpen ? 'translateX(0)' : `translateX(-10px)` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsEditOpen(false)} className="p-2 rounded-md hover:bg-white/5">
                      <X size={18} />
                    </button>
                    <h3 className="text-xl font-semibold">Edit</h3>
                  </div>
                </div>

                <div className="flex-1 overflow-auto space-y-6 pr-2">
                  <div className="bg-[#3a3a3c] rounded-xl p-5 text-gray-200 shadow-inner">
                    <p className="text-sm leading-relaxed">
                      “The Happy Face” — featuring a young man and his cheerful family exploring a colorful garden full of butterflies, vibrant flowers, and a joyful atmosphere. Design a whimsical cover and back page that capture the book's happy and enchanting mood.
                    </p>
                  </div>

                  <div className="bg-[#3a3a3c] rounded-xl p-5 text-gray-200 shadow-inner">
                    <p className="text-sm leading-relaxed">
                      Featuring a young man and his family enjoying a bright, magical garden filled with butterflies and colorful flowers. The storybook should have a cheerful cover and a matching back cover with a whimsical garden theme.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="bg-[#1f1f21] rounded-2xl p-4 flex items-center gap-4 shadow-inner">
                    <textarea rows={2} placeholder="Write a prompt or instruction..." className="flex-1 resize-none bg-transparent outline-none text-sm text-gray-100" />
                    <button className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-md text-white text-sm font-medium">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview area (flex-1) scaled via max widths */}
            <div
              className="flex-1 transition-all duration-300"
              style={{ maxWidth: `${isEditOpen ? previewMaxWhenOpen : previewMaxWhenClosed}px` }}
            >
              <div className="relative">
                {/* BookFlip 3D preview - single page (cover/back) is larger */}
                <div
                  className="mx-auto"
                  style={{
                    width: '100%',
                    maxWidth:
                      currentPage === 0 || currentPage === pages.length - 1
                        ? isEditOpen
                          ? `${Math.round(previewMaxWhenOpen * 1.15)}px`
                          : `${Math.round(previewMaxWhenClosed * 1.15)}px`
                        : isEditOpen
                          ? `${previewMaxWhenOpen}px`
                          : `${previewMaxWhenClosed}px`,
                    transition: 'max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <BookFlip
                    pagesData={pages.map(p => ({ image: p.image, content: p.content || '' }))}
                    visibleIndex={currentPage}    

                    
                    onChange={(idx) => setCurrentPage(idx)}
                  />
                </div>

                {/* Dots */}
                <div className="mt-8 flex justify-center items-center gap-4">
                  {pages.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPage(idx)} className={`w-4 h-4 rounded-full transition-all transform ${idx === currentPage ? 'bg-purple-500 scale-125' : 'bg-gray-600 hover:bg-gray-500'}`} />
                  ))}
                </div>

                {/* Order */}
                <div className="mt-12 flex justify-center">
                  <button onClick={() => navigate('/checkout')} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-20 py-5 text-2xl font-semibold transform transition hover:scale-105">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookPreview;
