import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Button } from "../components/ui/Button";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: security question, 3: new password
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-email", { email });
      setSecurityQuestion(response.data.security_question);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityAnswer = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/verify-security-answer", {
        email,
        security_answer: securityAnswer,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Incorrect security answer");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email,
        security_answer: securityAnswer,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-serif font-bold text-dark-900 mb-2">
              Reset Password
            </h2>
            <p className="text-dark-500">
              {step === 1 && "Enter your email to get started"}
              {step === 2 && "Answer your security question"}
              {step === 3 && "Create a new password"}
            </p>
          </div>

          {success ? (
            <div className="bg-success/10 border border-success/30 text-success px-6 py-4 rounded-xl text-center">
              <svg
                className="w-12 h-12 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="font-semibold mb-1">Password reset successful!</p>
              <p className="text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Email */}
              {step === 1 && (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium w-full px-4 py-3 rounded-xl focus:outline-none text-dark-900"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={loading}
                    disabled={loading}>
                    Continue
                  </Button>
                </form>
              )}

              {/* Step 2: Security Question */}
              {step === 2 && (
                <form onSubmit={handleSecurityAnswer} className="space-y-6">
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-primary-900 mb-2">
                      Security Question:
                    </p>
                    <p className="text-dark-700">{securityQuestion}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">
                      Your Answer
                    </label>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="input-premium w-full px-4 py-3 rounded-xl focus:outline-none text-dark-900"
                      placeholder="Enter your answer"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      loading={loading}
                      disabled={loading}>
                      Verify
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-premium w-full px-4 py-3 rounded-xl focus:outline-none text-dark-900"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-premium w-full px-4 py-3 rounded-xl focus:outline-none text-dark-900"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={loading}
                    disabled={loading}>
                    Reset Password
                  </Button>
                </form>
              )}
            </>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-primary-700 hover:text-primary-800 font-semibold text-sm">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
