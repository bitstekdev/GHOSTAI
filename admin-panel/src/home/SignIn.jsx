import { useState, useContext } from "react";
import { FaGhost, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosInstance";
import ClipLoader from "react-spinners/ClipLoader";
import { AppContext } from "../context/AppContext";

const SignIn = () => {
  const navigate = useNavigate();
  const {  setUserData, setIsAuthenticated } = useContext(AppContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const signin = async (data) => {
  try {
    setLoading(true);
    const response = await api.post(`/api/auth/login`, data);

    setIsAuthenticated(true);
    setUserData(response.data.data.user);

    return { success: true, message: response.data.message };
  } catch (error) {
    setIsAuthenticated(false);
    const status = error.response?.status;
    const payload = error.response?.data;
    if (status === 403 && payload?.requiresEmailVerification) {
      return {
        success: false,
        requiresEmailVerification: true,
        message: payload.message || "Please verify your email before logging in.",
      };
    }
    const errors = payload?.errors;

    console.log("Signin Error:", error);
    const message =
      (Array.isArray(errors) && errors[0]?.msg) ||
      payload?.message ||
      "Something went wrong!";
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};


  // -------- HANDLE SIGNIN ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await signin(formData);
      console.log(res);
      if (!res.success) throw new Error(res.message);
      setMsg(res.message);
      navigate("/dashboard"); 
    } catch (err) {
      setMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-[#1E1E1E] to-black text-white px-6">

      {/* Background Ghost AI Text */}
      <h1 className="absolute text-5xl font-bold text-white/20 select-none top-34 md:top-10">
        GHOSTVERSE AI
      </h1>

      {/* Random Ghost Icons */}
      {[...Array(10)].map((_, i) => (
        <FaGhost
          key={i}
          className="absolute text-white/15 animate-pulse"
          style={{
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            fontSize: `${Math.random() * (60 - 20) + 20}px`,
          }}
        />
      ))}

      {/* Sign In Container */}
      <div className="relative z-10 w-full max-w-md bg-transparent backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/10 md:mt-16">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">
          Sign in to your account
        </p>

        {/* Message */}
        {msg && <p className="text-red-500 text-sm mb-4">{msg}</p>}

        {/* Google sign-in button */}
        {/* <button
          onClick={async () => {
            setLoading(true);
            try {
              await googleSignin();
            } finally {
              setLoading(false);
            }
          }}
          className="w-full bg-white text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-3 mb-4"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button> */}

        <div className="text-center text-gray-400 text-sm mb-4">SIGN IN </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full mt-1 px-4 py-3 rounded-lg bg-black/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm text-gray-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full mt-1 px-4 py-3 rounded-lg bg-black/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <ClipLoader size={20} color="#000000" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-white font-bold hover:underline cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </div>
    </section>
  );
};

export default SignIn;
