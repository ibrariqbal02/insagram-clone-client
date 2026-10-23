import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLogin } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { useState } from "react";

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
    /*
     * Real Instagram mobile login:
     *   - Pure white background, no card/shadow
     *   - Logo centered at ~40% from top
     *   - Inputs are thin-bordered rectangles with gray bg
     *   - Blue "Log in" button full-width
     *   - "Forgot password?" below button
     *   - Divider + "Sign up" link near bottom
     */
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 py-12">
      <div className="w-full max-w-xs flex flex-col items-center gap-0">

        {/* Wordmark */}
        <h1 className="font-logo text-[44px] leading-none mb-8 select-none text-gray-900">
          Instagram
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2.5">

          {/* Username / email */}
          <div>
            <input
              type="text"
              placeholder="Phone number, username, or email"
              className="
                w-full bg-gray-50 border border-gray-300 rounded-md
                px-3 py-2.5 text-sm text-gray-900
                placeholder:text-gray-400
                focus:outline-none focus:border-gray-400 focus:bg-white
                transition
              "
              {...register("login", { required: "Username or email is required" })}
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
              w-full bg-[#0095f6] hover:bg-[#1877f2] active:bg-[#1877f2]
              text-white font-semibold rounded-lg py-2 text-sm
              disabled:opacity-60 transition mt-1
            "
          >
            {loginMutation.isPending ? "Logging in…" : "Log in"}
          </button>
        </form>

        {/* Forgot password */}
        <Link
          to="/forgot-password"
          className="text-xs text-[#00376b] mt-4 hover:underline"
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
            <Link to="/register" className="text-[#0095f6] font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
