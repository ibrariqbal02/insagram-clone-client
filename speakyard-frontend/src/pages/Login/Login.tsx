import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLogin } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { useState } from "react";
import Logo from "../../components/atoms/Logo";

type LoginFormData = {
  login: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate("/"),
    });
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-8 py-12">
      <div className="w-full max-w-xs flex flex-col items-center gap-0">

        {/* Brand */}
        <Logo size={44} className="mb-3" />
        <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
          Practice speaking English with real people and AI
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2.5">

          {/* Username / email */}
          <div>
            <input
              type="text"
              placeholder="Email or username"
              className="
                w-full bg-gray-50 border border-gray-300 rounded-xl
                px-3.5 min-h-[48px] text-sm text-gray-900
                placeholder:text-gray-400
                focus:outline-none focus:border-brand-500 focus:bg-white
                focus-visible:ring-2 focus-visible:ring-brand-500
                transition
              "
              {...register("login", { required: "Email or username is required" })}
            />
            {errors.login && (
              <p className="text-red-500 text-xs mt-1">{errors.login.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="
                  w-full bg-gray-50 border border-gray-300 rounded-md
                  px-3 py-2.5 pr-16 text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:outline-none focus:border-gray-400 focus:bg-white
                  transition
                "
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-700 select-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Error */}
          {loginMutation.isError && (
            <p className="text-red-500 text-xs text-center">
              {getErrorMessage(loginMutation.error, "Incorrect username or password.")}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="
              w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-700
              text-white font-bold rounded-xl min-h-[48px] text-sm
              disabled:opacity-60 transition mt-1
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
            "
          >
            {loginMutation.isPending ? "Logging in…" : "Log in"}
          </button>
        </form>

        {/* Forgot password */}
        <Link
          to="/forgot-password"
          className="text-sm text-gray-600 mt-5 py-2 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Forgot password?
        </Link>

        {/* OR divider */}
        <div className="flex items-center gap-4 w-full my-5">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            or
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Sign up link */}
        <div className="w-full border-t border-gray-200 pt-5 text-center">
          <p className="text-sm text-gray-800">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
