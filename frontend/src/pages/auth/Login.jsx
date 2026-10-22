import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ReceiptText,
  Mail,
  LockKeyhole,
  ArrowRight,
  LoaderCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../utils/roleRoutes";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email.trim(), password);

      navigate(getDashboardPath(user.role), {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exp-login min-h-screen grid lg:grid-cols-2">
      {/* Left branding section */}
      <div className="exp-login-brand hidden lg:flex flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          

          
        </div>

        <div className="max-w-lg">
          <div className="exp-motion-scene mb-10" aria-label="Animated Expensio voucher workflow">
            <div className="exp-motion-halo" />
            <div className="exp-motion-card exp-motion-card-back"><ReceiptText size={32}/><span>EXPENSIO</span><b>Claim submitted</b><small>EV-000128</small></div>
            <div className="exp-motion-card exp-motion-card-front"><div className="exp-motion-logo"><ReceiptText size={44}/></div><span>EXPENSIO</span><b>One place for every expense.</b><small>Submit · Review · Approve</small><div className="exp-motion-track"><i/></div></div>
            <div className="exp-motion-check">✓</div>
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Expense management, simplified.
          </h1>

          

          <div className="mt-10 grid grid-cols-3 gap-4 text-sm text-slate-300">
            <span>Secure Access</span>
            <span>Easy Approvals</span>
            <span>Live Tracking</span>
          </div>
        </div>

       
      </div>

      {/* Login form */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 bg-white">
        <div className="exp-login-form w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <ReceiptText className="text-[#14243D]" size={30} />
            <span className="text-xl font-bold text-slate-900">
              Expensio
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>

          <p className="mt-3 text-slate-500">
            Enter your credentials to access your workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-6">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12334b] px-5 py-3.5 font-semibold text-white transition hover:bg-[#20395B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-400">
            Authorized employees only
          </p>
        </div>
      </div>
    </div>
  );
}