import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocation, useNavigate } from "react-router-dom";
import { otpSchema } from "../utils/validationSchemas";
import {
  userOTPVerfication,
  userSendOTP,
} from "../utils/services/Registration.services";
import { showToast } from "../utils/toast.util";
import { Button } from "../components/common";
import { Shield } from "lucide-react";

interface OTPFormData {
  otp: string;
}

const OTPVerification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState<number | null>(null); // New state for generated OTP
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);

  const phoneNumber = location.state?.phoneNumber || "";
  const fromSignup = location.state?.fromSignup || false;
  const initialOtp = location.state?.otp; // Get OTP from navigation state

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/login");
      return;
    }

    // Set initial OTP if provided via navigation
    if (initialOtp) {
      setGeneratedOtp(initialOtp);
    }

  }, [phoneNumber, navigate, initialOtp]);

  // Update form value when OTP changes
  useEffect(() => {
    const otpValue = otp.join("");
    setValue("otp", otpValue);
  }, [otp, setValue]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData
        .split("")
        .concat(Array(4 - pastedData.length).fill(""));
      setOtp(newOtp.slice(0, 4));
      inputRefs.current[Math.min(pastedData.length, 3)]?.focus();
    }
  };

  const onSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      const response = await userOTPVerfication({
        phone_number: `+${phoneNumber}`,
        otp: data.otp,
      });

      if (response?.data) {
        showToast("OTP verified successfully!", "success");
        if (fromSignup) {
          showToast("Account created successfully! Please login.", "success");
          navigate("/login");
        } else {
          // Handle forgot password flow
          navigate("/reset-password", {
            state: {
              phoneNumber,
              verified: true,
            },
          });
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Invalid OTP. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      console.log("Resending OTP for phone number:", `+${phoneNumber}`);
      const response = await userSendOTP({ phone_number: `+${phoneNumber}` });
      if (response?.data) {
        const newOtp = response.data.result.otp;
        setGeneratedOtp(newOtp); // Store the new OTP
        showToast("OTP sent successfully!", "success");
        setCanResend(false);


        // Restart countdown

      }
    } catch (error: any) {
      console.error("Resend OTP Error:", error.response?.data || error);
      const errorMessage =
        error?.response?.data?.message ||
        (error?.response?.data?.errors?.phone_number
          ? error.response.data.errors.phone_number[0]
          : "Failed to resend OTP. Please try again.");
      showToast(errorMessage, "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D1F27] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-[#EDB726] shadow-lg">
            <Shield className="h-8 w-8 text-[#1D1F27]" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white sm:text-4xl">
            Verify Your Phone
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            We've sent a 4-digit verification code to{" "}
            <span className="font-semibold text-[#EDB726] block sm:inline mt-1 sm:mt-0">
              {phoneNumber}
            </span>
          </p>
          {generatedOtp !== null && (
            <p className="mt-4 text-center text-yellow-400 bg-gray-800 p-2 rounded-lg">
              Generated OTP: {generatedOtp}
            </p>
          )}
        </div>

        <div className="bg-[#2A2D36] py-8 px-6 shadow-xl rounded-xl border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Enter 4-digit OTP
              </label>
              <div
                className="flex justify-center space-x-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    //@ts-ignore
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`
                      w-14 h-14 text-center text-xl font-bold border-2 rounded-xl shadow-sm
                      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726] focus:shadow-md
                      bg-[#1D1F27] text-white
                      ${errors.otp ? "border-red-500" : "border-gray-600"}
                      ${digit ? "border-[#EDB726] bg-[#2A2D36]" : ""}
                    `}
                    inputMode="numeric"
                    pattern="\d*"
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl"
                isLoading={isLoading}
                disabled={isLoading || otp.join("").length !== 4}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-gray-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                className="font-semibold text-[#EDB726] hover:text-[#d4a422] transition-colors duration-200 hover:underline disabled:opacity-50 cursor-pointer"
                disabled={isResending}
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </button>

            </p>

            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 hover:underline cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
