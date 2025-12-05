import React, { useState } from "react";
import { FaGhost, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-[#1E1E1E] to-black text-white px-6">
      {/* Background Ghost AI text */}
      <h1 className="absolute text-5xl font-bold text-white/20 select-none top-34 md:top-20">
        GHOST AI
      </h1>

      {/* Random Ghost Icons */}
      <FaGhost className="absolute top-10 left-20 text-white/10 text-3xl animate-bounce" />
      <FaGhost className="absolute top-1/4 right-16 text-white/20 text-4xl animate-pulse" />
      <FaGhost className="absolute bottom-20 left-10 text-white/15 text-5xl animate-spin-slow" />
      <FaGhost className="absolute top-1/3 left-1/3 text-white/10 text-6xl animate-pulse" />
      <FaGhost className="absolute bottom-32 right-32 text-white/20 text-4xl animate-bounce" />
      <FaGhost className="absolute top-16 right-1/4 text-white/10 text-3xl animate-spin-slow" />
      <FaGhost className="absolute bottom-10 left-1/2 text-white/15 text-5xl animate-pulse" />
      <FaGhost className="absolute top-2/3 right-1/4 text-white/20 text-6xl animate-bounce" />
      <FaGhost className="absolute bottom-1/4 left-1/4 text-white/15 text-4xl animate-pulse" />
      <FaGhost className="absolute top-1/2 right-10 text-white/10 text-3xl animate-spin-slow" />

      {/* Sign In Form Container */}
      <div className="relative z-10 w-full max-w-md bg-transparent backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/10 md:mt-16">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">
          Sign in to your account
        </p>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-black/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-black/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Don’t have an account?{" "}
          <p onClick={() => navigate("/signup")} className="text-white font-bold hover:underline cursor-pointer">
            Sign Up
          </p>
        </p>
      </div>
    </section>
  );
};

export default SignIn;
