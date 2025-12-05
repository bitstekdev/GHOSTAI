import React, { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Scissors,
  PenTool,
  Users,
} from "lucide-react";

//square images------------------------------------
// import Image from "../../assets/images/about.jpg";
// import Image3 from "../../assets/images/coverpage.png";
// import Image2 from "../../assets/images/backpage.png";
//portrait images------------------------------------
import Image from "../../assets/images/story-image-2.jpg";
import Image2 from "../../assets/images/story-image-3.jpg";
import Image3 from "../../assets/images/story-image-1.jpg";

import Logo from "../../assets/images/logo.gif";
import turnSound from "../../assets/audio/pageflip.mp3";

const FlipBookPage = () => {
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // --------------------------
  //   YOUR PAGE LIST
  // --------------------------
  const pages = [
    <div className="page">
      <img src={Image3} alt="Cover" className="w-full h-full object-cover" />
    </div>,

    <div className="page left">
      <img
        src={Image}
        alt="Inside Left"
        className="w-full h-full object-cover"
      />
    </div>,
    <div className="page right">
      <img
        src={Image3}
        alt="Inside Right"
        className="w-full h-full object-cover"
      />
    </div>,

    <div className="page left">
      <img
        src={Image2}
        alt="Inside Left"
        className="w-full h-full object-cover"
      />
    </div>,
    <div className="page right">
      <img
        src={Image}
        alt="Inside Right"
        className="w-full h-full object-cover"
      />
    </div>,

    <div className="page left">
      <img
        src={Image}
        alt="Inside Left"
        className="w-full h-full object-cover"
      />
    </div>,
    <div className="page right">
      <img
        src={Image3}
        alt="Inside Right"
        className="w-full h-full object-cover"
      />
    </div>,

    <div className="page">
      <img
        src={Image2}
        alt="Back Cover"
        className="w-full h-full object-cover"
      />
    </div>,
  ];

  // --------------------------
  // PAGEFLIP API ACCESS
  // --------------------------
  const pageFlipApi = () => bookRef.current?.pageFlip?.();

  const nextPage = () => pageFlipApi()?.flipNext();
  const prevPage = () => pageFlipApi()?.flipPrev();

  const goToCover = () => pageFlipApi()?.flip(0);

  // --------------------------
  // HANDLE PAGE FLIP
  // --------------------------
  const onFlip = (e) => {
    const pg = e?.data;
    if (typeof pg === "number") setCurrentPage(pg);
  };

  // --------------------------
  // GET TOTAL PAGE COUNT
  // --------------------------
  useEffect(() => {
    const pf = pageFlipApi();
    if (!pf) return;

    try {
      const pc = pf.getPageCount();
      if (typeof pc === "number") setPageCount(pc);
    } catch {}
  }, [bookRef.current]);

  // --------------------------
  // PAGE LABEL
  // --------------------------
  const pageLabel = () => {
    if (currentPage === 0) return "Cover";
    if (currentPage === pages.length - 1) return "Back Cover";

    const totalInside = pages.length - 2;
    const logicalIndex = Math.min(Math.max(1, currentPage), totalInside);

    return `Page ${logicalIndex} / ${totalInside}`;
  };

  // --------------------------
  // AUDIO play page turn sound
  // --------------------------
  const audioRef = useRef(null);

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(turnSound);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };
  playSound();

  useEffect(() => {
    const flipBook = bookRef.current;
    if (!flipBook) return;

    const api = flipBook.pageFlip();
    if (!api) return;

    api.on("flip", playSound);

    return () => api.off("flip", playSound);
  }, []);

  // --------------------------
  // PAGE SIZE DYNAMIC RENDER
  // --------------------------
  const [pageSize, setPageSize] = useState({ width: 400, height: 500 });

  useEffect(() => {
    const img = new window.Image();

    img.src = Image3; // Cover image defines orientation

    img.onload = () => {
      const size = getBookSizeFromImage(img);
      setPageSize(size);
    };
  }, []);

  // Utility: calculate dimensions from aspect ratio
  const getBookSizeFromImage = (img) => {
    const aspect = img.width / img.height;

    // Square
    if (aspect === 1) {
      return { width: 600, height: 500 };
    }

    // Landscape (width > height)
    if (aspect > 1) {
      return { width: 600, height: 400 };
    }

    // Portrait (height > width)
    return { width: 400, height: 600 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex">
      <div className="flex-1 p-6">
        {/* BACK TO COVER BUTTON */}
        <button
          onClick={goToCover}
          className="text-white flex items-center gap-2 hover:text-purple-400">
          <ChevronLeft size={20} />
          Back
        </button>

        {/* HEADER */}
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="GHOST.ai" className="h-15" />
          <p className="text-white text-3xl font-bold mt-4">GHOST.ai</p>
        </div>

        {/* TOP CONTROLS */}
        <div className="flex justify-center">
          <div className="bg-gray-900 px-8 py-4 rounded-xl border border-gray-700 flex items-center gap-6 text-white">
            <div className="flex items-center gap-2 mr-25 cursor-pointer">
              <ChevronLeft
                size={18}
                className="hover:text-purple-400"
                onClick={prevPage}
              />
              <span>{pageLabel()}</span>
              <ChevronRight
                size={18}
                className="hover:text-purple-400"
                onClick={nextPage}
              />
            </div>

            <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400">
              <Edit3 size={16} /> Edit
            </div>

            <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400">
              <PenTool size={16} /> Inpaint
            </div>

            <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400">
              <Scissors size={16} /> Eraser
            </div>

            <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400">
              <Users size={16} /> Face Swap
            </div>
          </div>
        </div>

        {/* BOOK */}
        <div className="flex justify-center mt-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl relative">
            <HTMLFlipBook
              width={pageSize.width}
              height={pageSize.height}
              minWidth={pageSize.width - 100}
              maxWidth={pageSize.width + 200}
              minHeight={pageSize.height - 100}
              maxHeight={pageSize.height + 200}
              showCover={true}
              useMouseEvents={true}
              drawShadow={true}
              className="mx-auto"
              ref={bookRef}
              onFlip={onFlip}
              usePortrait={false}
              flippingTime={600}
              mobileScrollSupport={true}
              showPageCorners={true}>
              {pages.map((p, i) => (
                <div key={i} style={{ width: "400px", height: "600px" }}>
                  {p}
                </div>
              ))}
            </HTMLFlipBook>
            
            {/* NAV BUTTONS */}
            <div className="flex justify-center gap-4 mt-4">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                Add to Cart
              </button>

              <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg">
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipBookPage;
