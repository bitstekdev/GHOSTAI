import { useState, useContext } from "react";
import api from "../../services/axiosInstance";
import { FaGhost, FaEye, FaEyeSlash } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

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
      <div className="relative z-10 w-full max-w-md bg-transpalent backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-center mb-6">
          Create Your Account
        </h2>

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
