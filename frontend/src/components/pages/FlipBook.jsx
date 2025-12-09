import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Edit, Scissors, Users, Loader } from "lucide-react";
import api from "../../services/axiosInstance";

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

const StoryFlipbook = ({ storyId = "69369845df64de927c9c8658" }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [error, setError] = useState(null);

  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);


////////////////////////////////////////////////////////////////////////////////////
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
  // PAGE GENERATION
  // ============================
  const generatePages = () => {
    if (!storyData) return [];

    const allPages = [];
    const story = storyData.story;
    const pages = storyData.pages || [];

    // COVER (SINGLE PAGE)
    allPages.push({
      type: "single",
      jsx: (
        <div className="w-full h-full relative rounded-lg overflow-hidden">
          <img src={story.coverImage?.s3Url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">{story.title}</h1>
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
                <p className="text-black text-sm leading-relaxed">{page.text}</p>
              </div>
            </div>
          </div>
        ),
      });
    });

    // BACK COVER
    allPages.push({
      type: "single",
      jsx: (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col items-center justify-center text-white">
          <h2 className="text-5xl font-bold">The End</h2>
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
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900 px-6 py-4 rounded-xl border border-gray-700 flex flex-wrap justify-between items-center gap-4 text-white shadow-xl">
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
                <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                  <Edit size={16} /> Edit
                </button>

                <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                  <Users size={16} /> Face Swap
                </button>

                <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                  <Scissors size={16} /> Eraser
                </button>
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
                      ? 'w-8 bg-purple-500' 
                      : 'w-2 bg-gray-600 hover:bg-gray-500'
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
    </div>
  );
};

export default StoryFlipbook;
