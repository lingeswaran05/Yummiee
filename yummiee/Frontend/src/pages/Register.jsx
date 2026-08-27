import { SignUp, Show, useAuth } from "@clerk/react";
import { ChefHat } from "lucide-react";
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function Register() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen bg-[#faf8f7] px-5 py-10">
      <Show when="signed-in">
        <Navigate to="/dashboard" replace />
      </Show>

      <Show when="signed-out">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[620px] flex-col items-center justify-center">
          {/* Brand */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>

            <h1 className="mt-3 text-3xl font-bold text-primary">
              Yummiee
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Join Yummiee today and organize your recipes.
            </p>
          </div>

          {/* Clerk SignUp Component */}
          <div className="flex w-full justify-center">
            <SignUp
              routing="virtual"
              signInUrl="/#/"
              fallbackRedirectUrl="/#/dashboard"
              forceRedirectUrl="/#/dashboard"
            />
          </div>
        </div>
      </Show>
    </main>
  );
}

export default Register;
