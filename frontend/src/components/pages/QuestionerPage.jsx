import { useEffect, useState, useContext } from "react";
import { AppContext } from '../../context/AppContext'
import logoImg from "../../assets/images/logo.gif";
import api from "../../services/axiosInstance";
import { PenTool } from "lucide-react";

export default function QuestionerPage() {
  const {navigateTo, storyId, setStoryId} = useContext(AppContext)
//   const [storyId, setStoryId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [answer, setAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load initial conversation from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("conversationData"));
    if (saved) {
      setStoryId(saved.storyId);
      setConversation(saved.conversation);
      setCurrentQuestion(saved.conversation[saved.conversation.length - 1]);
    }
  }, []);

  // Save updated conversation to localStorage
  const updateLocalStorage = (updatedConv) => {
    localStorage.setItem(
      "conversationData",
      JSON.stringify({ storyId, conversation: updatedConv })
    );
  };

  const handleNext = async () => {
    if (!answer.trim()) return;

    setLoading(true);

    try {
      const response = await api.post("/api/v1/story/next", {
        storyId,
        conversation,
        answer,
      });

      const result = response.data.data;

      const updatedConv = result.conversation;

      setConversation(updatedConv);
      updateLocalStorage(updatedConv);
      setCurrentQuestion(updatedConv[updatedConv.length - 1]);
      setAnswer("");
    } catch (err) {
      console.error("Next Question Error:", err);
    }finally {
       setLoading(false);
    }
  };

  const isFinished = conversation.length >= 15;
  // const isFinished = conversation.length >= 2;

  const handleGetPrompt = async () => {
    try {
      setLoading(true);
      const response = await api.post("/api/v1/story/gist", {
        storyId,
        conversation,
      });
      setStoryId(response.data.storyId);
    //   console.log("Prompt Response", response.data);
      navigateTo("/templateselection");
    } catch (err) {
      console.error("Gist API Error", err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion) return <div className="text-white p-8">Thinking...</div>;

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center px-6 py-10">
      {/* Logo */}
      <div className="flex items-center justify-center mb-10">
        <img src={logoImg} alt="GHOST.ai" className="h-15" />
        <span className="text-2xl font-bold">GHOST.ai</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <span className="text-purple-400 mr-2 text-4xl"><PenTool /></span>
        Fill out the Answers
      </h1>

      {/* Question Card */}
      <div className="w-full max-w-2xl bg-[#111] p-6 rounded-xl shadow-lg border border-purple-600/30">
        <p className="text-lg mb-4 text-gray-300">{currentQuestion.question}</p>

        <textarea
          rows={2}
          className="w-full p-3 rounded-md bg-black border border-purple-500/40 text-white focus:border-purple-500 outline-none"
          placeholder="ex: your answer"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            // auto-resize: reset height then set to scrollHeight
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />

        {!isFinished ? (
          <button
            onClick={handleNext}
            disabled={loading}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Thinking..." : "Next"}
          </button>
        ) : (
          <button
            onClick={handleGetPrompt}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Thinking..." : "Get Prompt"}
          </button>
        )}
      </div>

      {/* Progress Bar */}
            <div className="w-full max-w-2xl mt-6">
            <div className="flex justify-between text-sm mb-1 text-gray-400">
                {/* <span>Question {conversation.length} of 15</span> */}
                <span>Question {conversation.length} of 15</span>
                <span>{Math.round((conversation.length / 15) * 100)}%</span>
            </div>

            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${(conversation.length / 15) * 100}%` }}
                ></div>
            </div>
            </div>

    </div>
  );
}
