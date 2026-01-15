import { useEffect, useState, useContext, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import { getConversationByStoryId, saveConversationByStoryId } from "../../utils//conversationStorage.js";
import api from "../../services/axiosInstance";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { ProgressStep2 } from "../helperComponents/Steps.jsx";

export default function QuestionerPage() {
  const params = useParams();
  const { navigateTo, setStoryId } = useContext(AppContext);

  const [storyIdParam] = useState(params.storyId || null);
  const [conversation, setConversation] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [pendingAnswer, setPendingAnswer] = useState(null);

  // Questionnaire limits
  const MIN_QUESTIONS = 5;
  const MAX_QUESTIONS = 15;

  /* -------------------- Load from localStorage -------------------- */
  // useEffect(() => {
  //   const saved = JSON.parse(localStorage.getItem("conversationData"));
  //   if (saved?.conversation) {
  //     setConversation(saved.conversation);
  //   }
  // }, []);
  // load conversation for this storyId from DB
  useEffect(() => {
  const loadConversation = async () => {
    try {
      setLoading(true);
      console.log("Loading conversation for storyId:", storyIdParam);
      const res = await api.get(`/api/v1/story/${storyIdParam}/conversation`);
      console.log("Conversation response:", res.data);

      const conv = res.data?.data?.conversation || [];

      setConversation(conv);
      saveConversationByStoryId(storyIdParam, conv);
    } catch (err) {
      console.error("Failed to load conversation", err);

      // fallback to cache
      const cached = getConversationByStoryId(storyIdParam);
      if (cached) {
        setConversation(cached);
      }
    } finally {
      setLoading(false);
    }
  };

  if (storyIdParam) {
    loadConversation();
  }
}, [storyIdParam]);

  /* -------------------- Auto Scroll -------------------- */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Keep focus on the input when conversation updates or loading changes
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [conversation, loading]);


  /* -------------------- Next Question -------------------- */
  const handleSend = async () => {
    if (!answer.trim() || loading) return;

    const userAnswer = answer.trim();
    // optimistic UI: show pending answer while waiting for backend 
    setPendingAnswer(userAnswer);
    setAnswer("");
    setLoading(true);

    try {
      const cleanedConversation = conversation.filter((msg) => msg && msg.question);
      const response = await api.post("/api/v1/story/next", {
        storyId: storyIdParam,
        conversation: cleanedConversation,
        answer: userAnswer
      });

      const result = response.data.data;

      // Backend is the single source of truth for conversation state
      setConversation(result.conversation);
      saveConversationByStoryId(storyIdParam, result.conversation);
      setPendingAnswer(null);
    } catch (err) {
      console.error("Next Question Error:", err?.response?.data || err);
      setPendingAnswer(null);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Finish -------------------- */
  const answeredCount = conversation.filter((msg) => msg && msg.question && msg.answer).length;
  const canFinishEarly = answeredCount >= MIN_QUESTIONS;
  const isMaxReached = answeredCount >= MAX_QUESTIONS;

  const handleGetPrompt = async () => {
    try {
      setLoading(true);

      // Only send fully answered Q&A pairs to the gist generator
      const cleanedConversation = conversation.filter(
        (msg) => msg && msg.question && msg.answer
      );

      const response = await api.post("/api/v1/story/gist", {
        storyId: storyIdParam,
        conversation: cleanedConversation
      });

      // Robustly extract gist and storyId from multiple possible response shapes
      const storyId = response.data?.storyId || response.data?.data?.storyId || response.data?.data?._id || null;
      const gist = response.data?.data?.gist || response.data?.gist || null;

      if (!gist || gist.length < 20) {
        console.error("Invalid gist returned", response.data);
        setLoading(false);
        return;
      }

      // Generate previews via FastAPI through backend (no storage)
      let previews = null;
      try {
        // Fetch story to obtain the selected learned style(s)
        let genresToSend = [];
        try {
          const storyRes = await api.get(`/api/v1/story/${storyIdParam}`);
          const storyObj = storyRes.data?.data?.story || storyRes.data?.data || storyRes.data;
          genresToSend = storyObj?.genres || [];
        } catch (fetchErr) {
          console.warn('Failed to fetch story genres, falling back to empty genres array', fetchErr?.response?.data || fetchErr);
        }

        const previewRes = await api.post(`/api/v1/images/gist/preview-images`, { gist, genres: genresToSend });
        previews = previewRes.data?.previews?.images || previewRes.data?.previews || null;
      } catch (previewErr) {
        console.error('Preview generation failed:', previewErr?.response?.data || previewErr);
      }

      if (storyId) setStoryId(storyId);
      navigateTo(`/templateselection/${storyId}`, { state: { previews } });
    } catch (err) {
      console.error("Gist API Error", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <ProgressStep2 />

      {/* Header */}
      {/* <div className="flex items-center justify-center py-4 border-b border-purple-600/30">
        <img src={logoImg} alt="GHOST.ai" className="h-12 mr-2" />
        <span className="text-xl font-bold">Ghostverse.ai</span>
      </div> */}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {conversation.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-lg">Loading your first question...</p>
            </div>
          )}

          {conversation.map((msg, index) => (
            <div key={index}>
              {/* Bot Question */}
              {msg.question && (
                <div className="flex justify-start mb-4">
                  <div className="bg-purple-900/30 border border-purple-600/30 rounded-2xl rounded-tl-sm px-5 py-3 max-w-[80%]">
                    <p className="text-sm font-semibold text-purple-300 mb-1">
                      Ghostverse AI
                    </p>
                    <p className="text-gray-200">{msg.question}</p>
                  </div>
                </div>
              )}

              {/* User Answer */}
              {msg.answer && (
                <div className="flex justify-end mb-4">
                  <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%]">
                    <p className="text-sm font-semibold text-gray-400 mb-1">You</p>
                    <p className="text-white">{msg.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Optimistic pending answer (UI-only) */}
          {pendingAnswer && (
            <div className="flex justify-end mb-4">
              <div className="bg-gray-800 rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%] opacity-80">
                <p className="text-sm font-semibold text-gray-400 mb-1">You</p>
                <p className="text-white">{pendingAnswer}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-purple-900/30 border border-purple-600/30 rounded-2xl px-5 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

     { /* Input Area */}
        <div className="px-6 py-6 bg-black ">
          <div className="max-w-3xl mx-auto">
            {!isMaxReached ? (
          <>
            {/* Helpful hint */}
            {conversation.length > 0 && (
              <div className="text-sm text-gray-400 mb-3">
                You can answer up to {MAX_QUESTIONS} questions. After at least {MIN_QUESTIONS} answers, you may finish anytime.
              </div>
            )}

            <div className="relative">
              {/* Textarea */}
              <textarea
                ref={inputRef}
                autoFocus
                rows={1}
                className="
                  w-full resize-none
                  bg-[#0f172a]
                  text-white
                  placeholder-gray-400
                  px-5 pr-14 py-3
                  rounded-full
                  border-2 border-purple-600
                  focus:outline-none
                  focus:ring-2 focus:ring-purple-600/40
                  scrollbar-hide
                "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none"
                }}
                placeholder="Type your answer..."
                value={answer}
                disabled={loading}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    120
                  )}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              {/* Send Button  */}
              <button
                onClick={handleSend}
                disabled={loading || !answer.trim()}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  flex items-center justify-center
                  text-gray-400
                  hover:text-purple-400
                  transition
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                "
              >
                <Send size={22} />
              </button>
            </div>



            {/* Finish Early Button */}
            {canFinishEarly && (
              <button
                onClick={handleGetPrompt}
                disabled={loading}
                className="mt-4 w-full bg-purple-700/40 hover:bg-purple-700 py-2 rounded-lg text-sm font-semibold transition"
              >
                Finish & Generate Story Now
              </button>
            )}
          </>
          ) : (
            <button
              onClick={handleGetPrompt}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Get My Story Summary"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
