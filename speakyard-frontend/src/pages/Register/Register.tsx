import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useRegister } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type RegisterFormData = {
  name: string;
  username: string;
  email: string;
  password: string;
};

const Register = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => navigate("/login"),
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-10 pt-12 pb-8">
      <div className="w-full max-w-xs flex flex-col items-center">

        {/* Wordmark */}
        <h1 className="font-logo text-[44px] leading-none mb-3 select-none text-gray-900">
          Instagram
        </h1>

        <p className="text-base font-semibold text-gray-400 text-center mb-5 leading-snug">
          Sign up to see photos and videos from your friends.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2.5">

          {/* Full name */}
          <div>
            <input
              type="text"
              placeholder="Full name"
              className="
                w-full bg-gray-50 border border-gray-300 rounded-md
                px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400
                focus:outline-none focus:border-gray-400 focus:bg-white transition
              "
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Username"
              className="
                w-full bg-gray-50 border border-gray-300 rounded-md
                px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400
                focus:outline-none focus:border-gray-400 focus:bg-white transition
              "
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="
                w-full bg-gray-50 border border-gray-300 rounded-md
                px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400
                focus:outline-none focus:border-gray-400 focus:bg-white transition
              "
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
                  px-3 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:border-gray-400 focus:bg-white transition
                "
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Error */}
          {registerMutation.isError && (
            <p className="text-red-500 text-xs text-center">
              {getErrorMessage(registerMutation.error, "Registration failed.")}
            </p>
          )}

          {/* Fine-print */}
          <p className="text-[11px] text-gray-400 text-center leading-snug pt-1">
            By signing up, you agree to our{" "}
            <span className="font-semibold text-gray-500">Terms</span>,{" "}
            <span className="font-semibold text-gray-500">Privacy Policy</span> and{" "}
            <span className="font-semibold text-gray-500">Cookies Policy</span>.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="
              w-full bg-[#0095f6] hover:bg-[#1877f2] active:bg-[#1877f2]
              text-white font-semibold rounded-lg py-2 text-sm
              disabled:opacity-60 transition
            "
          >
            {registerMutation.isPending ? "Creating account…" : "Sign up"}
          </button>
        </form>
      </div>

      {/* Log in link — pinned to bottom */}
      <div className="w-full max-w-xs">
        <div className="border-t border-gray-200 pt-5 text-center">
          <p className="text-sm text-gray-800">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0095f6] font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
