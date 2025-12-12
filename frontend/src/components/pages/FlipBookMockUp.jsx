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
// import Image from "../../assets/images/square.png";
// import Image3 from "../../assets/images/square.png";
// import Image2 from "../../assets/images/square.png";
//landscape images------------------------------------
// import Image from "../../assets/images/landscape.png";
// import Image3 from "../../assets/images/landscape.png";
// import Image2 from "../../assets/images/landscape.png";
// //portrait images------------------------------------
import Image from "../../assets/images/protrait.png";
import Image2 from "../../assets/images/protrait.png";
import Image3 from "../../assets/images/protrait.png";

import Logo from "../../assets/images/logo.gif";
import turnSound from "../../assets/audio/pageflip.mp3";

const FlipBookMockUp = () => {
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
       <div className="absolute inset-0 p-10 overflow-y-auto">
                <p className="text-gray-900 text-sm leading-relaxed">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos corrupti temporibus nam hic illo voluptatem provident ratione quidem corporis. Animi eaque dolorum aliquam fugit hic sed corporis natus vero quam?
                Odit omnis quam nemo, consequuntur earum facere? Dolor obcaecati porro officia deleniti sapiente dolores id voluptatum delectus. Quibusdam velit dignissimos, maxime voluptates quia quisquam aperiam dolor labore accusamus aliquam et!</p>
               </div>
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
      return { width: 400, height: 400 };
    }

    // Landscape (width > height)
    if (aspect > 1) {
      return { width: 568, height: 412 }
    }

    // Portrait (height > width)
    return { width: 312, height: 468 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex">
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-center absolute top-3 left-20 mb-4">
          {/* <img src={Logo} alt="GHOST.ai" className="h-10" /> */}
          <p className="text-white text-2xl font-bold mt-4">GHOST.ai</p>
        </div>

        {/* TOP CONTROLS */}
        <div className="flex justify-center">
          <div className="bg-gray-900 px-8 py-4 rounded-xl border border-gray-700 flex items-center text-white">
            <div className="flex items-center gap-2 cursor-pointer">
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
            
        
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipBookMockUp;