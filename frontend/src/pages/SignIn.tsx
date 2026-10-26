import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { AuthSplitLayout } from "@/components/templates/AuthSplitLayout";
import { AuthHeader } from "@/components/molecules/AuthHeader";
import { AuthInput } from "@/components/atoms/AuthInput";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { AuthCheckbox } from "@/components/atoms/AuthCheckbox";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isTransitioning) return;

    setIsSubmitting(true);
    setIsTransitioning(true);

    // Transition card to match exactly the main container of the dashboard
    setTimeout(() => {
      navigate("/");
    }, 520);
  };

  return (
    <AuthSplitLayout isTransitioning={isTransitioning}>
      <div className="w-full flex flex-col space-y-9">
        {/* Header text */}
        <AuthHeader
          title="Welcome home"
          subtitle="Please enter your details."
        />

        {/* Form Input Fields with generous spacing and explicit labels */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-4">
            {/* Email Input Field with Label */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="signin-email"
                className="block text-xs font-semibold text-slate-700 select-none"
              >
                Email Address
              </label>
              <AuthInput
                id="signin-email"
                type="email"
                data-testid="input-signin-email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                trailingIcon={<Mail className="h-4 w-4" />}
                autoComplete="email"
                required
              />
            </div>

            {/* Password Input Field with Label */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="signin-password"
                className="block text-xs font-semibold text-slate-700 select-none"
              >
                Password
              </label>
              <PasswordInput
                id="signin-password"
                data-testid="input-signin-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <AuthCheckbox
                id="signin-remember"
                data-testid="checkbox-signin-remember"
                checked={rememberMe}
                onChange={setRememberMe}
                label="Remember me"
              />
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="text-xs font-medium text-slate-500 hover:text-telkom-navy transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            data-testid="button-signin-submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-lg bg-telkom-navy hover:bg-telkom-navy/90 text-white font-medium text-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              <span>Sign In</span>
            )}
          </Button>
        </form>

        {/* Footer Switcher */}
        <div className="text-center pt-1">
          <p className="text-xs sm:text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="font-semibold text-telkom-navy hover:underline transition-all"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
