import { useEffect, useState, useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/axiosInstance";
import Book from "../../assets/images/book-animation.png";
import coverImg from "../../assets/images/book-pages.png"; 
import GhostGlow from "../../assets/images/ghost-glow.gif";
import { ProgressStep5 } from "../helperComponents/Steps.jsx";

import { AppContext } from "../../context/AppContext";


const STEPS = {
  characters: {
    title: "Generating Character Images",
    subtitle: "Bringing your characters to life with AI ✨",
    image: Book,
  },
  backgrounds: {
    title: "Generating Background Images",
    subtitle: "Creating immersive worlds for your story 🌍",
    image: Book,
  },
  cover: {
    title: "Generating Cover Images",
    subtitle: "Designing stunning book covers 🎨",
    image: coverImg,
  },
  done: {
    title: "Finalizing Your Book",
    subtitle: "Almost there… preparing your flipbook 📖",
    image: coverImg,
  },
};

const GeneratorPage = () => {
  const { navigateTo } = useContext(AppContext);
  const { storyId } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  
  
  const [socketActive, setSocketActive] = useState(false);
  // console.log("Socket Active:", socketActive, "Job ID:", jobId);    
  const [progress, setProgress] = useState(5);
  const [step, setStep] = useState("characters");
  const [status, setStatus] = useState("processing");

  // --- WebSocket
 useEffect(() => {
  if (!jobId) return;

  const socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"], // force WS
  });

  socket.on("connect", () => {
     if(import.meta.env.VITE_DEV) console.log("🟢 Socket connected:", socket.id);
    setSocketActive(true); // IMPORTANT
    socket.emit("join-job", jobId);
  });

  socket.on("job-update", (data) => {
    if(import.meta.env.VITE_DEV) console.log("Job update:", data);

    if (data.step) setStep(data.step);
    if (data.progress !== undefined) setProgress(data.progress);

    if (data.status === "completed" || data.step === "done") {
      setProgress(100);
      navigateTo(`/flipbook/${storyId}`);
    }

    if (data.status === "failed") {
      setStatus("failed");
      setTimeout(() => {
      navigateTo(`/titlegenerator/${storyId}`);
      }, 3000);
    }
  });

  socket.on("disconnect", () => {
    if(import.meta.env.VITE_DEV) console.log("🔴 Socket disconnected");
    setSocketActive(false);
  });

  return () => {
    socket.disconnect();
  };
}, [jobId]);


  // --- Polling fallback
    useEffect(() => {
      if (!jobId || socketActive) return;

      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/api/v1/images/job-status/${jobId}`);
          const job = res.data;

          setStep(job.step);
          setProgress(job.progress);

          if (job.status === "completed") {
            clearInterval(interval);
            navigateTo(`/flipbook/${storyId}`);
          }

          if (job.status === "failed") {
            setStatus("failed");
            clearInterval(interval);
            setTimeout(() => {
              navigateTo(`/titlegenerator/${storyId}`);
            }, 3000);
          }
        } catch (err) {
          console.error("Polling failed", err);
        }
      }, 5000);

      return () => clearInterval(interval);
    }, [jobId, socketActive]);



  const stepUI = STEPS[step] || STEPS.characters;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-5">
        {/* <GhostScatter /> */}
        <ProgressStep5 />
         {status === "failed" && (
          <p className="text-red-400 mt-6">
            Something went wrong. Please try again later.
          </p>
        )}
      <div className="p-6 py-10 max-w-3xl w-full text-white text-center">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-purple-400 mb-4">
          {stepUI.title}
        </h1>

        <p className="text-gray-300 mb-6">
          {stepUI.subtitle}
        </p>

       

        {/* IMAGE */}
        <div className="flex flex-col justify-center items-center mb-10">
             <img
            src={GhostGlow}
            className="w-45 -mb-12"
          />
          <img
            src={stepUI.image}
            className="w-56 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)] animate-pulse"
          />
        </div>


        {progress < 15 ? (
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-running" />
        </div>
        ) : (
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden relative">
            <div
            className="h-full bg-purple-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
            >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
        </div>
        )}

        <p className="mt-3 text-purple-300 text-lg animate-pulse">
        {progress}% completed
        </p>



        {/* TAGLINES */}
        <p className="mt-2 text-gray-400 italic">
          {progress < 30 && "✨ Warming up the AI engines…"}
          {progress >= 30 && progress < 60 && "🧠 AI is deeply imagining your story…"}
          {progress >= 60 && progress < 90 && "🎨 Almost done — polishing visuals…"}
          {progress >= 90 && "🚀 Final touches — preparing your book!"}
        </p>

       
      </div>
    </div>
  );
};

export default GeneratorPage;


// Ghost Scatter Component
const ghosts = Array.from({ length: 10 });

const GhostScatter = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ghosts.map((_, index) => {
        const size = 40 + Math.random() * 50; // 40px – 90px
        const top = Math.random() * 90;
        const left = Math.random() * 90;
        const duration = 3 + Math.random() * 4; // 3s – 7s
        const delay = Math.random() * 2;

        return (
          <img
            key={index}
            src={GhostGlow}
            alt="Floating ghost"
            className="absolute opacity-30"
            style={{
              width: `${size}px`,
              top: `${top}%`,
              left: `${left}%`,
              animation: `float ${duration}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
};

