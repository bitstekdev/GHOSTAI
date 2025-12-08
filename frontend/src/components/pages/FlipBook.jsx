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

// =================================================================================================================

// import React, { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight, Edit, Scissors, Users, Loader } from "lucide-react";
// import api from "../../services/axiosInstance";

// const StoryFlipbook = () => {
//   const [currentPage, setCurrentPage] = useState(0);
//   const [storyData, setStoryData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isFlipping, setIsFlipping] = useState(false);

//   const mockApiData = {
//     success: true,
//     data: {
//       story: {
//         title: "A Family Journey",
//         genre: "Family",
//         numOfPages: 2,
//         characterDetails: [
//           { name: "abc", details: "test, details" },
//           { name: "xyz", details: "testing, demo, load" }
//         ],
//         orientation: "Landscape",
//         pages: [
//           {
//             pageNumber: 1,
//             text: "On a quiet morning, the soft sunlight warmed the cozy living room where abc sat, surrounded by memories of laughter and tears. The air was filled with a sense of uncertainty as abc struggled to find their voice, and in the silence, the whispers of loved ones, including xyz, echoed in their mind.",
//             characterImage: {
//               s3Url: "https://ghostverse-images.s3.amazonaws.com/stories/6935bf795b1ae90ed9afc6a5/characters/653757b6-1bc6-453e-b094-f3a7531eec05-page-1.png"
//             }
//           },
//           {
//             pageNumber: 2,
//             text: "As the day unfolded, abc and xyz found themselves walking side by side, their footsteps weaving a gentle rhythm into the fabric of their lives. With each step, a piece of the puzzle that was their story began to fall into place, revealing a beautiful picture of family, love, and the bonds that tie them together.",
//             characterImage: {
//               s3Url: "https://ghostverse-images.s3.amazonaws.com/stories/6935bf795b1ae90ed9afc6a5/characters/5a40f4a2-7825-4bd3-b30f-ae5182acdd47-page-2.png"
//             }
//           }
//         ]
//       }
//     }
//   };

//   // useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // await new Promise(r => setTimeout(r, 1000));
//         const res = await api.get("/api/v1/story/69369845df64de927c9c8658");
//         console.log("Fetched Story Data:", res.data.data);
//         setStoryData(res.data.data);
//         setLoading(false);
//       } catch (err) {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   // }, []);

//   // testing with api call
//   const handeltest = async () => {
//     const res = await fetchData();
//     console.log("Fetched Story Data:", res);
//   };

//   const generatePages = () => {
//     if (!storyData) return [];
//     const allPages = [];

//     allPages.push({
//       type: 'cover',
//       jsx: (
//         <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex flex-col items-center justify-center p-12 text-white rounded-lg">
//           <svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//           </svg>
//           <h1 className="text-5xl font-bold mb-4 text-center">{storyData.title}</h1>
//           <p className="text-xl mb-2">Genre: {storyData.genre}</p>
//           <div className="mt-8">
//             <p className="text-sm italic mb-2">Characters:</p>
//             {storyData.characterDetails.map((char, i) => (
//               <p key={i} className="text-lg font-semibold">{char.name}</p>
//             ))}
//           </div>
//         </div>
//       )
//     });

//     storyData.pages.forEach((page) => {
//       allPages.push({
//         type: 'image',
//         number: page.pageNumber,
//         jsx: (
//           <div className="w-full h-full relative rounded-lg overflow-hidden">
//             <img
//               src={page.characterImage.s3Url}
//               alt={`Page ${page.pageNumber}`}
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full font-semibold">
//               {page.pageNumber}
//             </div>
//           </div>
//         )
//       });

//       allPages.push({
//         type: 'text',
//         number: page.pageNumber,
//         jsx: (
//           <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 p-10 rounded-lg flex flex-col justify-center">
//             <p className="text-gray-800 leading-relaxed text-justify text-lg" style={{ fontFamily: 'Georgia, serif' }}>
//               {page.text}
//             </p>
//             <div className="mt-6 text-center text-gray-500 text-sm font-medium">
//               Page {page.pageNumber}
//             </div>
//           </div>
//         )
//       });
//     });

//     allPages.push({
//       type: 'back',
//       jsx: (
//         <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col items-center justify-center p-12 text-white rounded-lg">
//           <h2 className="text-4xl font-bold mb-4">The End</h2>
//           <p className="text-xl italic max-w-md text-center mb-8">
//             Thank you for reading this {storyData.genre.toLowerCase()} story
//           </p>
//           <div className="text-center">
//             <p className="text-sm opacity-75">Created with</p>
//             <p className="text-3xl font-bold mt-2">GHOST.ai</p>
//           </div>
//         </div>
//       )
//     });

//     return allPages;
//   };

//   const pages = generatePages();

//   const nextPage = () => {
//     if (currentPage < pages.length - 1 && !isFlipping) {
//       setIsFlipping(true);
//       setCurrentPage(currentPage + 1);
//       setTimeout(() => setIsFlipping(false), 500);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 0 && !isFlipping) {
//       setIsFlipping(true);
//       setCurrentPage(currentPage - 1);
//       setTimeout(() => setIsFlipping(false), 500);
//     }
//   };

//   const goToCover = () => {
//     if (!isFlipping) {
//       setIsFlipping(true);
//       setCurrentPage(0);
//       setTimeout(() => setIsFlipping(false), 500);
//     }
//   };

//   const pageLabel = () => {
//     if (currentPage === 0) return "Cover";
//     if (currentPage === pages.length - 1) return "Back Cover";
//     return `Page ${currentPage} / ${pages.length - 2}`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <Loader className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
//           <p className="text-white text-xl">Loading your story...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-8 px-4">

// <button onClick={handeltest} className="bg-red-700">Test Fetch</button>

//       <div className="max-w-7xl mx-auto">
//         <button
//           onClick={goToCover}
//           className="text-white flex items-center gap-2 hover:text-purple-400 transition-colors mb-6">
//           <ChevronLeft size={20} />
//           Back to Cover
//         </button>

//         <div className="flex justify-center items-center mb-6">
//           <h1 className="text-white text-5xl font-bold">GHOST.ai</h1>
//         </div>

//         <div className="flex justify-center mb-8">
//           <div className="bg-gray-900 px-6 py-4 rounded-xl border border-gray-700 flex flex-wrap items-center gap-4 text-white">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={prevPage}
//                 disabled={currentPage === 0}
//                 className="hover:text-purple-400 transition-colors disabled:opacity-30">
//                 <ChevronLeft size={20} />
//               </button>
//               <span className="min-w-32 text-center font-medium">{pageLabel()}</span>
//               <button
//                 onClick={nextPage}
//                 disabled={currentPage === pages.length - 1}
//                 className="hover:text-purple-400 transition-colors disabled:opacity-30">
//                 <ChevronRight size={20} />
//               </button>
//             </div>

//             <div className="h-6 w-px bg-gray-700" />

//             <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
//               <Edit size={16} /> Edit
//             </button>

//             <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
//               <Scissors size={16} /> Eraser
//             </button>

//             <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
//               <Users size={16} /> Face Swap
//             </button>
//           </div>
//         </div>

//         <div className="flex justify-center">
//           <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
//             <div 
//               className={`transition-all duration-500 ${isFlipping ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}
//               style={{ width: '700px', height: '500px' }}>
//               {pages[currentPage]?.jsx}
//             </div>

//             <div className="flex justify-center gap-2 mt-6">
//               {pages.map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => {
//                     if (!isFlipping) {
//                       setIsFlipping(true);
//                       setCurrentPage(idx);
//                       setTimeout(() => setIsFlipping(false), 500);
//                     }
//                   }}
//                   className={`h-2 rounded-full transition-all ${
//                     idx === currentPage 
//                       ? 'w-8 bg-purple-500' 
//                       : 'w-2 bg-gray-600 hover:bg-gray-500'
//                   }`}
//                 />
//               ))}
//             </div>

//             <div className="flex justify-center gap-4 mt-8">
//               <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-all font-semibold shadow-lg transform hover:scale-105">
//                 Add to Cart
//               </button>
//               <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg transition-all font-semibold shadow-lg transform hover:scale-105">
//                 Order Now
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StoryFlipbook;



// import React, { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight, Edit, Scissors, Users, Loader } from "lucide-react";

// const StoryFlipbook = ({ storyId }) => {
//   const [currentPage, setCurrentPage] = useState(0);
//   const [storyData, setStoryData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isFlipping, setIsFlipping] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         // Replace with your actual API call
//         // import api from "../../services/axiosInstance";
//         const res = await api.get(`/api/v1/story/69369845df64de927c9c8658`);
//         // const res = await api.get(`/api/v1/story/${storyId}`);
        
//         // For now, using mock data - replace this with your actual API call
//         const mockResponse = {
//           data: {
//             data: {
//               story: {
//                 _id: "69369845df64de927c9c8658",
//                 title: "Paws of Love",
//                 genre: "Family",
//                 numOfPages: 5,
//                 characterDetails: [
//                   { name: "Character 1", details: "details" },
//                   { name: "Character 2", details: "details" }
//                 ],
//                 orientation: "Landscape",
//                 status: "generating",
//                 pages: [
//                   {
//                     _id: "693699283ee4b206be4066e",
//                     pageNumber: 1,
//                     text: "A warm glow filled the room as she sat surrounded by her loving family. The gentle hum of conversation and the soft clinking of tea cups created a sense of comfort and belonging.",
//                     characterImage: {
//                       s3Url: "https://ghostverse-images.s3.amazonaws.com/stories/6935bf795b1ae90ed9afc6a5/characters/653757b6-1bc6-453e-b094-f3a7531eec05-page-1.png"
//                     }
//                   },
//                   {
//                     _id: "693699283ee4b206be40670",
//                     pageNumber: 2,
//                     text: "As the day unfolded, laughter and stories were shared, weaving a tapestry of memories that would be treasured forever. The bonds of love grew stronger with each passing moment.",
//                     characterImage: {
//                       s3Url: "https://ghostverse-images.s3.amazonaws.com/stories/6935bf795b1ae90ed9afc6a5/characters/5a40f4a2-7825-4bd3-b30f-ae5182acdd47-page-2.png"
//                     }
//                   },
//                   {
//                     _id: "693699283ee4b206be40672",
//                     pageNumber: 3,
//                     text: "In the quiet moments between words, hearts connected in ways words never could. The simple act of being together spoke volumes about the depth of their love.",
//                     characterImage: {
//                       s3Url: "https://ghostverse-images.s3.amazonaws.com/stories/6935bf795b1ae90ed9afc6a5/characters/653757b6-1bc6-453e-b094-f3a7531eec05-page-1.png"
//                     }
//                   },
//                   {
//                     _id: "693699283ee4b206be40671",
//                     pageNumber: 4,
//                     text: "As the sun began to set, painting the sky in shades of amber and gold, they knew that these moments were precious gifts to be cherished always.",
//                     characterImage: {
//                       s3Url: "https://ghostverse-images.s3.amazonaws.com/stories/6935bf795b1ae90ed9afc6a5/characters/5a40f4a2-7825-4bd3-b30f-ae5182acdd47-page-2.png"
//                     }
//                   },
//                   {
//                     _id: "693699283ee4b206be40674",
//                     pageNumber: 5,
//                     text: "And so, surrounded by love and warmth, they found their happiness in the simple beauty of being together, a family united by unbreakable bonds.",
//                     characterImage: {
//                       s3Url: "https://ghostverse-images.s3.amazonaws.com/stories/6935bf795b1ae90ed9afc6a5/characters/653757b6-1bc6-453e-b094-f3a7531eec05-page-1.png"
//                     }
//                   }
//                 ]
//               }
//             }
//           }
//         };

//         // When you integrate with real API, use this:
//         // const res = await api.get(`/api/v1/story/${storyId || "69369845df64de927c9c8658"}`);
//         // console.log("Fetched Story Data:", res.data.data);
        
//         // Check if the response has the expected structure
//         const story = mockResponse.data.data.story || mockResponse.data.data;
        
//         // Filter out pages that don't have images yet (for generating status)
//         if (story.pages) {
//           story.pages = story.pages.filter(page => 
//             page.characterImage && page.characterImage.s3Url
//           );
//         }
        
//         setStoryData(story);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching story:", err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [storyId]);

//   const generatePages = () => {
//     if (!storyData || !storyData.pages || storyData.pages.length === 0) {
//       return [];
//     }
    
//     const allPages = [];

//     // Front Cover
//     allPages.push({
//       type: 'cover',
//       jsx: (
//         <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex flex-col items-center justify-center p-12 text-white rounded-lg">
//           <svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//           </svg>
//           <h1 className="text-5xl font-bold mb-4 text-center">{storyData.title}</h1>
//           <p className="text-xl mb-2">Genre: {storyData.genre}</p>
//           {storyData.characterDetails && storyData.characterDetails.length > 0 && (
//             <div className="mt-8">
//               <p className="text-sm italic mb-2">Characters:</p>
//               {storyData.characterDetails.map((char, i) => (
//                 <p key={i} className="text-lg font-semibold">{char.name}</p>
//               ))}
//             </div>
//           )}
//           <div className="mt-6 text-sm opacity-75">
//             {storyData.numOfPages} Pages
//           </div>
//         </div>
//       )
//     });

//     // Story Pages
//     storyData.pages.forEach((page) => {
//       // Image Page
//       allPages.push({
//         type: 'image',
//         number: page.pageNumber,
//         jsx: (
//           <div className="w-full h-full relative rounded-lg overflow-hidden bg-gray-900">
//             <img
//               src={page.characterImage?.s3Url}
//               alt={`Page ${page.pageNumber}`}
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 e.target.src = 'https://via.placeholder.com/700x500/1F2937/9CA3AF?text=Image+Loading...';
//               }}
//             />
//             <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full font-semibold">
//               {page.pageNumber}
//             </div>
//           </div>
//         )
//       });

//       // Text Page
//       allPages.push({
//         type: 'text',
//         number: page.pageNumber,
//         jsx: (
//           <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 p-10 rounded-lg flex flex-col justify-center">
//             <div className="max-h-full overflow-y-auto">
//               <p className="text-gray-800 leading-relaxed text-justify text-lg" style={{ fontFamily: 'Georgia, serif' }}>
//                 {page.text}
//               </p>
//             </div>
//             <div className="mt-6 text-center text-gray-500 text-sm font-medium">
//               Page {page.pageNumber}
//             </div>
//           </div>
//         )
//       });
//     });

//     // Back Cover
//     allPages.push({
//       type: 'back',
//       jsx: (
//         <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col items-center justify-center p-12 text-white rounded-lg">
//           <h2 className="text-4xl font-bold mb-4">The End</h2>
//           <p className="text-xl italic max-w-md text-center mb-8">
//             Thank you for reading this {storyData.genre?.toLowerCase()} story
//           </p>
//           <div className="text-center">
//             <p className="text-sm opacity-75">Created with</p>
//             <p className="text-3xl font-bold mt-2">GHOST.ai</p>
//           </div>
//         </div>
//       )
//     });

//     return allPages;
//   };

//   const pages = generatePages();

//   const nextPage = () => {
//     if (currentPage < pages.length - 1 && !isFlipping) {
//       setIsFlipping(true);
//       setCurrentPage(currentPage + 1);
//       setTimeout(() => setIsFlipping(false), 500);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 0 && !isFlipping) {
//       setIsFlipping(true);
//       setCurrentPage(currentPage - 1);
//       setTimeout(() => setIsFlipping(false), 500);
//     }
//   };

//   const goToCover = () => {
//     if (!isFlipping) {
//       setIsFlipping(true);
//       setCurrentPage(0);
//       setTimeout(() => setIsFlipping(false), 500);
//     }
//   };

//   const pageLabel = () => {
//     if (pages.length === 0) return "No Pages";
//     if (currentPage === 0) return "Cover";
//     if (currentPage === pages.length - 1) return "Back Cover";
//     return `Page ${currentPage} / ${pages.length - 2}`;
//   };

//   // Get page dimensions based on orientation
//   const getPageDimensions = () => {
//     if (!storyData) return { width: '700px', height: '500px' };
    
//     switch (storyData.orientation) {
//       case 'Portrait':
//         return { width: '450px', height: '650px' };
//       case 'Square':
//         return { width: '500px', height: '500px' };
//       case 'Landscape':
//       default:
//         return { width: '700px', height: '500px' };
//     }
//   };

//   const pageDimensions = getPageDimensions();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <Loader className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
//           <p className="text-white text-xl">Loading your story...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
//         <div className="text-center text-white">
//           <p className="text-xl mb-4 text-red-400">Error loading story</p>
//           <p className="text-gray-400">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (!storyData || !storyData.pages || storyData.pages.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
//         <div className="text-center text-white">
//           <p className="text-xl mb-4">Story is being generated...</p>
//           <p className="text-gray-400">Please check back in a few moments</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 py-8 px-4">
//       <div className="max-w-7xl mx-auto">
//         <button
//           onClick={goToCover}
//           className="text-white flex items-center gap-2 hover:text-purple-400 transition-colors mb-6">
//           <ChevronLeft size={20} />
//           Back to Cover
//         </button>

//         <div className="flex justify-center items-center mb-6">
//           <h1 className="text-white text-5xl font-bold">GHOST.ai</h1>
//         </div>

//         <div className="flex justify-center mb-8">
//           <div className="bg-gray-900 px-6 py-4 rounded-xl border border-gray-700 flex flex-wrap items-center gap-4 text-white">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={prevPage}
//                 disabled={currentPage === 0 || isFlipping}
//                 className="hover:text-purple-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
//                 <ChevronLeft size={20} />
//               </button>
//               <span className="min-w-32 text-center font-medium">{pageLabel()}</span>
//               <button
//                 onClick={nextPage}
//                 disabled={currentPage === pages.length - 1 || isFlipping}
//                 className="hover:text-purple-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
//                 <ChevronRight size={20} />
//               </button>
//             </div>

//             <div className="h-6 w-px bg-gray-700" />

//             <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
//               <Edit size={16} /> Edit
//             </button>

//             <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
//               <Scissors size={16} /> Eraser
//             </button>

//             <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
//               <Users size={16} /> Face Swap
//             </button>
//           </div>
//         </div>

//         <div className="flex justify-center">
//           <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
//             <div 
//               className={`transition-all duration-500 ${isFlipping ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}
//               style={pageDimensions}>
//               {pages[currentPage]?.jsx}
//             </div>

//             <div className="flex justify-center gap-2 mt-6">
//               {pages.map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => {
//                     if (!isFlipping) {
//                       setIsFlipping(true);
//                       setCurrentPage(idx);
//                       setTimeout(() => setIsFlipping(false), 500);
//                     }
//                   }}
//                   className={`h-2 rounded-full transition-all ${
//                     idx === currentPage 
//                       ? 'w-8 bg-purple-500' 
//                       : 'w-2 bg-gray-600 hover:bg-gray-500'
//                   }`}
//                 />
//               ))}
//             </div>

//             <div className="flex justify-center gap-4 mt-8">
//               <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-all font-semibold shadow-lg transform hover:scale-105">
//                 Add to Cart
//               </button>
//               <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg transition-all font-semibold shadow-lg transform hover:scale-105">
//                 Order Now
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StoryFlipbook;