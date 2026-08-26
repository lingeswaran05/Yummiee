import { useState } from "react";
import {
  ArrowLeft,
  ChefHat,
  Mail,
  Send,
  CheckCircle2,
} from "lucide-react";

import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#faf8f7] px-5 py-10">

      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[560px] items-center justify-center">

        <div className="w-full rounded-[24px] bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-10">

          {/* Brand */}
          <div className="text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>

            <h1 className="mt-4 text-3xl font-bold text-primary">
              Yummiee
            </h1>

          </div>

          {!submitted ? (
            <>
              {/* Heading */}
              <div className="mt-10">

                <h2 className="text-2xl font-bold">
                  Forgot your password?
                </h2>

                <p className="mt-2 leading-6 text-text-secondary">
                  No worries! Enter your registered email address
                  and we'll send you a link to reset your password.
                </p>

              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder="Enter your email"
                      className="h-14 w-full rounded-xl border border-border bg-white pl-12 pr-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />

                  </div>

                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white shadow-[0_4px_12px_rgba(174,49,21,0.2)] transition hover:bg-primary-dark"
                >
                  <Send className="h-5 w-5" />
                  Send Reset Link
                </button>

              </form>
            </>
          ) : (
            /* Success */
            <div className="mt-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Check your email
              </h2>

              <p className="mt-3 leading-6 text-text-secondary">
                If an account exists for{" "}
                <span className="font-semibold text-text-primary">
                  {email}
                </span>
                , we've sent instructions to reset your password.
              </p>

              <p className="mt-3 text-sm text-text-secondary">
                Didn't receive the email? Check your spam folder
                or try again.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 font-semibold text-primary hover:underline"
              >
                Try another email
              </button>

            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}

export default ForgotPassword;