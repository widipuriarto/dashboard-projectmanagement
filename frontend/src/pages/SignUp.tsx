import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail } from "lucide-react";
import { AuthSplitLayout } from "@/components/templates/AuthSplitLayout";
import { AuthHeader } from "@/components/molecules/AuthHeader";
import { AuthInput } from "@/components/atoms/AuthInput";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
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
      <div className="w-full flex flex-col space-y-7">
        {/* Header text */}
        <AuthHeader
          title="Create Account"
          subtitle="Sign up to get started with your dashboard"
        />

        {/* Form Input Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-3.5">
            {/* Full Name Input Field */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="signup-fullname"
                className="block text-xs font-semibold text-slate-700 select-none"
              >
                Full Name
              </label>
              <AuthInput
                id="signup-fullname"
                type="text"
                data-testid="input-signup-fullname"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                trailingIcon={<User className="h-4 w-4" />}
                autoComplete="name"
                required
              />
            </div>

            {/* Email Address Input Field */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold text-slate-700 select-none"
              >
                Email Address
              </label>
              <AuthInput
                id="signup-email"
                type="email"
                data-testid="input-signup-email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                trailingIcon={<Mail className="h-4 w-4" />}
                autoComplete="email"
                required
              />
            </div>

            {/* Password Input Field */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold text-slate-700 select-none"
              >
                Password
              </label>
              <PasswordInput
                id="signup-password"
                data-testid="input-signup-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Confirm Password Input Field */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-semibold text-slate-700 select-none"
              >
                Confirm Password
              </label>
              <PasswordInput
                id="signup-confirm-password"
                data-testid="input-signup-confirm-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <Button
            type="submit"
            data-testid="button-signup-submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-lg bg-telkom-navy hover:bg-telkom-navy/90 text-white font-medium text-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing Up...</span>
              </div>
            ) : (
              <span>Sign Up</span>
            )}
          </Button>
        </form>

        {/* Footer Switcher */}
        <div className="text-center pt-1">
          <p className="text-xs sm:text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-semibold text-telkom-navy hover:underline transition-all"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

