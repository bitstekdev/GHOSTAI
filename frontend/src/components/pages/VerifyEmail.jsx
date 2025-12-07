import { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaGhost } from "react-icons/fa";

const VerifyEmail = () => {
  const { backendUrl } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  // ---------- VERIFY EMAIL AFTER CLICK ----------
  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }
    setMessage(""); 
    setStatus("loading");
    try {
      const res = await axios.get(`${backendUrl}/api/auth/verify-email/${token}`);
      setStatus("success");
      setMessage(res.data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Verification failed.");
    }
  };

  // ---------- RESEND EMAIL ----------
  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email!");
      return;
    }
    setMessage(""); 
    setStatus("loading");
    try {
      const res = await axios.post(`${backendUrl}/api/auth/resend-verification`, { email });
    //   setStatus("idle");
    setStatus("error");
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend email");
      setStatus("error");
    }
  };

  // Dynamic theme based on result
  const themeColor = status === "error" ? "text-red-500" : "text-green-400";

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-b from-black via-[#1E1E1E] to-black text-white px-6">

      {/* Animated ghosts */}
      {[...Array(10)].map((_, i) => (
        <FaGhost key={i}
          className={`absolute ${status === "error" ? "text-red-500/20" : "text-white/20"} animate-pulse`}
          style={{
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            fontSize: `${Math.random() * (60 - 20) + 20}px`,
          }} />
      ))}

      {/* CARD UI */}
      <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-10 w-[420px] text-center">

        <h1 className="text-3xl font-bold mb-4 text-white">Storybook Generator</h1>

        {/* MESSAGE */}
        {message && <p className={`${themeColor} font-semibold mb-4`}>{message}</p>}

        {/* Loading */}
        {status === "loading" && <p className="text-gray-300 mb-4">Processing...</p>}

        {/* Verify Button (Initially Idle) */}
        {status === "idle" && (
          <>
            <p className="text-gray-300 mb-6">Click below to verify your email.</p>
            <button
              onClick={handleVerify}
              className="bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded-lg font-bold w-full">
              Verify Email
            </button>
          </>
        )}

        {/* Error & Resend Email */}
        {status === "error" && (
          <>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-black/40 border border-white/20 focus:outline-none mb-4"
            />
            <button
              onClick={handleResend}
              className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg font-bold w-full">
              Resend Verification Email
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="mt-3 border border-gray-400 hover:bg-white/10 rounded-lg px-4 py-2 w-full">
              Go to Signup
            </button>
          </>
        )}

        {/* Success Sign In */}
        {status === "success" && (
          <button
            onClick={() => navigate("/signin")}
            className="bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded-lg font-bold w-full mt-4">
            Sign In Now
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
