import { useEffect, useState, useContext } from "react";
import api from "../../services/axiosInstance";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { ProgressStep3 } from '../helperComponents/Steps.jsx'

const TemplateSelection = () => {
  const params = useParams();
  const { navigateTo } = useContext(AppContext);
  const [ storyIdParam, setStoryIdParam] = useState(params.storyId || null);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(false);

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
        console.log("Story Data:", response.data.data.story);
        setStoryData(response.data.data.story);
      } catch (error) {
        console.error("Error fetching story data:", error);
      }
    };

    fetchStoryData();
  }, []);

  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await api.post("/api/v1/story/create", {
      storyId: storyIdParam,
      gist: storyData?.gist,
      genre: storyData?.genre,
      numCharacters: storyData?.numCharacters,
      characterDetails: storyData?.characterDetails,
      numPages: storyData?.numOfPages,
      orientation: templates[selectedTemplate].name,
    });
      navigateTo(`/titlegenerator/${storyIdParam}`);
      console.log("Generate Story Response:", response.data);
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <ProgressStep3 />
      {/* <button className="bg-red-700" onClick={fetchdata}>test btn</button> */}
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-purple-400 mb-2">Story Title</h1>
          <p className="text-white">{storyData?.title}</p>

          <h2 className="text-xl font-bold text-purple-400 mt-6 mb-2">Genre</h2>
          <p className="text-white">{storyData?.genre}</p>

          <h2 className="text-xl font-bold text-purple-400 mt-6 mb-2">
            Character
          </h2>
          <div className="flex gap-2">
            {storyData?.characterDetails?.map((char, index) => (
              <span
                key={index-1}
                className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm">
                {char.name}
              </span>
            ))}
          </div>
          {/* <h2 className="text-xl font-bold text-purple-400 mt-6 mb-2">Gist <small>(you can edit this prompt)</small> </h2> */}
          <h2 className="text-xl font-bold text-purple-400 mt-6 mb-2">Prompt <small className="text-sm text-white font-light">(you can edit this prompt)</small> </h2>
          <textarea
            className="text-gray-300 text-sm leading-relaxed border border-gray-700 rounded-lg w-full p-4 bg-gray-800"
            rows={5} cols={80}
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
              <div className="mt-6">
                <p className="text-center text-purple-300 mb-2">
                  Generating scenes…✨ wait for 1 to 2 minutes.
                </p>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-[scroll_1.5s_linear_infinite]"></div>
                </div>
              </div>
            )}


          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg mt-6 transition-colors"
           onClick={handleSubmit}
          >
            Generate Story
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Book Templates <small className="text-sm text-white font-light">(select one template)</small></h2>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform: `translateX(-${selectedTemplate * 100}%)`,
                }}>
                {templates.map((template, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-2">
                    <div
                      className={`border-4 rounded-lg ${
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
                        max-h-[70vh] w-auto`}
                      style={{ height: "auto" }}>
                      <div className="text-center">
                     <div className="flex items-center justify-center gap-2 ms-6">
                          <p className="text-white font-bold">{template.name}</p>
                          {selectedTemplate === idx && (
                            <BadgeCheck size={20} className="text-green-400" />
                          )}
                     </div>

                        <p className="text-gray-400 text-sm">{template.size}</p>
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
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-900/80 text-white p-2 rounded-full hover:bg-gray-800">
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() =>
                setSelectedTemplate(
                  Math.min(templates.length - 1, selectedTemplate + 1)
                )
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-900/80 text-white p-2 rounded-full hover:bg-gray-800">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {templates.map((_, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => setSelectedTemplate(idx)}
                className={`w-3 h-3 rounded-full ${
                  selectedTemplate === idx ? "bg-purple-500" : "bg-gray-600"
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
