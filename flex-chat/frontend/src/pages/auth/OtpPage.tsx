import { useLocation, useNavigate } from "react-router-dom";
import { useVerifyOtp } from "../../hooks/tanstackQuery/useAccountApi";
import { useOtpInput } from "../../hooks/useOtpInput";

function OtpPage() {

  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/signup");
  }

  const { email, username, password } = data || {};

  const verifyOtpMutation = useVerifyOtp();
  const {
    otp,
    inputs,
    handleChange,
    handleKeyDown,
    handlePaste,
    isComplete,
    code,
  } = useOtpInput(6);

  const isSubmitting = verifyOtpMutation.isPending;

  const handleSubmit = async () => {
    if (!isComplete) return;
    verifyOtpMutation.mutate({ email, password, otp: code, username });
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div
        className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ minHeight: "420px" }}
      >
        <div className="w-5/12 bg-black flex flex-col justify-between p-10">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    fill="black"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-wide">
                Flex-Chat
              </span>
            </div>

            <h2
              className="text-white font-black leading-tight"
              style={{
                fontSize: "2.4rem",
                fontFamily: "'Georgia', serif",
                letterSpacing: "-0.5px",
              }}
            >
              ONE
              <br />
              LAST
              <br />
              STEP
            </h2>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a code to verify it's really you.
          </p>
        </div>

        <div className="w-7/12 bg-white flex flex-col justify-center px-10 py-10">
          <div className="mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-5">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                  stroke="#111"
                  strokeWidth="2"
                />
                <path
                  d="M2 7l10 7 10-7"
                  stroke="#111"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1 className="text-gray-900 font-bold text-2xl mb-1">
              Verify your email
            </h1>
            <p className="text-gray-400 text-sm">
              Enter the 6-digit code sent to{" "}
              <span className="text-gray-700 font-medium">{email}</span>
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`
                  w-11 h-13 text-center text-xl font-bold rounded-lg border-2 outline-none
                  bg-gray-100 text-gray-900 transition-all duration-150
                  ${
                    digit
                      ? "border-gray-900 bg-white"
                      : "border-transparent focus:border-gray-400 focus:bg-white"
                  }
                `}
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`
              w-full py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200
              ${
                isComplete && !isSubmitting
                  ? "bg-black text-white hover:bg-gray-800 active:bg-gray-900 cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>

          <p className="text-sm text-gray-400 mt-5 text-center">
            Didn't receive a code?{" "}
            <span className="text-gray-900 font-semibold cursor-pointer underline underline-offset-2 hover:opacity-70 transition-opacity">
              Resend
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OtpPage;