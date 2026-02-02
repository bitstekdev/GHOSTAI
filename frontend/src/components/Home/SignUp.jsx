import { useState, useContext } from "react";
import api from "../../services/axiosInstance";
import { FaGhost, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { backendUrl, googleSignin } = useContext(AppContext);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passError, setPassError] = useState("");
  const [confirmPassError, setConfirmPassError] = useState("");
  const [resendEmailBtn, setResendEmailBtn] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ---------- SIGNUP API ----------
  const signup = async (data) => {
    try {
      const res = await api.post(`${backendUrl}/api/auth/signup`, data);
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Something went wrong!",
      };
    }
  };

  // ---------- PASSWORD VALIDATION ----------
  const passwordValidation = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(password)) {
      setPassError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return false;
    }
    setPassError("");
    return true;
  };

  // ---------- RESEND EMAIL ----------
  const handleResend = async () => {
    if (!formData.email) {
      setMsg("Please enter your email!");
      setMsgType("error");
      return;
    }

    try {
      setResendLoading(true);
      const res = await api.post(
        `${backendUrl}/api/auth/resend-verification`,
        { email: formData.email }
      );
      setMsg(res.data.message);
      setMsgType("success");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to resend email");
      setMsgType("error");
    } finally {
      setResendLoading(false);
    }
  };

  // ---------- FORM SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMsg("Confirm Password does not match!");
      setMsgType("error");
      return;
    }

  // Show message FIRST
  setMsg("✅ Verification email has been sent to your email. Please check your inbox.");
  setMsgType("success");
  setResendEmailBtn(true);

  // Small delay so message renders before loader
  setTimeout(async () => {
    setSubmitting(true);

    const result = await signup(formData);
    setSubmitting(false);

    if (result.success) {
      setMsg("✅ Verification email has been sent. Please check your inbox.");
      setMsgType("success");
      setResendEmailBtn(true);
    } else {
      setMsg(result.message);
      setMsgType("error");
      setResendEmailBtn(false);
    }
  };

  return (
    <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-[#1E1E1E] to-black text-white px-6">
      {/* Back to Home */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition z-20"
      >
        <FaArrowLeft />
        <span className="text-sm font-medium">Home</span>
      </button>

      {/* Background Ghost AI text */}
      <h1 className="absolute text-4xl font-bold text-white/20 select-none top-15 md:top-0">
        GHOSTVERSE AI
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

      {/* Sign Up Form Container */}
      <div className="relative z-10 w-full max-w-md bg-transparent backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/10 md:mt-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Create Your Account
        </h2>
        {/* Google sign-up button */}
        <button
          type="button"
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
          Sign up with Google
        </button>

        <div className="text-center text-gray-400 text-sm mb-4">or sign up with email</div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20"
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                passwordValidation(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {passError && <p className="text-red-500 text-sm">{passError}</p>}

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, confirmPassword: value });
                setConfirmPassError(
                  value === formData.password ? "" : "Passwords do not match!"
                );
              }}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 pr-10"
            />
            <span
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-3 cursor-pointer"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {confirmPassError && (
            <p className="text-red-500 text-sm">{confirmPassError}</p>
          )}

          {msg && (
            <p
              className={`text-sm text-center ${
                msgType === "success"
                  ? "text-green-400"
                  : "text-red-500"
              }`}
            >
              {msg}
            </p>
          )}

          {resendEmailBtn && (
            <p
              className="text-sm underline cursor-pointer"
              onClick={handleResend}
            >
              {resendLoading ? "Sending..." : "Resend email"}
            </p>
          )}

          <button
            disabled={submitting}
            className="w-full bg-purple-400 py-3 rounded-lg"
          >
            {submitting ? "Signing up..." : "Signup"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
