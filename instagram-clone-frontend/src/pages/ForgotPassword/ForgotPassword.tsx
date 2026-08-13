import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useForgotPassword, useResetPassword } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    forgotPassword.mutate(email, {
      onSuccess: () => setOtpSent(true),
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) return;

    resetPassword.mutate(
      { email, otp, newPassword },
      {
        onSuccess: () => navigate("/login"),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Reset Password</h1>

        <p className="text-gray-500 text-center mb-8">
          {otpSent
            ? "Enter the OTP we sent you and choose a new password"
            : "Enter your email and we'll send you an OTP"}
        </p>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {forgotPassword.isError && (
              <div className="text-red-500 text-center">
                {getErrorMessage(forgotPassword.error, "Could not find an account with that email.")}
              </div>
            )}

            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-lg py-3"
            >
              {forgotPassword.isPending ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="OTP"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {resetPassword.isError && (
              <div className="text-red-500 text-center">
                {getErrorMessage(resetPassword.error, "Invalid or expired OTP.")}
              </div>
            )}

            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-lg py-3"
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-gray-500 hover:underline"
            >
              Use a different email
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
