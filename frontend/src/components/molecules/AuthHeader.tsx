interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AuthHeader({
  title = "Welcome home",
  subtitle = "Please enter your details.",
}: AuthHeaderProps) {
  return (
    <div className="space-y-1.5 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-telkom-navy tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-slate-500 font-normal">
        {subtitle}
      </p>
    </div>
  );
}
