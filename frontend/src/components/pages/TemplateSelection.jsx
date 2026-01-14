import { useEffect, useState, useContext } from "react";
import api from "../../services/axiosInstance";
import { AppContext } from "../../context/AppContext";
import { useParams, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { ProgressStep3 } from '../helperComponents/Steps.jsx'
import storyImage from "../../assets/images/story-image-1.jpg";

const TemplateSelection = () => {
  const params = useParams();
  const { navigateTo } = useContext(AppContext);
  const [ storyIdParam, setStoryIdParam] = useState(params.storyId || null);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const incomingPreviews = location.state?.previews || null;
  const [previewImages, setPreviewImages] = useState(incomingPreviews);

  const templates = [
    { name: "Landscape", size: "1536x1024", aspect: "landscape" },
    { name: "Portrait", size: "1024x1536", aspect: "portrait" },
    { name: "Square", size: "1024x1024", aspect: "square" },
  ];
  
  // console.log("selected template:",  templates[selectedTemplate].name);

  useEffect(() => {
    // Fetch story data 
    const fetchStoryData = async () => {
      try {
        const response = await api.get(`/api/v1/story/${storyIdParam}`);
        if (import.meta.env.DEV) console.log("Story data loaded");
        setStoryData(response.data.data.story);
      } catch (error) {
        console.error("Error fetching story data:", error);
      }
    };

    fetchStoryData();
    if (incomingPreviews) setPreviewImages(incomingPreviews);
  }, []);

  
  const saveGist = async () => {
    // Persist edited gist to backend; backend validates and stores securely
    await api.patch(`/api/v1/story/${storyIdParam}/gist`, {
      gist: storyData?.gist,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // 1) Save edited gist first
      await saveGist();

      // 2) Generate story; backend reads gist from DB
      const response = await api.post("/api/v1/story/create", {
        storyId: storyIdParam,
        genres: storyData?.genres || (storyData?.genre ? [storyData.genre] : []),
        numCharacters: storyData?.numCharacters,
        characterDetails: storyData?.characterDetails,
        numPages: storyData?.numOfPages,
        orientation: templates[selectedTemplate].name,
      });

      navigateTo(`/titlegenerator/${storyIdParam}`);
      if (import.meta.env.DEV) console.log("Story generation started");
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-black">
      <ProgressStep3 />
      {/* <button className="bg-red-700" onClick={fetchdata}>test btn</button> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6">
        <div className="p-4 md:p-6">
          <h1 className="text-lg md:text-4xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">Genre</h1>
          <p className="text-white text-sm md:text-base">{(Array.isArray(storyData?.genres) && storyData.genres.length) ? storyData.genres.join(', ') : storyData?.genre || '—'}</p>

          <h2 className="text-lg md:text-xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">
            Character
          </h2>
          <div className="flex flex-wrap gap-2">
            {storyData?.characterDetails?.map((char, index) => (
              <span
                key={index-1}
                className="bg-gray-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                {char.name}
              </span>
            ))}
          </div>
          {/* <h2 className="text-xl font-bold text-purple-400 mt-6 mb-2">Gist <small>(you can edit this prompt)</small> </h2> */}
          <h2 className="text-lg md:text-xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">Prompt <small className="text-xs md:text-sm text-white font-light">(you can edit this prompt)</small> </h2>
          <textarea
            className="text-gray-300 text-xs md:text-sm leading-relaxed border border-gray-700 rounded-lg w-full p-3 md:p-4 bg-gray-800 min-h-[120px]"
            rows={5}
            value={storyData?.gist}
            onChange={(e) => {
            setStoryData((prev) => ({ ...prev, gist: e.target.value }));
            // auto-resize: reset height then set to scrollHeight
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          />

            {/* loading indicator */}
            {loading && (
              <div className="mt-4 md:mt-6">
                <p className="text-center text-purple-300 text-xs md:text-sm mb-2">
                  Generating scenes…✨ wait for 1 to 2 minutes.
                </p>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-[scroll_1.5s_linear_infinite]"></div>
                </div>
              </div>
            )}


          <button className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-3 md:py-3.5 rounded-lg mt-4 md:mt-6 transition-colors text-sm md:text-base font-semibold"
           onClick={handleSubmit}
           disabled={loading}
          >
            {loading ? "Generating..." : "Generate Story"}
          </button>
        </div>

        <div className="p-4 md:p-0">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 ">Book Templates <small className="text-xs md:text-sm text-white font-light">(select one template)</small></h2>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform: `translateX(-${selectedTemplate * 100}%)`,
                }}>
                {templates.map((template, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-1 md:px-2">
                    <div
                      className={`border-4 rounded-lg overflow-hidden ${
                        selectedTemplate === idx
                          ? "border-purple-500"
                          : "border-gray-700"
                      } ${
                        template.aspect === "portrait"
                          ? "aspect-[2/3]"
                          : template.aspect === "square"
                          ? "aspect-square"
                          : "aspect-[3/2]"
                      } 
                        bg-gray-800 flex items-center justify-center mx-auto
                        max-h-[50vh] md:max-h-[70vh] w-auto relative`}
                      style={{ height: "auto" }}>
                      {previewImages && previewImages[template.aspect] ? (
                        <img
                          src={`data:image/png;base64,${previewImages[template.aspect].base64 || previewImages[template.aspect]}`}
                          alt={template.name}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <img
                          src={storyImage}
                          alt={template.name}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      )}
                      <div className="text-center relative z-10 bg-black/60 px-4 py-3 rounded-lg backdrop-blur-sm">
                     <div className="flex items-center justify-center gap-2">
                          <p className="text-white font-bold text-sm md:text-base">{template.name}</p>
                          {selectedTemplate === idx && (
                            <BadgeCheck size={18} className="text-green-400 md:w-5 md:h-5" />
                          )}
                     </div>

                        <p className="text-gray-400 text-xs md:text-sm">{template.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setSelectedTemplate(Math.max(0, selectedTemplate - 1))
              }
              disabled={loading}
              className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 bg-gray-900/90 text-white p-2 md:p-3 rounded-full hover:bg-gray-800 active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation">
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <button
              onClick={() =>
                setSelectedTemplate(
                  Math.min(templates.length - 1, selectedTemplate + 1)
                )
              }
              disabled={loading}
              className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 bg-gray-900/90 text-white p-2 md:p-3 rounded-full hover:bg-gray-800 active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation">
              <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          <div className="flex justify-center gap-2 md:gap-3 mt-4 md:mt-6">
            {templates.map((_, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => setSelectedTemplate(idx)}
                className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all touch-manipulation ${
                  selectedTemplate === idx ? "bg-purple-500 scale-110" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;
