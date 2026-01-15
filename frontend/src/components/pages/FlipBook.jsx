import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Edit, Scissors, Users, Loader, RefreshCcw, History } from "lucide-react";
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
import { BOOK_GENRE_STYLES } from '../../utils/bookTypography';
import Image3 from "../../assets/images/landscape.png";
import Image2 from "../../assets/images/landscape.png";
// // //portrait images------------------------------------
// import Image from "../../assets/images/protrait.png";
// import Image2 from "../../assets/images/protrait.png";
// import Image3 from "../../assets/images/protrait.png";
////////////////////////////////////////////////////////////////////////////////////

// const StoryFlipbook = ({ storyId = "693978d16604fe912fe8cd15" }) => {
const StoryFlipbook = ({ storyId: storyIdProp, onAddToCart, onOrderNow }) => {
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

  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [showToolbar, setShowToolbar] = useState(false);
  const hideToolbarTimer = useRef(null);

  const params = useParams();
  // Prefer prop, fallback to URL params
  const storyId = storyIdProp ?? params.storyId;

  const downloadPDF = async () => {
    try {
      const payload = storyData || dummyStoryData;
      const res = await fetch('/api/pdf/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyData: payload }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Failed to generate PDF: ' + (err.error || res.statusText));
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(payload.story?.title || 'story').replace(/[^a-z0-9\-_. ]/gi,'')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download PDF failed', e);
      alert('Download failed');
    }
  };

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

  // Optional: Add a custom back cover (match backend field names)
  backCoverImage: {
    s3Url: Image2,
  },
  backCoverBlurb: "A tale of wonder and mystery awaits within.",
};
//////////////////////////////////////////////////////////////////////////////////////

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
    setErrorMessage("Face Swap is only available on the LEFT page of a book.");
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
    setErrorMessage("Edit is only available on the pages.");
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
    setErrorMessage("This page has no character image for editing.");
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

  // Toolbar auto-hide cleanup
  useEffect(() => {
    return () => {
      if (hideToolbarTimer.current) {
        clearTimeout(hideToolbarTimer.current);
      }
    };
  }, []);

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
          return "text-6xl md:text-7xl";
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
        // fontWeight: 600,
        letterSpacing: "0.04em",
        lineHeight: 1.7,
        // color: "#1a1a1a",
      },

      Adventure: {
        fontFamily: '"Poppins", "Montserrat", sans-serif',
        // fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1.6,
        // color: "#111827",
      },

      Family: {
        fontFamily: '"Comic Neue", "Nunito", cursive',
        // fontWeight: 400,
        letterSpacing: "0.01em",
        lineHeight: 1.8,
        // color: "#2d2d2d",
      },

      Mystery: {
        fontFamily: '"Special Elite", "Courier Prime", monospace',
        // fontWeight: 400,
        letterSpacing: "0.06em",
        lineHeight: 1.75,
        // color: "#0f172a",
      },

      "Sci-Fi": {
        fontFamily: '"Orbitron", "Inter", sans-serif',
        // fontWeight: 500,
        letterSpacing: "0.08em",
        lineHeight: 1.6,
        // color: "#020617",
      },

      Marriage: {
        fontFamily: '"Great Vibes", "Playfair Display", cursive',
        // fontWeight: 400,
        letterSpacing: "0.05em",
        lineHeight: 1.9,
        // color: "#3f1d38",
      },

      Birthday: {
        fontFamily: '"Poppins", "Baloo 2", sans-serif',
        // fontWeight: 500,
        letterSpacing: "0.03em",
        lineHeight: 1.6,
        // color: "#1f2937",
      },

      Housewarming: {
        fontFamily: '"Poppins", "Montserrat", sans-serif',
        // fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1.6,
        // color: "#111827",
      },

      "Corporate Promotion": {
        fontFamily: '"Poppins", "Inter", sans-serif',
        // fontWeight: 600,
        letterSpacing: "0.03em",
        lineHeight: 1.6,
        // color: "#0f172a",
      },

      Default: {
        fontFamily: '"Georgia", "Merriweather", serif',
        // fontWeight: 400,
        letterSpacing: "0.02em",
        lineHeight: 1.75,
        // color: "#333333",
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
  // Toolbar show/hide helpers
  // ============================
  const showToolbarTemporarily = () => {
    setShowToolbar(true);

    if (hideToolbarTimer.current) {
      clearTimeout(hideToolbarTimer.current);
    }

    hideToolbarTimer.current = setTimeout(() => {
      setShowToolbar(false);
    }, 2500);
  };

  const hideToolbarImmediately = () => {
    if (hideToolbarTimer.current) {
      clearTimeout(hideToolbarTimer.current);
    }
    setShowToolbar(false);
  };

  // Hide toolbar when modals open
  useEffect(() => {
    if (showFaceSwap || showEdit || showHistory || showRegenerateConfirm) {
      hideToolbarImmediately();
    }
  }, [showFaceSwap, showEdit, showHistory, showRegenerateConfirm]);

  // ============================
  // PAGE GENERATION
  // ============================
  const generatePages = () => {
    if (!storyData) return [];
    
    const allPages = [];
    const story = storyData.story;
    const pages = storyData.pages || [];

   
  // Use book typography mapping so on-screen text matches PDF rules
  const genreStyle = BOOK_GENRE_STYLES[story.genre] || BOOK_GENRE_STYLES.Default;

  // Master page font-size helper — single source of truth
  const getPageFontSize = (orientation) => {
    switch (orientation) {
      case "Portrait":
        return "13px";
      case "Landscape":
        return "15.5px";
      case "Square":
        return "14.5px";
      default:
        return "14px";
    }
  };

  const pageTextStyle = {
    fontFamily: genreStyle.fontFamily,
    fontSize: getPageFontSize(story.orientation),
    lineHeight: genreStyle.lineHeight,
    letterSpacing: genreStyle.letterSpacing,
    color: '#111827',
  };


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
        <div className="absolute inset-0 flex items-center justify-center px-6 py-6">
        {/* <div
          className="rounded-2xl"
          style={{
            backgroundColor: '#fbfbf821',
            padding:
              story.orientation === "Portrait"
                ? "20px 22px"
                : story.orientation === "Square"
                ? "24px 26px"
                : "28px 32px",
            width: story.orientation === "Portrait" ? '92%' : '88%',
            height: story.orientation === "Portrait" ? '86%' : '88%',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
          }}
        > */}.
        <div
  className="rounded-2xl"
  style={{
    backgroundColor: 'transparent',
    padding:
      story.orientation === "Portrait"
        ? "20px 22px"
        : story.orientation === "Square"
        ? "24px 26px"
        : "28px 32px",
    width: story.orientation === "Portrait" ? '92%' : '88%',
    minHeight: "70%",
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
  }}
>

          {/* <div className=" p-0.5 sm:p-1 rounded-lg" style={{ width: '100%', height: '100%' }}> */}
          <div className=" p-0.5 sm:p-1 rounded-lg">
            {page.html ? (
              <div
                className="story-html-content text-black leading-relaxed"
                style={pageTextStyle}
                dangerouslySetInnerHTML={{ __html: page.html }}
              />
            ) : (
              <p
                className="text-black leading-relaxed"
                style={{
    ...pageTextStyle,
    textAlign: "justify",
    textJustify: "inter-word"
  }}
              >
                <span
    style={{
      background: "rgba(255, 255, 255, 0.88)",
      padding: "0.15em 0.35em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    }}
  >
                {page.text}
                </span>
              </p>
            )}
          </div>
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
          <div className="absolute inset-0 flex items-center justify-center px-6 py-6">
            <div
              className="rounded-2xl p-1.5 sm:p-2"
              style={{
                backgroundColor: '#fbfbf822',
                padding: '24px 32px',
                width: '70%',
                boxSizing: 'border-box',
              }}
            >
              <p
                className="text-black-800 text-xs sm:text-sm leading-relaxed font-normal"
                style={{ textAlign: 'center', margin: '0 auto' }}
              >
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
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(currentPage + 1);
      setErrorMessage("");
      setTimeout(() => setIsFlipping(false), 500);
    }
  };
  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setErrorMessage("");
      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsFlipping(false), 500);
    }
  };

  const wrapTextWithSpans = (text) =>
  text
    .split(" ")
    .map(word => `<span>${word} </span>`)
    .join("");

  // ============================
  // COMMERCE HANDLERS
  // ============================
  const handleAddToCartClick = () => {
    if (!storyData?.story) return;

    onAddToCart?.({
      id: storyId,
      title: storyData.story.title,
      genre: storyData.story.genre,
      orientation: storyData.story.orientation,
      coverImage: storyData.story.coverImage,
      backCoverImage: storyData.story.backCoverImage,
      backCoverBlurb: storyData.story.backCoverBlurb,
      pages: storyData.pages,
    });
  };

  const handleOrderNowClick = () => {
    if (!storyData?.story) return;

    onOrderNow?.({
      id: storyId,
      title: storyData.story.title,
      genre: storyData.story.genre,
      orientation: storyData.story.orientation,
      coverImage: storyData.story.coverImage,
      backCoverImage: storyData.story.backCoverImage,
      backCoverBlurb: storyData.story.backCoverBlurb,
      pages: storyData.pages,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-center mb-4 sm:mb-6 pt-2 sm:pt-4">
          <h1 className="text-white text-lg sm:text-2xl font-bold">Ghostverse.ai</h1>
        </div>

        {/* NOTE: Top button bar removed — replaced with left toolbar next to the book */}
        {errorMessage && ( <p className="text-red-600 text-sm">{errorMessage}</p> )}

        {/* LAYOUT: left toolbar + book */}
        <div className="flex justify-center w-full px-2">
          <div className="flex justify-center items-start gap-4 w-full">

            {/* LEFT ACTION BAR */}
            <div
              className={
                `hidden sm:flex flex-col gap-4 bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl sticky top-24 transition-all duration-300 ease-out ` +
                (showToolbar ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none")
              }>
              <button
                onClick={() => setShowRegenerateConfirm(true)}
                className="flex flex-col items-center text-xs text-white hover:text-purple-400 transition">
                <RefreshCcw size={20} />
                Regenerate
              </button>

              <button
                onClick={openEdit}
                className="flex flex-col items-center text-xs text-white hover:text-purple-400 transition">
                <Edit size={20} />
                Edit
              </button>

              <button
                onClick={openFaceSwap}
                className="flex flex-col items-center text-xs text-white hover:text-purple-400 transition relative">
                <Users size={20} />
                Face Swap
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] px-1 rounded">Beta</span>
              </button>

              <button
                onClick={() => {
                  const rawPages = storyData?.pages || [];
                  const current = pages[currentPage];
                  if (current?.type !== "spread") return;
                  const mongoPageIndex = currentPage - 1;
                  const pageDoc = rawPages[mongoPageIndex];
                  if (pageDoc) {
                    setHistoryPage(pageDoc);
                    setShowHistory(true);
                  }
                }}
                className="flex flex-col items-center text-xs text-white hover:text-purple-400 transition">
                <History size={20} />
                Revert
              </button>

              {/* <button className="flex flex-col items-center text-xs hover:text-purple-400 transition relative">
                <Scissors size={20} />
                Erase
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] px-1 rounded">V2</span>
              </button> */}

              <button
                onClick={downloadPDF}
                className="flex flex-col items-center text-xs text-white hover:text-green-400 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </button>
            </div>

            {/* BOOK WRAPPER */}
            <div
              ref={wrapperRef}
              className="flex justify-center w-full px-2 relative"
              onMouseMove={showToolbarTemporarily}
              onTouchStart={showToolbarTemporarily}
            >
              <div
                className="rounded-lg sm:rounded-2xl shadow-2xl bg-gray-800 p-2 sm:p-4 relative"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                }}>

                {/* LEFT ARROW */}
                {currentPage > 0 && (
                  <button
                    onClick={prevPage}
                    className="absolute left-0 top-0 h-full w-16 flex items-center justify-start bg-gradient-to-r from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 z-20"
                  >
                    <ChevronLeft size={48} className="text-white/80 ml-2" />
                  </button>
                )}

                {/* RIGHT ARROW */}
                {currentPage < pages.length - 1 && (
                  <button
                    onClick={nextPage}
                    className="absolute right-0 top-0 h-full w-16 flex items-center justify-end bg-gradient-to-l from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 z-20"
                  >
                    <ChevronRight size={48} className="text-white/80 mr-2" />
                  </button>
                )}

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
                  setCurrentPage(idx);
                  setErrorMessage("");
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
          <button 
            onClick={handleAddToCartClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
            Add to Cart
          </button>
          <button 
            onClick={handleOrderNowClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
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
