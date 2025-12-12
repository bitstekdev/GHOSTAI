import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Edit, Scissors, Users, Loader, RefreshCcw } from "lucide-react";
import api from "../../services/axiosInstance";
import { useParams } from "react-router-dom";
import FaceSwapModal from "../helperComponents/FaceSwapModel.jsx";
import EditModal from "../helperComponents/EditModel.jsx";
import confetti from "canvas-confetti";
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


  const [showEdit, setShowEdit] = useState(false);
  const [editPage, setEditPage] = useState(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);


  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  const { storyId } = useParams();

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
const openFaceSwap = () => {
  const story = storyData?.story || storyData;
  const rawPages = storyData?.pages || [];

  const current = pages[currentPage];
  // console.log("Current page data for Face Swap:", current);
  // Only allow spreads
  if (current?.type !== "spread") {
    setErrorMessage("Face Swap is only available on the LEFT page of a spread.");
    return;
  }

  // Map UI page index → MongoDB page index
  const mongoPageIndex = currentPage - 1;
  const pageDoc = rawPages[mongoPageIndex];

  if (!pageDoc) {
    setErrorMessage("Could not find page data");
    return;
  }

  // Only allow swapping if left-page character image exists
  if (!pageDoc.characterImage?.s3Url) {
    setErrorMessage("This page has no character image for face swapping.");
    return;
  }

  setFaceSwapPage(pageDoc);
  setShowFaceSwap(true);
};

  // ============================
  // Edit HANDLER
  // ============================
const openEdit = () => {
  const story = storyData?.story || storyData;
  const rawPages = storyData?.pages || [];

  const current = pages[currentPage];
  // console.log("Current page data for Face Swap:", current);
  // Only allow spreads
  if (current?.type !== "spread") {
    setErrorMessage("Face Swap is only available on the LEFT page of a spread.");
    return;
  }

  // Map UI page index → MongoDB page index
  const mongoPageIndex = currentPage - 1;
  const pageDoc = rawPages[mongoPageIndex];

  if (!pageDoc) {
    setErrorMessage("Could not find page data");
    return;
  }

  // Only allow swapping if left-page character image exists
  if (!pageDoc.characterImage?.s3Url) {
    setErrorMessage("This page has no character image for face swapping.");
    return;
  }

  setEditPage(pageDoc);
  setShowEdit(true);
};


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

    if (o === "Landscape") return { width: 568, height: 412 };
    if (o === "Portrait") return { width: 312, height: 468 };
    if (o === "Square") return { width: 400, height: 400 };

    return { width: 900, height: 500 };
  };

  const singlePageDimensions = getSinglePageDimensions();
  const spreadDimensions = {
    width: singlePageDimensions.width * 2,
    height: singlePageDimensions.height,
  };

  // ============================
  // RESPONSIVE AUTO-SCALE
  // ============================
  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;

      const maxWidth = wrapperRef.current.offsetWidth;
      const pageWidth =
        pages[currentPage]?.type === "spread"
          ? spreadDimensions.width
          : singlePageDimensions.width;

      const newScale = Math.min(maxWidth / pageWidth, 1);
      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    setTimeout(handleResize, 100); // initial scaling
    return () => window.removeEventListener("resize", handleResize);
  });

  // ============================
  // FONT SIZE SCALING UTILITY
  // ============================
  const getFontSizeByOrientation = (baseSize, orientation) => {
    const size = parseInt(baseSize); // remove "px"

    const getCoverTitleSize = (orientation) => {
      switch (orientation) {
        case "Portrait":
          return "text-5xl md:text-5xl";
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
    const genreStyles = {
      Fantasy: { fontFamily: '"Cinzel", serif', fontSize: "13px", color: "#000000" },
      Adventure: { fontFamily: '"Poppins", sans-serif', fontSize: "12px", color: "#000000" },
      Family: { fontFamily: '"Comic Neue", cursive', fontSize: "12px", color: "#000000" },
      Mystery: { fontFamily: '"Special Elite", monospace', fontSize: "12px", color: "#000000" },
      Housewarming: { fontFamily: '"Poppins", sans-serif', fontSize: "12px", color: "#000000" },
      "Corporate Promotion": { fontFamily: '"Poppins", sans-serif', fontSize: "12px", color: "#000000" },
      Marriage: { fontFamily: '"Great Vibes", cursive', fontSize: "13px", color: "#000000" },
      "Baby Shower": { fontFamily: '"Comic Neue", cursive', fontSize: "12px", color: "#000000" },
      Birthday: { fontFamily: '"Poppins", sans-serif', fontSize: "12px", color: "#000000" },
      "Sci-Fi": { fontFamily: '"Orbitron", sans-serif', fontSize: "12px", color: "#000000" },
    };

    const base = genreStyles[genre] || { fontFamily: '"Georgia", serif', fontSize: "18px", color: "#333" };

    return {
      fontFamily: base.fontFamily,
      fontSize: getFontSizeByOrientation(base.fontSize, orientation),
      color: base.color,
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

   
  const pageTextStyle = getGenreStyle(story.genre, story.orientation);


    // COVER (SINGLE PAGE)
    // allPages.push({
    //   type: "single",
    //   jsx: (
    //     <div className="w-full h-full relative rounded-lg overflow-hidden">
    //       <img src={story.coverImage?.s3Url} className="w-full h-full object-cover" />
    //       <div className="absolute inset-0 flex flex-col items-center justify-start p-12 text-white">
    //         <h1 className="text-3xl md:text-5xl text-center font-bold drop-shadow-lg">{story.title}</h1>
    //       </div>
    //     </div>
    //   ),
    // });
      allPages.push({
        type: "single",
        jsx: (
          <div className="w-full h-full relative rounded-lg overflow-hidden">
            <img
              src={story.coverImage?.s3Url}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-[20%] p-12 text-white">
              <div className="bg-black/50 px-6 py-4 rounded-lg">
                <h1 className="text-4xl md:text-4xl font-bold drop-shadow-lg">
                  {story.title}
                </h1>
              </div>
            </div>
          </div>
        ),
      });

    // STORY SPREAD PAGES
    pages.forEach((page) => {
      allPages.push({
        type: "spread",
        jsx: (
          <div className="flex w-full h-full overflow-hidden">
            {/* LEFT PAGE */}
            <div style={{ width: "50%", height: "100%" }}>
              <img src={page.characterImage?.s3Url} className="w-full h-full object-cover" />
            </div>

            {/* RIGHT PAGE */}
            <div className="relative" style={{ width: "50%", height: "100%" }}>
              <img
                src={page.backgroundImage?.s3Url}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 mt-6 px-10 py-6 overflow-y-auto">
                <div className="bg-white/25 p-1 rounded-lg">
                <p className="text-black text-sm leading-relaxed" style={pageTextStyle}>{page.text}</p>
                </div>
              </div>
            </div>
          </div>
        ),
      });
    });

    // BACK COVER
    // allPages.push({
    //   type: "single",
    //   jsx: (
    //    <div className="w-full h-full relative rounded-lg overflow-hidden">
    //     <img src={story.backCoverImage?.s3Url} className="w-full h-full object-cover " />
    //      <div className="absolute inset-0 mt-20 px-10 py-6 overflow-y-auto">
    //       <p className="text-white text-sm leading-relaxed">{story.backCoverBlurb}</p>
    //       </div>
    //   </div>
    //   ),
    // });
    allPages.push({
      type: "single",
      jsx: (
       <div className="w-full h-full relative rounded-lg overflow-hidden">
      <img src={story.backCoverImage?.s3Url} className="w-full h-full object-cover " />
       <div className="absolute inset-0 mt-20 px-10 py-6 overflow-y-auto">
      <div className="bg-white/45 p-2 rounded-lg">
        <p className="text-gray-800 text-sm leading-relaxed font-bold">{story.backCoverBlurb}</p>
      </div>
      </div>
      </div>
      ),
    });

    return allPages;
  };

  const pages = generatePages();

  // ============================ PAGE LABEL =============================
   const pageLabel = () => {
    if (pages.length === 0) return "No Pages";
    if (currentPage === 0) return "Cover";
    if (currentPage === pages.length - 1) return "Back Cover";
    return `Page ${currentPage} / ${pages.length - 2}`;
  };

  // ============================ CONDITIONAL RENDERING ============================
   if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading your story...</p>
        </div>
      </div>
    );
  }

   {/*  Loading Overlay */}
    if (regenerateLoading) {
      return (
      <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[9999]">
        <Loader className="w-16 h-16 text-purple-500 animate-spin mb-4" />
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
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsFlipping(false), 500);
    }
  };
  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsFlipping(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="absolute top-4 left-20 mb-6">
          <h1 className="text-white text-2xl font-bold">GHOST.ai</h1>
        </div>

        {/* BUTTON BAR */}
        {/* <div className="flex justify-center mb-8">
            <div className="bg-gray-900 px-6 py-4 rounded-xl border border-gray-700 flex flex-wrap justify-between items-center gap-4 text-white shadow-xl"> */}
        <div className="flex justify-center mb-8 px-4">
          <div
            className="w-full max-w-3xl bg-gray-900 px-8 py-4 rounded-xl border border-gray-700 flex flex-wrap md:flex-nowrap 
                  justify-between 
                  items-center 
                  gap-6 
                  text-white 
                  shadow-xl
          ">
            <div className="flex items-center">
              <button
                onClick={prevPage}
                disabled={currentPage === 0 || isFlipping}
                className="hover:text-purple-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={20} />
              </button>
              <span className="min-w-32 text-center font-medium">
                {pageLabel()}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === pages.length - 1 || isFlipping}
                className="hover:text-purple-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="h-6 w-px bg-gray-700 ml-8 mr-8" />
            <button
              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
              onClick={() => setShowRegenerateConfirm(true)}>
              <RefreshCcw size={16} /> regenerate
            </button>

            <button
              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
              onClick={openEdit}>
              <Edit size={16} /> Edit
            </button>

            <button className="relative flex items-center gap-1 hover:text-purple-400 transition-colors"
              onClick={openFaceSwap}>
              <Users size={16} /> Face Swap
              <span className="absolute -top-3 -right-5 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                Beta
              </span>
            </button>

         <button className="relative flex items-center gap-1 hover:text-purple-400 transition-colors">
            <Scissors size={16} /> Eraser
           <span className="absolute -top-3 -right-5 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
              V2
            </span>
          </button>

            {/* <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                  <Scissors size={16} /> Eraser
                </button> */}
          </div>
        </div>

        {/* RESPONSIVE FRAME */}
        <div ref={wrapperRef} className="flex justify-center w-full">
          <div
            className="rounded-2xl shadow-2xl bg-gray-800 p-4"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}>
            <div
              className="transition-all duration-500"
              style={
                pages[currentPage]?.type === "spread"
                  ? spreadDimensions
                  : singlePageDimensions
              }>
              {pages[currentPage]?.jsx}
            </div>
          </div>
        </div>

        {/* PAGE INDICATORS */}
        <div className="flex justify-center gap-2 mt-6">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!isFlipping) {
                  setIsFlipping(true);
                  setCurrentPage(idx);
                  setTimeout(() => setIsFlipping(false), 500);
                }
              }}
              className={`h-2 rounded-full transition-all ${
                idx === currentPage
                  ? "w-8 bg-purple-500"
                  : "w-2 bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold">
            Add to Cart
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-semibold">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-xl w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">Regenerate Image?</h2>
            <p className="text-gray-300 mb-6">
              Doing this will regenerate this Page Image. This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRegenerateConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                No
              </button>

              <button
                onClick={handleRegenerateConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
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
