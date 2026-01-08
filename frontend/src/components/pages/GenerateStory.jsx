import { useState, useContext, useEffect, useRef } from "react";
import api from "../../services/axiosInstance";
import { Send, Bot, User, Plus, Image, FileText } from "lucide-react";
import Joyride from 'react-joyride';
import { AppContext } from '../../context/AppContext'
import {ProgressStep1} from '../helperComponents/Steps.jsx'
import { useTourContext } from '../../context/TourContext';
import { generateStoryTourSteps, tourStyles } from '../../config/tourSteps';
import BlurText from '../helperComponents/TextType';
import GenreDropdown from '../helperComponents/GenreDropdown.jsx';

const GenerateStory = () => {
  const {navigateTo, userData} = useContext(AppContext)
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [triggerUploadFromGenre, setTriggerUploadFromGenre] = useState(false);
  const [customGenres, setCustomGenres] = useState([]);
  const [isCustomGenreProcessing, setIsCustomGenreProcessing] = useState(false);

  const [formData, setFormData] = useState({
    genres: [],
    length: "3",
    numCharacters: "2",
    characterDetails: [],
    entryMode: "questionnaire",
    gist: "",
  });

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  // const [currentStep, setCurrentStep] = useState("title"); 
  const [currentStep, setCurrentStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showFirstQuestion, setShowFirstQuestion] = useState(false);

  // Use tour context
  const {
    run,
    stepIndex,
    handleTourCallback: contextHandleCallback,
    activeTour
  } = useTourContext();

  const shouldRunTourOnThisPage = activeTour === 'onboarding' && 
    window.location.pathname === '/generatestory';

  const handleTourCallback = (data) => {
    const { status, type } = data;
    
    if (type === 'tour:end' || status === 'finished') {
      setTimeout(() => {
        navigateTo('/stories');
      }, 500);
    }
    
    contextHandleCallback(data);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentStep]);

  // Fetch learned custom genres
  useEffect(() => {
    if (!userData) return; 

    const fetchCustomGenres = async () => {
      try {
        const res = await api.get("/api/v1/story/custom-genres");
        setCustomGenres(res.data.data?.genres || []);
      } catch (e) {
        console.debug("No custom genres available", e?.message || "");
      }
    };
    fetchCustomGenres();
  }, [userData]);

  // Auto-open file picker when custom genre is selected
  useEffect(() => {
    if (triggerUploadFromGenre) {
      fileInputRef.current?.click();
    }
  }, [triggerUploadFromGenre]);

  // Hide intro after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setShowFirstQuestion(true);
      setMessages([{
        type: "bot",
        text: "👋 Welcome! Let's create your story together. 📖 Select a genre for your story:",
        timestamp: new Date()
      }]);
      setCurrentStep("genre");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      type: "bot",
      text,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      type: "user",
      text,
      timestamp: new Date()
    }]);
  };

  // Central handler to proceed after genres selection
  const proceedAfterGenreSelection = (updatedGenres) => {
    if (!updatedGenres || updatedGenres.length === 0) return;

    addBotMessage(
      `Great choice${updatedGenres.length > 1 ? "s" : ""}! 🎉\nHow many pages would you like your story to be?`
    );

    setCurrentStep("length");
  };

  const handleSendMessage = () => {
    if (!userInput.trim() || loading) return;

    const input = userInput.trim();
    addUserMessage(input);
    setUserInput("");

    setTimeout(() => {
      processUserInput(input);
    }, 500);
  };

  const handleGenreSelect = (value) => {
    if (!value || loading) return;

    // Custom Genre selected
    if (value === "__custom__") {
      addUserMessage("Custom Genre");
      setFormData(prev => ({ ...prev, genres: [...(prev.genres || []), "Custom"] }));
      addBotMessage(
        "Awesome 🎨 Upload a reference document to define your custom genre."
      );

      setTriggerUploadFromGenre(true);
      setShowUploadMenu(true);
      setIsCustomGenreProcessing(true);
      // DO NOT advance step yet; wait for upload + processing to complete
      return;
    }

    // Normal genres
    addUserMessage(value);
    processUserInput(value);
  };

  const processUserInput = (input) => {
    switch (currentStep) {
      /* title step removed — flow starts at genre */

      case "genre":
        // allow user to type 'continue' to proceed when they have selected at least one genre via UI
        if (input.toLowerCase() === "continue" && formData.genres && formData.genres.length > 0) {
          proceedAfterGenreSelection(formData.genres);
          return;
        }

        const validGenres = ["Fantasy", "Adventure", "Family", "Mystery", "Housewarming", "Corporate Promotion", "Marriage", "Baby Shower", "Birthday", "Sci-Fi"];
        const genre = validGenres.find(g => g.toLowerCase() === input.toLowerCase());

        if (genre) {
          setFormData(prev => ({ ...prev, genres: [genre] }));
          addBotMessage(`${genre}? Excellent choice! 🎉 How many pages would you like your story to be? `);
          setCurrentStep("length");
        } else {
          addBotMessage("Please choose a valid genre from the list above.");
        }
        break;

      case "length":
        const length = parseInt(input);
        if (length >= 1 && length <= 20) {
          setFormData(prev => ({ ...prev, length: length.toString() }));
          addBotMessage(`Perfect! ${length} page${length > 1 ? 's' : ''} it is! 📄 How many main characters will be in your story? (1-20)`);
          setCurrentStep("numCharacters");
        } else {
          addBotMessage("Please enter a number between 1 and 20.");
        }
        break;

      case "numCharacters":
        const numChars = parseInt(input);
        if (numChars >= 1 && numChars <= 10) {
          setFormData(prev => ({ ...prev, numCharacters: numChars.toString() }));
          if (numChars > 0) {
            addBotMessage(`Great! Now let's add details for your ${numChars} character${numChars > 1 ? 's' : ''}. 👤`);
            addBotMessage("Please provide the name of character #1:");
            setCurrentStep("characterName");
            setCurrentCharacter({ index: 0, name: "", details: "" });
          } else {
            showConfirmation();
          }
        } else {
          addBotMessage("Please enter a number between 1 and 10.");
        }
        break;

      case "characterName":
        setCurrentCharacter(prev => ({ ...prev, name: input }));
        addBotMessage(`Nice 😊 Now, tell me some details about ${input} and appearance (e.g., "yogesh : indian male, burgandy hair, wearing biege sweatshirt, wearing blue jeans, wearing brown shoes, clam, intelligent")`);
        setCurrentStep("characterDetails");
        break;

      case "characterDetails":
        const newChar = { name: currentCharacter.name, details: input };
        const updatedFormData = {
          ...formData,
          characterDetails: [...formData.characterDetails, newChar]
        };

        setFormData(updatedFormData);
        
        const nextIndex = currentCharacter.index + 1;
        const totalChars = parseInt(updatedFormData.numCharacters, 10);
        
        if (nextIndex < totalChars) {
          addBotMessage(`Character added! ✅ Now, please provide the name of character #${nextIndex + 1}:`);
          setCurrentStep("characterName");
          setCurrentCharacter({ index: nextIndex, name: "", details: "" });
        } else {
          showConfirmation(updatedFormData);
        }
        break;

      case "confirm":
        if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
          addBotMessage(
`Awesome! One last thing 😊

How would you like to continue?

1️⃣ Guide me further with questions  
2️⃣ I already know what the book should be about

(Type 1 or 2)`
          );
          setCurrentStep("storyDirection");
        } else {
          addBotMessage("What would you like to change? (title, genre, length, characters)");
          setCurrentStep("edit");
        }
        break;

      case "storyDirection":
        if (input === "1") {
          setFormData(prev => ({ ...prev, entryMode: "questionnaire" }));
          handleSubmit();
        } 
        else if (input === "2") {
          setFormData(prev => ({ ...prev, entryMode: "gist" }));
          addBotMessage(
            "Great 💫 Please describe what your book should be about. This will become the story prompt."
          );
          setCurrentStep("gistInput");
        } 
        else {
          addBotMessage("Please type 1 or 2 to continue.");
        }
        break;

      case "gistInput":
        if (input.length < 20) {
          addBotMessage("Can you share a bit more detail so I can shape it into a story?");
          return;
        }

        const nextData = { ...formData, entryMode: "gist", gist: input.trim() };
        setFormData(nextData);
        handleSubmit(nextData);
        break;

      case "edit":
        const editChoice = input.toLowerCase();
        if (editChoice.includes("title")) {
          addBotMessage("Titles are no longer requested. You can edit the genre, length, or characters instead.");
          setCurrentStep("genre");
        } else if (editChoice.includes("genre")) {
          addBotMessage("Select the Genre or occasion? ");
          setCurrentStep("genre");
        } else if (editChoice.includes("length")) {
          addBotMessage("Number of pages? (1-10)");
          setCurrentStep("length");
        } else if (editChoice.includes("character")) {
          setFormData(prev => ({ ...prev, characterDetails: [] }));
          addBotMessage("Let's start over with characters. What's the name of your first character?");
          setCurrentStep("characterName");
          setCurrentCharacter({ index: 0, name: "", details: "" });
        } else {
          addBotMessage("Please specify what you'd like to edit: title, genre, length, or characters");
        }
        break;

      default:
        break;
    }
  };

  const showConfirmation = (dataOverride) => {
    const summaryData = dataOverride ?? formData;
    const summary = `
  📚 **Story Summary:**
  - Genres: ${(summaryData.genres || []).join(', ')}
  - Length: ${summaryData.length} page${summaryData.length > 1 ? 's' : ''}
  - Characters: ${summaryData.numCharacters}
  ${summaryData.characterDetails.map((char, i) => `  ${i + 1}. ${char.name} - ${char.details}`).join('\n')}

  Is this correct? (Type 'yes' to proceed or 'no' to make changes)
    `;
    addBotMessage(summary);
    setCurrentStep("confirm");
  };

  const handleSubmit = async (payload) => {
    const dataToSend = payload || formData;

    // Guard: Ensure all required fields are present
    if (
      !dataToSend.genres || dataToSend.genres.length === 0 ||
      !dataToSend.length ||
      !dataToSend.numCharacters ||
      dataToSend.characterDetails.length !== Number(dataToSend.numCharacters)
    ) {
      addBotMessage("❌ Please complete all story details before continuing.");
      return;
    }

    // Guard: Gist users must provide valid gist
    if (
      dataToSend.entryMode === "gist" &&
      (!dataToSend.gist || dataToSend.gist.length < 20)
    ) {
      addBotMessage("❌ Please provide a valid story idea (at least 20 characters).");
      return;
    }

    setLoading(true);
    addBotMessage("Creating your amazing story... ✨");

    try {
      const response = await api.post("/api/v1/story/start", dataToSend);
      const { storyId, data } = response.data;

      // Store conversation ONLY for questionnaire users
      if (dataToSend.entryMode === "questionnaire" && data?.conversation) {
        localStorage.setItem(
          "conversationData",
          JSON.stringify({
            storyId,
            conversation: data.conversation,
          })
        );
      }

      addBotMessage("Redirecting you now... 🎉");
      setTimeout(() => {
        if (dataToSend.entryMode === "questionnaire") {
          navigateTo(`/questioner/${storyId}`);
        } else {
          navigateTo(`/templateselection/${storyId}`);
        }
      }, 1200);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred";
      setMsg(errorMsg);
      addBotMessage(`Oops! ${errorMsg} Please try again.`);
      console.error("Error submitting story:", error);
    } finally {
      setLoading(false);
    }
  };

    // Upload handler for custom genre files
    const handleCustomGenreUpload = async (files) => {
      console.log("UPLOAD HANDLER FIRED", files);
      if (!files || files.length === 0) return;
      // ensure processing UI state is set when upload starts
      setIsCustomGenreProcessing(true);

      const fd = new FormData();
      Array.from(files).forEach((file) => fd.append("files", file));

      try {
        setLoading(true);
        addBotMessage("📚 Uploading & training your custom genre...");

        const res = await api.post("/api/v1/story/upload-genre", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Give user accurate feedback based on process result
        if (res.data?.process) {
          addBotMessage("✅ Custom genre processed successfully!");
        } else {
          addBotMessage("⚠️ Upload complete — processing may still be in progress.");
        }

        // Refresh learned genres list and auto-apply active genre if present
        try {
          const refreshed = await api.get("/api/v1/story/custom-genres");
          const genres = refreshed.data.data?.genres || [];
          const activeGenre = refreshed.data.data?.activeGenre || (genres.length ? genres[0] : null);

          setCustomGenres(genres);

          // Auto-apply learned style and continue flow
          if (activeGenre) {
            setFormData(prev => ({ ...prev, genres: [activeGenre] }));
            addBotMessage(`🧠 Custom genre trained and selected: ${activeGenre}`);
            addBotMessage("You can keep this genre or choose one more (max 2). ");
            addBotMessage("Type 'continue' or select another genre.");
            setCurrentStep("genre");
          }
        } catch (e) {
          console.debug("Failed to refresh custom genres", e?.message || "");
        }
      } catch (err) {
        addBotMessage("❌ Failed to train custom genre. Check console for details.");
        console.error("UPLOAD FAILED", err?.response?.data || err);
      } finally {
        setLoading(false);
        // reset processing/trigger state (menu was closed immediately on file select)
        setIsCustomGenreProcessing(false);
        setTriggerUploadFromGenre(false);
      }
    };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col">
      <Joyride
        steps={generateStoryTourSteps}
        run={run && shouldRunTourOnThisPage}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        callback={handleTourCallback}
        styles={tourStyles}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Next Page',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
      
      <ProgressStep1 />

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col items-center justify-center w-full pb-20">
        {/* Messages Container */}
        <div className="w-full max-w-4xl px-4 flex-1 flex flex-col justify-start overflow-y-visible pt-8 relative">
          
          {/* Intro Text in Center */}
          {showIntro && (
            <div className="absolute top-[40%] left-[15%] flex justify-start">
              <div className="max-w-3xl flex justify-start">
                <BlurText
                  text="Create a book where your story lives."
                  delay={30}
                  className="text-3xl md:text-3xl font-bold text-left px-4 whitespace-nowrap"
                  animateBy="words"
                  direction="top"
                />
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {showFirstQuestion && (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-xl">
                    {/* Heading */}
                    <p
                      className={`text-sm font-semibold mb-1 ${
                        message.type === 'user'
                          ? 'text-gray-400 text-right'
                          : 'text-purple-300'
                      }`}
                    >
                      {message.type === 'user' ? 'You' : 'Ghostverse AI'}
                    </p>

                    {/* Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-gray-800 text-gray-100 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line text-base leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {currentStep === "genre" && !isCustomGenreProcessing && (
<div className="
  inline-block
  bg-[#0b1220]
  border border-gray-800
  rounded-xl
  px-4 py-3
  max-w-md
">
    <span className="text-sm font-semibold text-gray-200 mb-1 block">Select a genre</span>

    <GenreDropdown
      value={(formData.genres || []).join(", ")}
      customGenres={customGenres}
      onSelect={(genre) => {
        let nextGenres = [];

        // enforce up to 2 genres and prevent mixing custom + static genres
        setFormData(prev => {
          const existing = prev.genres || [];
          if (existing.includes(genre)) return prev;

          const isCustom = customGenres.includes(genre);
          const existingHasCustom = existing.some(g => customGenres.includes(g));
          const existingHasStatic = existing.some(g => !customGenres.includes(g));

          if (existing.length > 0 && ((existingHasCustom && !isCustom) || (existingHasStatic && isCustom))) {
            addBotMessage("⚠️ Cannot mix custom and standard genres. Choose either custom or standard genres.");
            return prev;
          }

          if (existing.length >= 2) {
            addBotMessage("⚠️ You can select up to 2 genres only.");
            return prev;
          }

          nextGenres = [...existing, genre];
          return { ...prev, genres: nextGenres };
        });

        addUserMessage(genre);

        // Only auto-proceed when user has selected 2 genres
        setTimeout(() => {
          if (nextGenres.length === 2) {
            proceedAfterGenreSelection(nextGenres);
          }
        }, 0);
      }}
      onNewCustomGenre={() => {
        addUserMessage("Custom Genre");
        // prevent mixing when existing selection contains static genres
        setFormData(prev => {
          const existing = prev.genres || [];
          const existingHasStatic = existing.some(g => !customGenres.includes(g));
          if (existing.length > 0 && existingHasStatic) {
            addBotMessage("⚠️ Cannot mix custom and standard genres. Choose either custom or standard genres.");
            return prev;
          }
          return { ...prev, genres: [...existing, "Custom"] };
        });
        addBotMessage("Awesome 🎨 Upload a reference document to define your custom genre.");
        setShowUploadMenu(true);
        setTriggerUploadFromGenre(true);
        setIsCustomGenreProcessing(true);
      }}
    />
  </div>
)}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Ask Anything Style */}
        <div className="fixed bottom-0 left-8 right-0 bg-black py-6 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Hidden Image Input */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setShowUploadMenu(false);
                setIsCustomGenreProcessing(true);
                handleCustomGenreUpload(e.target.files);
                e.target.value = null;
              }}
            />

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                setShowUploadMenu(false);
                setIsCustomGenreProcessing(true);
                handleCustomGenreUpload(e.target.files);
                e.target.value = null;
              }}
            />

            <div className="relative -mx-[6%]">
              {/* Plus Button */}
              <button
                type="button"
                onClick={() => setShowUploadMenu(prev => !prev)}
                className="
                  absolute left-4 top-1/2 -translate-y-1/2
                  text-gray-400
                  hover:text-purple-400
                  transition
                "
                title="Upload"
              >
                <Plus size={22} />
              </button>

              {/* Upload Menu */}
              {showUploadMenu && (
                <div className="
                  absolute bottom-14 left-2
                  bg-[#020617]
                  border border-gray-800
                  rounded-xl
                  shadow-lg
                  w-44
                  z-50
                  overflow-hidden
                ">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="
                      flex items-center gap-3
                      px-4 py-3
                      w-full
                      text-sm
                      text-gray-200
                      hover:bg-gray-800
                    "
                  >
                    <Image size={16} />
                    Upload Image
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="
                      flex items-center gap-3
                      px-4 py-3
                      w-full
                      text-sm
                      text-gray-200
                      hover:bg-gray-800
                    "
                  >
                    <FileText size={16} />
                    Upload File
                  </button>
                </div>
              )}

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                placeholder={loading ? "Processing..." : "Type here..."}
                className="
                  w-full
                  bg-[#0f172a]
                  text-white
                  placeholder-gray-400
                  px-5 pr-18 pl-12 py-3
                  rounded-full
                  border-2 border-purple-600
                  focus:outline-none
                  focus:ring-2 focus:ring-purple-600/40
                  transition
                "
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading}
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={loading || !userInput.trim()}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-gray-400
                  hover:text-purple-400
                  transition
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                "
                title="Send message"
              >
                <Send size={22} />
              </button>
            </div>

            {msg && (
              <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-xs">{msg}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateStory;

