// import React, { useRef, useState, useEffect } from "react";
// import HTMLFlipBook from "react-pageflip";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Edit3,
//   Scissors,
//   PenTool,
//   Users,
// } from "lucide-react";

// //square images------------------------------------
// // import Image from "../../assets/images/square.png";
// // import Image3 from "../../assets/images/square.png";
// // import Image2 from "../../assets/images/square.png";
// //landscape images------------------------------------
// // import Image from "../../assets/images/landscape.png";
// // import Image3 from "../../assets/images/landscape.png";
// // import Image2 from "../../assets/images/landscape.png";
// // //portrait images------------------------------------
// import Image from "../../assets/images/protrait.png";
// import Image2 from "../../assets/images/protrait.png";
// import Image3 from "../../assets/images/protrait.png";

// import Logo from "../../assets/images/logo.gif";
// import turnSound from "../../assets/audio/pageflip.mp3";

// const FlipBookMockUp = () => {
//   const bookRef = useRef(null);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageCount, setPageCount] = useState(0);

//   // --------------------------
//   //   YOUR PAGE LIST
//   // --------------------------
//   const pages = [
//     <div className="page">
//       <img src={Image3} alt="Cover" className="w-full h-full object-cover" />
//     </div>,

//     <div className="page left">
//       <img
//         src={Image}
//         alt="Inside Left"
//         className="w-full h-full object-cover"
//       />
//     </div>,
//     <div className="page right">
//       <img
//         src={Image3}
//         alt="Inside Right"
//         className="w-full h-full object-cover"
//       />
//        <div className="absolute inset-0 p-10 overflow-y-auto">
//                 <p className="text-gray-900 text-sm leading-relaxed">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos corrupti temporibus nam hic illo voluptatem provident ratione quidem corporis. Animi eaque dolorum aliquam fugit hic sed corporis natus vero quam?
//                 Odit omnis quam nemo, consequuntur earum facere? Dolor obcaecati porro officia deleniti sapiente dolores id voluptatum delectus. Quibusdam velit dignissimos, maxime voluptates quia quisquam aperiam dolor labore accusamus aliquam et!</p>
//                </div>
//     </div>,

//     <div className="page left">
//       <img
//         src={Image2}
//         alt="Inside Left"
//         className="w-full h-full object-cover"
//       />
//     </div>,
//     <div className="page right">
//       <img
//         src={Image}
//         alt="Inside Right"
//         className="w-full h-full object-cover"
//       />
//     </div>,

//     <div className="page left">
//       <img
//         src={Image}
//         alt="Inside Left"
//         className="w-full h-full object-cover"
//       />
//     </div>,
//     <div className="page right">
//       <img
//         src={Image3}
//         alt="Inside Right"
//         className="w-full h-full object-cover"
//       />
//     </div>,

//     <div className="page">
//       <img
//         src={Image2}
//         alt="Back Cover"
//         className="w-full h-full object-cover"
//       />
//     </div>,
//   ];

//   // --------------------------
//   // PAGEFLIP API ACCESS
//   // --------------------------
//   const pageFlipApi = () => bookRef.current?.pageFlip?.();

//   const nextPage = () => pageFlipApi()?.flipNext();
//   const prevPage = () => pageFlipApi()?.flipPrev();

//   const goToCover = () => pageFlipApi()?.flip(0);

//   // --------------------------
//   // HANDLE PAGE FLIP
//   // --------------------------
//   const onFlip = (e) => {
//     const pg = e?.data;
//     if (typeof pg === "number") setCurrentPage(pg);
//   };

//   // --------------------------
//   // GET TOTAL PAGE COUNT
//   // --------------------------
//   useEffect(() => {
//     const pf = pageFlipApi();
//     if (!pf) return;

//     try {
//       const pc = pf.getPageCount();
//       if (typeof pc === "number") setPageCount(pc);
//     } catch {}
//   }, [bookRef.current]);

//   // --------------------------
//   // PAGE LABEL
//   // --------------------------
//   const pageLabel = () => {
//     if (currentPage === 0) return "Cover";
//     if (currentPage === pages.length - 1) return "Back Cover";

//     const totalInside = pages.length - 2;
//     const logicalIndex = Math.min(Math.max(1, currentPage), totalInside);

//     return `Page ${logicalIndex} / ${totalInside}`;
//   };

//   // --------------------------
//   // AUDIO play page turn sound
//   // --------------------------
//   const audioRef = useRef(null);

//   const playSound = () => {
//     if (!audioRef.current) {
//       audioRef.current = new Audio(turnSound);
//     }
//     audioRef.current.currentTime = 0;
//     audioRef.current.play().catch(() => {});
//   };
//   playSound();

//   useEffect(() => {
//     const flipBook = bookRef.current;
//     if (!flipBook) return;

//     const api = flipBook.pageFlip();
//     if (!api) return;

//     api.on("flip", playSound);

//     return () => api.off("flip", playSound);
//   }, []);

//   // --------------------------
//   // PAGE SIZE DYNAMIC RENDER
//   // --------------------------
//   const [pageSize, setPageSize] = useState({ width: 400, height: 500 });

//   useEffect(() => {
//     const img = new window.Image();

//     img.src = Image3; // Cover image defines orientation

//     img.onload = () => {
//       const size = getBookSizeFromImage(img);
//       setPageSize(size);
//     };
//   }, []);

//   // Utility: calculate dimensions from aspect ratio
//   const getBookSizeFromImage = (img) => {
//     const aspect = img.width / img.height;

//     // Square
//     if (aspect === 1) {
//       return { width: 400, height: 400 };
//     }

//     // Landscape (width > height)
//     if (aspect > 1) {
//       return { width: 568, height: 412 }
//     }

//     // Portrait (height > width)
//     return { width: 312, height: 468 };
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex">
//       <div className="flex-1 p-6">

//         {/* HEADER */}
//         <div className="flex justify-center absolute top-3 left-20 mb-4">
//           {/* <img src={Logo} alt="GHOST.ai" className="h-10" /> */}
//           <p className="text-white text-2xl font-bold mt-4">GHOST.ai</p>
//         </div>

//         {/* TOP CONTROLS */}
//         <div className="flex justify-center">
//           <div className="bg-gray-900 px-8 py-4 rounded-xl border border-gray-700 flex items-center text-white">
//             <div className="flex items-center gap-2 cursor-pointer">
//               <ChevronLeft
//                 size={18}
//                 className="hover:text-purple-400"
//                 onClick={prevPage}
//               />
//               <span>{pageLabel()}</span>
//               <ChevronRight
//                 size={18}
//                 className="hover:text-purple-400"
//                 onClick={nextPage}
//               />
//             </div>
//           </div>
//         </div>

//         {/* BOOK */}
//         <div className="flex justify-center mt-4">
//           <div className="bg-gray-800 p-6 rounded-xl shadow-2xl relative">
//             <HTMLFlipBook
//               width={pageSize.width}
//               height={pageSize.height}
//               minWidth={pageSize.width - 100}
//               maxWidth={pageSize.width + 200}
//               minHeight={pageSize.height - 100}
//               maxHeight={pageSize.height + 200}
//               showCover={true}
//               useMouseEvents={true}
//               drawShadow={true}
//               className="mx-auto"
//               ref={bookRef}
//               onFlip={onFlip}
//               usePortrait={false}
//               flippingTime={600}
//               mobileScrollSupport={true}
//               showPageCorners={true}>
//               {pages.map((p, i) => (
//                 <div key={i} style={{ width: "400px", height: "600px" }}>
//                   {p}
//                 </div>
//               ))}
//             </HTMLFlipBook>
            
        
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FlipBookMockUp;  


import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Edit, Scissors, Users, Loader, RefreshCcw, History } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import turnSound from "../../assets/audio/pageflip.mp3";
import api from "../../services/axiosInstance";
import { useParams } from "react-router-dom";
import FaceSwapModal from "../helperComponents/FaceSwapModel.jsx";
import EditModal from "../helperComponents/EditModel.jsx";
import ImageHistoryModal from "../helperComponents/ImageHistoryModal.jsx";
import confetti from "canvas-confetti";
import "../../styles/story-content.css";
// ///////////////////////////////DUMMY DATA/////////////////////////////////////
// //square images------------------------------------
// import Image from "../../assets/images/square.png";
// import Image3 from "../../assets/images/square.png";
// import Image2 from "../../assets/images/square.png";
// //landscape images------------------------------------
import Image from "../../assets/images/landscape.png";
import Image3 from "../../assets/images/landscape.png";
import Image2 from "../../assets/images/landscape.png";
// // //portrait images------------------------------------
// import Image from "../../assets/images/protrait.png";
// import Image2 from "../../assets/images/protrait.png";
// import Image3 from "../../assets/images/protrait.png";
////////////////////////////////////////////////////////////////////////////////////

// const StoryFlipbook = ({ storyId = "693978d16604fe912fe8cd15" }) => {
const StoryFlipbook = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [error, setError] = useState(null);
  const [showFaceSwap, setShowFaceSwap] = useState(false);
  const [faceSwapPage, setFaceSwapPage] = useState(null);
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editPage, setEditPage] = useState(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);


  
  const bookRef = useRef(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const { storyId } = useParams();

  // safe accessor for the pageflip API (declare before effects that use it)
  const pageFlipApi = () => bookRef.current?.pageFlip?.();

  // console.log("Story data in FlipBook:", storyData);
/////////////////////////////////////////////////////////////////////////////////////
  const dummyStoryData = {
  story: {
    title: "The Lost Kingdom",
    genre: "Fantasy Adventure",
    orientation: "Landscape", // Portrait or Landscape or Square
    coverImage: {
      s3Url: Image, // Cover image
    },
  },

  pages: [
    {
      characterImage: { s3Url: Image },
      backgroundImage: { s3Url: Image2 },
      text: "Arin enters the forgotten forest searching for the lost kingdom.",
    },

    {
      characterImage: { s3Url: Image2 },
      backgroundImage: { s3Url: Image3 },
      text: "Strange glowing creatures watched him from the shadows.",
    },

    {
      characterImage: { s3Url: Image3 },
      backgroundImage: { s3Url: Image },
      text: "At the center, he discovers the ruins of an ancient palace.",
    },
  ],

  // Optional: Add a custom back cover
  backCover: {
    s3Url: Image2, // You can also use Image or Image3
  },
};
//////////////////////////////////////////////////////////////////////////////////////

useEffect(() => {
  
    // 🎉 Fire confetti animation when page loads
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // ============================
  // FACE SWAP HANDLER
  // ============================
// FACE SWAP handler moved below where `pages` is defined

  // ============================
  // Edit HANDLER
  // ============================
// Edit handler moved below where `pages` is defined


// ============================
  // REGENERATE HANDLER
  // ===========================
  const handleRegenerateConfirm = async () => {
  try {
    setRegenerateLoading(true);

    const mongoIndex = currentPage - 1;

    if (mongoIndex < 0 || mongoIndex >= storyData.pages.length) {
      setErrorMessage("Regenerate only allowed on story spreads.");
      setShowRegenerateConfirm(false);
      return;
    }

    const realPage = storyData.pages[mongoIndex];

    const res = await api.post("/api/v1/images/regenerate", {
      pageId: realPage._id,
      characterDetails: storyData.story.characterDetails,
      orientation: storyData.story.orientation,
    });

    if (res.data?.success) {
      const refreshed = await api.get(`/api/v1/story/${storyId}`);
      setStoryData(refreshed.data.data);
    }
  } catch (err) {
    console.error("Regenerate Error:", err);
    setErrorMessage("Regeneration failed. Please try again later.");
  } finally {
    setRegenerateLoading(false);
    setShowRegenerateConfirm(false);
  }
};



  // ============================
  // FETCH STORY DATA
  // ============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/story/${storyId}`);
        setStoryData(res.data.data);
        // setStoryData(dummyStoryData); // Use dummy data
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [storyId]);


  // ============================
  // PAGE DIMENSIONS
  // ============================
  const getSinglePageDimensions = () => {
    if (!storyData?.story) return { width: 900, height: 500 };
    const o = storyData.story.orientation;

    if (o === "Landscape") return { width: 640, height: 480 };
    if (o === "Portrait") return { width: 360, height: 520 };
    if (o === "Square") return { width: 420, height: 420 };

    return { width: 900, height: 500 };
  };

  const singlePageDimensions = getSinglePageDimensions();
  const spreadDimensions = {
    width: singlePageDimensions.width * 2,
    height: singlePageDimensions.height,
  };

  

  // ============================
  // FONT SIZE SCALING UTILITY
  // ============================
  const getFontSizeByOrientation = (baseSize, orientation) => {
    const size = parseInt(baseSize); // remove "px"

    const getCoverTitleSize = (orientation) => {
      switch (orientation) {
        case "Portrait":
          return "text-4xl md:text-4xl";
        case "Landscape":
          return "text-7xl md:text-7xl";
        case "Square":
          return "text-4xl md:text-4xl";
        default:
          return "text-4xl md:text-4xl";
      }
    };

    // For body text scaling
    switch (orientation) {
      case "Portrait":
        return `${size * 0.7}px`;
      case "Landscape":
        return `${size * 1.2}px`;
      case "Square":
        return `${size * 1.2}px`;
      default:
        return `${size}px`;
    }
  };

  const getGenreStyle = (genre, orientation) => {
    const getFontSize = (orientation) => {
      switch (orientation) {
        case "Portrait":
          return "12px";
        case "Landscape":
          return "13px";
        case "Square":
          return "12px";
        default:
          return "12px";
      }
    };

    const fontSize = getFontSize(orientation);
    const isLandscape = orientation === "Landscape";

    const genreStyles = {
      Fantasy: {
        fontFamily: '"Cinzel", "Playfair Display", serif',
        fontWeight: 600,
        letterSpacing: "0.04em",
        lineHeight: 1.7,
        color: "#1a1a1a",
      },

      Adventure: {
        fontFamily: '"Poppins", "Montserrat", sans-serif',
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1.6,
        color: "#111827",
      },

      Family: {
        fontFamily: '"Comic Neue", "Nunito", cursive',
        fontWeight: 400,
        letterSpacing: "0.01em",
        lineHeight: 1.8,
        color: "#2d2d2d",
      },

      Mystery: {
        fontFamily: '"Special Elite", "Courier Prime", monospace',
        fontWeight: 400,
        letterSpacing: "0.06em",
        lineHeight: 1.75,
        color: "#0f172a",
      },

      "Sci-Fi": {
        fontFamily: '"Orbitron", "Inter", sans-serif',
        fontWeight: 500,
        letterSpacing: "0.08em",
        lineHeight: 1.6,
        color: "#020617",
      },

      Marriage: {
        fontFamily: '"Great Vibes", "Playfair Display", cursive',
        fontWeight: 400,
        letterSpacing: "0.05em",
        lineHeight: 1.9,
        color: "#3f1d38",
      },

      Birthday: {
        fontFamily: '"Poppins", "Baloo 2", sans-serif',
        fontWeight: 500,
        letterSpacing: "0.03em",
        lineHeight: 1.6,
        color: "#1f2937",
      },

      Housewarming: {
        fontFamily: '"Poppins", "Montserrat", sans-serif',
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1.6,
        color: "#111827",
      },

      "Corporate Promotion": {
        fontFamily: '"Poppins", "Inter", sans-serif',
        fontWeight: 600,
        letterSpacing: "0.03em",
        lineHeight: 1.6,
        color: "#0f172a",
      },

      Default: {
        fontFamily: '"Georgia", "Merriweather", serif',
        fontWeight: 400,
        letterSpacing: "0.02em",
        lineHeight: 1.75,
        color: "#333333",
      },
    };

    const style = genreStyles[genre] || genreStyles.Default;

    return {
      ...style,
      fontSize,
      transition: "all 0.3s ease",
    };
  };

  // ============================
  // PAGE GENERATION
  // ============================
  const generatePages = () => {
    if (!storyData) return [];
    
    const allPages = [];
    const story = storyData.story;
    const pages = storyData.pages || [];

   
  const pageTextStyle = getGenreStyle(
    Array.isArray(story.genres) && story.genres.length ? story.genres[0] : story.genre,
    story.orientation
  );


    // COVER (SINGLE PAGE)
      allPages.push({
        type: "single",
        jsx: (
          <div className="w-full h-full relative rounded-lg overflow-hidden">
            <img
              src={story.coverImage?.s3Url}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-[15%] sm:pt-[20%] p-4 sm:p-12 text-white">
              <div className="bg-black/50 px-3 sm:px-6 py-2 sm:py-4 rounded-lg">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg text-center">
                  {story.title}
                </h1>
              </div>
            </div>
          </div>
        ),
      });

    // STORY SPREAD PAGES
pages.forEach((page, index) => {
  const isImageLeft = index % 2 === 0;

  const ImageBlock = (
    <div style={{ width: "50%", height: "100%" }}>
      <img
        src={page.characterImage?.s3Url}
        className="w-full h-full object-cover"
      />
    </div>
  );

  const TextBlock = (
    <div className="relative" style={{ width: "50%", height: "100%" }}>
      <img
        src={page.backgroundImage?.s3Url}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 mt-2 sm:mt-6 px-2 sm:px-10 py-2 sm:py-6 overflow-y-auto">
        <div className="bg-white/35 p-0.5 sm:p-1 rounded-lg">
          {page.html ? (
            <div
              className="story-html-content text-black leading-relaxed"
              style={pageTextStyle}
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          ) : (
            <p
              className="text-black leading-relaxed"
              style={pageTextStyle}
            >
              {page.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  allPages.push({
    type: "spread",
    jsx: (
      <div className="flex w-full h-full overflow-hidden">
        {isImageLeft ? ImageBlock : TextBlock}
        {isImageLeft ? TextBlock : ImageBlock}
      </div>
    ),
  });
});


    // BACK COVER
    allPages.push({
      type: "single",
      jsx: (
        <div className="w-full h-full relative rounded-lg overflow-hidden bg-black flex items-center justify-center">
          <img
            src={story.backCoverImage?.s3Url}
            className="w-full h-full object-contain"
            style={{ objectPosition: "center" }}
            alt="Back cover"
          />
          <div className="absolute inset-0 mt-10 sm:mt-20 px-4 sm:px-10 py-4 sm:py-6 overflow-y-auto">
            <div className="bg-white/55 p-1.5 sm:p-2 rounded-lg">
              <p className="text-gray-800 text-xs sm:text-sm leading-relaxed font-bold">
                {story.backCoverBlurb}
              </p>
            </div>
          </div>
        </div>
      ),
    });

    return allPages;
  };

  const pages = generatePages();

  const isBookReady =
    pages.length > 0 &&
    singlePageDimensions.width > 0 &&
    singlePageDimensions.height > 0;

  // ============================ PAGE LABEL =============================
   const pageLabel = () => {
    if (pages.length === 0) return "No Pages";
    if (currentPage === 0) return "Cover";
    if (currentPage === pages.length - 1) return "Back Cover";
    return `Page ${currentPage} / ${pages.length - 2}`;
  };

  // ============================
  // Handlers that depend on `pages`
  // (declared after `pages` to avoid using it before initialization)
  const openFaceSwap = () => {
    const rawPages = storyData?.pages || [];
    const current = pages[currentPage];

    if (current?.type !== "spread") {
      setErrorMessage("Face Swap is only available on the LEFT page of a book.");
      return;
    }

    const mongoPageIndex = currentPage - 1;
    const pageDoc = rawPages[mongoPageIndex];

    if (!pageDoc) {
      setErrorMessage("Could not find page data");
      return;
    }

    if (!pageDoc.characterImage?.s3Url) {
      setErrorMessage("This page has no character image for face swapping.");
      return;
    }

    setFaceSwapPage(pageDoc);
    setShowFaceSwap(true);
  };

  const openEdit = () => {
    const rawPages = storyData?.pages || [];
    const current = pages[currentPage];

    if (current?.type !== "spread") {
      setErrorMessage("Edit is only available on the pages.");
      return;
    }

    const mongoPageIndex = currentPage - 1;
    const pageDoc = rawPages[mongoPageIndex];

    if (!pageDoc) {
      setErrorMessage("Could not find page data");
      return;
    }

    if (!pageDoc.characterImage?.s3Url) {
      setErrorMessage("This page has no character image for editing.");
      return;
    }

    setEditPage(pageDoc);
    setShowEdit(true);
  };

  // ============================
  // Attach flip sound listener when the flip book instance is ready
  useEffect(() => {
    let cleanup = null;
    const tryAttach = () => {
      const apiInst = bookRef.current?.pageFlip?.();
      if (!apiInst) return false;
      const handleFlip = () => playSound();
      apiInst.on("flip", handleFlip);
      cleanup = () => apiInst.off("flip", handleFlip);
      return true;
    };

    if (!tryAttach()) {
      const id = setInterval(() => {
        if (tryAttach()) clearInterval(id);
      }, 250);
      return () => {
        clearInterval(id);
        if (cleanup) cleanup();
      };
    }

    return () => {
      if (cleanup) cleanup();
    };
    // Intentionally empty deps: we attach based on DOM readiness, not state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Responsive scaling: compute scale so the flipbook fits the available container
  useEffect(() => {
    const computeScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const bookWidth = singlePageDimensions.width * (pages[currentPage]?.type === "spread" ? 2 : 1);
      const available = container.parentElement?.clientWidth || container.clientWidth;
      if (!available || !bookWidth) return setScale(1);
      const newScale = Math.min(1, available / bookWidth);
      setScale(newScale);
    };

    computeScale();
    const onResize = () => computeScale();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // deps: recalc when dimensions, pages, or currentPage change
  }, [singlePageDimensions.width, pages.length, currentPage]);

  // ============================ CONDITIONAL RENDERING ============================
   if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <img 
        style={{ width: '128px', height: '128px' }}
        src="/src/assets/images/logo.gif" 
        alt="Loading..." 
        className="w-60 h-60 mx-auto mb-4"
        />
        <p className="text-white text-xl">Loading your story...</p>
      </div>
      </div>
    );
  }

   {/*  Loading Overlay */}
    if (regenerateLoading) {
      return (
      <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[9999]">
        <img 
          style={{ width: '128px', height: '128px' }}
          src="/src/assets/images/logo.gif" 
          alt="Loading..." 
          className="mx-auto mb-4"
        />
        <p className="text-white text-xl">Regenerating Image...</p>
      </div>
        );
  }

    if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4 text-red-400">Error loading story</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

   if (!storyData || !storyData.pages || storyData.pages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Story is being generated...</p>
          <p className="text-gray-400">Status: {storyData?.story?.status || 'Unknown'}</p>
          <p className="text-gray-400 mt-2">Please check back in a few moments</p>
        </div>
      </div>
    );
  }
  

  // BUTTONS (prev/next)
  const nextPage = () => {
    pageFlipApi()?.flipNext();
  };
  const prevPage = () => {
    pageFlipApi()?.flipPrev();
  };


  const onFlip = (e) => {
    const pg = e?.data;
    if (typeof pg === "number" && pg !== currentPage) {
      setCurrentPage(pg);
      setErrorMessage("");
    }
  };

  const playSound = () => {
    try {
      if (!audioRef.current) audioRef.current = new Audio(turnSound);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch (err) {
      // ignore
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-center mb-4 sm:mb-6 pt-2 sm:pt-4">
          <h1 className="text-white text-lg sm:text-2xl font-bold">Ghostverse.ai</h1>
        </div>

        {/* BUTTON BAR */}
        <div className="flex justify-center mb-4 sm:mb-8 px-2 sm:px-4 mt-12 sm:mt-0">
          <div
            className="w-full max-w-3xl bg-gray-900 px-3 sm:px-8 py-3 sm:py-4 rounded-xl border border-gray-700 flex flex-wrap 
                  justify-center sm:justify-between 
                  items-center 
                  gap-3 sm:gap-6 
                  text-white 
                  shadow-xl
                  text-sm sm:text-base
          ">
            <div className="flex items-center w-full sm:w-auto justify-center">
              <button
                onClick={prevPage}
                disabled={currentPage === 0 || isFlipping}
                className="hover:text-purple-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1">
                <ChevronLeft size={20} />
              </button>
              <span className="min-w-24 sm:min-w-32 text-center font-medium text-xs sm:text-sm">
                {pageLabel()}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === pages.length - 1 || isFlipping}
                className="hover:text-purple-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="hidden sm:block h-6 w-px bg-gray-700" />
            
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              <button
                className="flex items-center gap-1 hover:text-purple-400 transition-colors text-xs sm:text-sm"
                onClick={() => setShowRegenerateConfirm(true)}>
                <RefreshCcw size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">regenerate</span>
              </button>

              <button
                className="flex items-center gap-1 hover:text-purple-400 transition-colors text-xs sm:text-sm"
                onClick={openEdit}>
                <Edit size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Edit</span>
              </button>

              <button className="relative flex items-center gap-1 hover:text-purple-400 transition-colors text-xs sm:text-sm"
                onClick={openFaceSwap}>
                <Users size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Face Swap</span>
                <span className="absolute -top-2 sm:-top-3 -right-3 sm:-right-5 bg-blue-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                  Beta
                </span>
              </button>
              
              <button 
                className="flex items-center gap-1 hover:text-purple-400 transition-colors text-xs sm:text-sm"
                onClick={() => {
                  const rawPages = storyData?.pages || [];
                  const current = pages[currentPage];
                  
                  // Only allow history on spread pages
                  if (current?.type !== "spread") {
                    return;
                  }
                  
                  // Map UI page index → MongoDB page index (same logic as Face Swap)
                  const mongoPageIndex = currentPage - 1;
                  const pageDoc = rawPages[mongoPageIndex];
                  
                  if (pageDoc) {
                    setHistoryPage(pageDoc);
                    setShowHistory(true);
                  }
                }}>
                <History size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Revert</span>
              </button>
              
              <button className="relative flex items-center gap-1 hover:text-purple-400 transition-colors text-xs sm:text-sm">
                <Scissors size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Eraser</span>
                <span className="absolute -top-2 sm:-top-3 -right-3 sm:-right-5 bg-blue-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                  V2
                </span>
              </button>
            </div>
          </div>
        </div>
        {errorMessage && ( <p className="text-red-600 text-sm">{errorMessage}</p> )}

        {/* RESPONSIVE FRAME */}
        <div className="flex justify-center w-full px-2">
          <div className="rounded-lg sm:rounded-2xl shadow-2xl bg-gray-800 p-0">
            <div ref={containerRef} style={{ transform: `scale(${scale})`, transformOrigin: "top center", width: singlePageDimensions.width * (pages[currentPage]?.type === 'spread' ? 2 : 1), margin: '0 auto' }}>
              {isBookReady && (
                <HTMLFlipBook
                ref={bookRef}
                width={singlePageDimensions.width}
                height={singlePageDimensions.height}
                showCover={true}
                useMouseEvents={true}
                drawShadow={true}
                flippingTime={700}
                mobileScrollSupport={true}
                showPageCorners={true}
                onFlip={onFlip}
                className="mx-auto"
              >
                {pages.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: singlePageDimensions.width,
                      height: singlePageDimensions.height,
                    }}
                  >
                    {p.jsx}
                  </div>
                ))}
              </HTMLFlipBook>
                )}
              </div>
            </div>
        </div>

        {/* PAGE INDICATORS */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 flex-wrap px-2">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!isFlipping) {
                  setIsFlipping(true);
                  setErrorMessage("");
                  try {
                    pageFlipApi()?.flip(idx);
                  } catch (err) {
                    setCurrentPage(idx);
                  }
                  setTimeout(() => setIsFlipping(false), 500);
                }
              }}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                idx === currentPage
                  ? "w-6 sm:w-8 bg-purple-500"
                  : "w-1.5 sm:w-2 bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
            Add to Cart
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
            Order Now
          </button>
        </div>
      </div>

      {/* face swap modal */}
      {showFaceSwap && faceSwapPage && (
        <FaceSwapModal
          storyId={storyId}
          page={faceSwapPage}
          onClose={() => setShowFaceSwap(false)}
          onUpdated={async () => {
            try {
              const res = await api.get(`/api/v1/story/${storyId}`);
              setStoryData(res.data.data);
            } catch (err) {
              console.error("Error refreshing story after face swap:", err);
            }
          }}
        />
      )}

      {/* image history modal */}
      {showHistory && historyPage && (
        <ImageHistoryModal
          page={historyPage}
          onClose={() => setShowHistory(false)}
          onUpdated={async () => {
            try {
              const res = await api.get(`/api/v1/story/${storyId}`);
              setStoryData(res.data.data);
            } catch (err) {
              console.error("Error refreshing story after revert:", err);
            }
          }}
        />
      )}

      {/* edit modal */}
      {showEdit && editPage && (
        <EditModal
          storyId={storyId}
          page={editPage}
          onClose={() => setShowEdit(false)}
          onUpdated={async () => {
            try {
              const res = await api.get(`/api/v1/story/${storyId}`);
              setStoryData(res.data.data);
            } catch (err) {
              console.error("Error refreshing story after face swap:", err);
            }
          }}
        />
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 text-white p-4 sm:p-6 rounded-xl w-full max-w-sm shadow-xl mx-4">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Regenerate Image?</h2>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Doing this will regenerate this Page Image. This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowRegenerateConfirm(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm sm:text-base">
                No
              </button>

              <button
                onClick={handleRegenerateConfirm}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm sm:text-base">
                Yes, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default StoryFlipbook;
