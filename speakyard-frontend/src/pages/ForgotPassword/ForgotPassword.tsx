import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useForgotPassword, useResetPassword } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const forgotPassword = useForgotPassword();
  const resetPassword  = useResetPassword();

  const [email, setEmail]           = useState("");
  const [otp, setOtp]               = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent]       = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    forgotPassword.mutate(email, { onSuccess: () => setOtpSent(true) });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) return;
    resetPassword.mutate(
      { email, otp, newPassword },
      { onSuccess: () => navigate("/login") }
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-10 pt-14 pb-8">
      <div className="w-full max-w-xs flex flex-col items-center">

        {/* Lock icon */}
        <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className="w-8 h-8 text-gray-900"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="font-semibold text-base text-gray-900 mb-1">
          Trouble logging in?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 leading-snug">
          {otpSent
            ? "Enter the OTP we sent you and choose a new password."
            : "Enter your email and we'll send you a code to get back into your account."}
        </p>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="w-full space-y-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="
                w-full bg-gray-50 border border-gray-300 rounded-md
                px-3 py-2.5 text-sm placeholder:text-gray-400
                focus:outline-none focus:border-gray-400 focus:bg-white transition
              "
            />

            {forgotPassword.isError && (
              <p className="text-red-500 text-xs text-center">
                {getErrorMessage(forgotPassword.error, "Could not find that account.")}
              </p>
            )}

            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="
                w-full bg-[#0095f6] hover:bg-[#1877f2] text-white
                font-semibold rounded-lg py-2 text-sm disabled:opacity-60 transition
              "
            >
              {forgotPassword.isPending ? "Sending…" : "Send login link"}
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <Link
              to="/register"
              className="block text-center text-sm font-semibold text-gray-800 hover:text-black"
            >
              Create new account
            </Link>
          </form>
        ) : (
          <form onSubmit={handleReset} className="w-full space-y-2.5">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="
                w-full bg-gray-50 border border-gray-300 rounded-md
                px-3 py-2.5 text-sm placeholder:text-gray-400
                focus:outline-none focus:border-gray-400 focus:bg-white transition
              "
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="
                w-full bg-gray-50 border border-gray-300 rounded-md
                px-3 py-2.5 text-sm placeholder:text-gray-400
                focus:outline-none focus:border-gray-400 focus:bg-white transition
              "
            />

            {resetPassword.isError && (
              <p className="text-red-500 text-xs text-center">
                {getErrorMessage(resetPassword.error, "Invalid or expired OTP.")}
              </p>
            )}

            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="
                w-full bg-[#0095f6] hover:bg-[#1877f2] text-white
                font-semibold rounded-lg py-2 text-sm disabled:opacity-60 transition
              "
            >
              {resetPassword.isPending ? "Resetting…" : "Reset password"}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-800"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>

      {/* Back to login — pinned to bottom */}
      <div className="w-full max-w-xs">
        <div className="border-t border-gray-200 pt-5 text-center">
          <Link to="/login" className="text-sm font-semibold text-gray-800">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
