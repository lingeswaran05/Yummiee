import { SignIn, useAuth } from "@clerk/react";
import { ChefHat } from "lucide-react";
import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

function Login() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSignedOutParam =
    new URLSearchParams(location.search).get("signed_out") === "1" ||
    window.location.href.includes("signed_out=1");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#faf8f7] px-4 py-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-text-secondary">Loading authentication...</p>
        </div>
      </main>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#faf8f7] px-4 py-8">
      <div className="flex w-full max-w-[480px] flex-col items-center justify-center">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-xs">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary">
            Yummiee
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Your recipes. Your shopping list. One place.
          </p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="flex w-full justify-center">
          <SignIn
            routing="virtual"
            signUpUrl="/#/register"
            fallbackRedirectUrl="/#/dashboard"
            forceRedirectUrl="/#/dashboard"
          />
        </div>

        {isSignedOutParam && (
          <div role="status" className="mt-5 w-full text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl">
            You have signed out successfully.
          </div>
        )}
      </div>
    </main>
  );
}

export default Login;
