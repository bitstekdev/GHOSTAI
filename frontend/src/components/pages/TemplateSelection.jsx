import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TemplateSelection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const templates = [
    { name: "Landscape", size: "1536x1024", aspect: "landscape" },
    { name: "Portrait", size: "1024x1536", aspect: "portrait" },
    { name: "Square", size: "1024x1024", aspect: "square" },
  ];

  return (
    <div className="p-4 md:p-8">
      <button className="text-white mb-4 flex items-center gap-2 hover:text-purple-400">
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-purple-400 mb-2">Story Title</h1>
          <p className="text-white">The Happy face</p>

          <h2 className="text-xl font-bold text-purple-400 mt-6 mb-2">Genre</h2>
          <p className="text-white">Family</p>

          <h2 className="text-xl font-bold text-purple-400 mt-6 mb-2">
            Character
          </h2>
          <div className="flex gap-2">
            {["Saketh", "Lohith", "Shashi"].map((name) => (
              <span
                key={name}
                className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm">
                {name}
              </span>
            ))}
          </div>
          <h2 className="text-xl font-bold text-purple-400 mt-6 mb-2">Gist</h2>
          <textarea
            className="text-gray-300 text-sm leading-relaxed border border-gray-700 rounded-lg w-full p-4 bg-gray-800"
            rows={5} cols={80}
            defaultValue={`The Happy Face, featuring a young man and his cheerful family
            exploring a colorful garden full of butterflies, vibrant flowers,
            and a joyful atmosphere. Design a whimsical cover and back page that
            capture the book's happy and enchanting mood`}
          />
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg mt-6 transition-colors">
            Generate Story
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Book Templates</h2>

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
                        <p className="text-white font-bold">{template.name}</p>
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
