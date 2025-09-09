import React, { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordSchema } from "../utils/validationSchemas";
import { userForgotPassword } from "../utils/services/Registration.services";
import { showToast } from "../utils/toast.util";
import { Button, PhoneInput } from "../components/common";
import { KeyRound } from "lucide-react";

interface ForgotPasswordFormData {
  phoneNumber: string;
}

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: "",
    },
    mode: "onChange",
  });

  const phoneNumber = useWatch({ control, name: "phoneNumber" });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await userForgotPassword({
        phone_number: `+${data.phoneNumber}`,
      });

      if (response?.data) {
        const otp = response.data.result.otp; // Extract OTP from response
        showToast("OTP sent to your phone number!", "success");
        navigate("/otp-verification", {
          state: {
            phoneNumber: data.phoneNumber,
            fromForgotPassword: true,
            otp, // Pass OTP to OTPVerification
          },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D1F27] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-[#EDB726] shadow-lg">
            <KeyRound className="h-8 w-8 text-[#1D1F27]" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white sm:text-4xl">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300 max-w-sm mx-auto">
            Enter your phone number and we'll send you a verification code to
            reset your password
          </p>
        </div>

        <div className="bg-[#2A2D36] py-8 px-6 shadow-xl rounded-xl border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    label="Phone Number"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.phoneNumber?.message}
                    placeholder="Enter your registered phone number"
                  />
                )}
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl"
                isLoading={isLoading}
                disabled={isLoading || !isValid || !phoneNumber}
              >
                {isLoading ? "Sending OTP..." : "Send Verification Code"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="pt-2 border-t border-gray-200">
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 hover:underline"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Secure password recovery process
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
