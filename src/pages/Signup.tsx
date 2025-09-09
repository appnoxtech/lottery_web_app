import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { signupSchema } from "../utils/validationSchemas";
import { userSignup } from "../utils/services/Registration.services";
import { showToast } from "../utils/toast.util";
import { Input, Button, PhoneInput } from "../components/common";
import { UserPlus, User, Lock, CheckCircle } from "lucide-react";

interface SignupFormData {
  name: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const signupData = {
        name: data.name,
        phone_number: `+${data.phoneNumber}`,
        password: data.password,
        password_confirmation: data.confirmPassword,
      };

      const response = await userSignup(signupData);

      if (response?.data) {
        const otp = response.data.result.otp; // Extract OTP from response
        showToast(
          "Registration successful! Please verify your OTP.",
          "success"
        );
        // Navigate to OTP verification page with phone number and OTP
        navigate("/otp-verification", {
          state: {
            phoneNumber: data.phoneNumber,
            fromSignup: true,
            otp, // Pass OTP to OTPVerification
          },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
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
            <UserPlus className="h-8 w-8 text-[#1D1F27]" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white sm:text-4xl">
            Join Us Today
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#EDB726] hover:text-[#d4a422] transition-colors duration-200 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-[#2A2D36] py-8 px-6 shadow-xl rounded-xl border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Full Name"
                    placeholder="Enter your full name"
                    error={errors.name?.message}
                    icon={<User className="h-5 w-5" />}
                  />
                )}
              />
            </div>

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
                    placeholder="Enter your phone number"
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Password"
                    isPassword={true}
                    placeholder="Create a strong password"
                    error={errors.password?.message}
                    icon={<Lock className="h-5 w-5" />}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Confirm Password"
                    isPassword={true}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword?.message}
                    icon={<CheckCircle className="h-5 w-5" />}
                  />
                )}
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{" "}
              <Link
                to="/terms"
                className="text-[#EDB726] hover:text-[#d4a422] hover:underline transition-colors duration-200"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-[#EDB726] hover:text-[#d4a422] hover:underline transition-colors duration-200"
              >
                Privacy Policy
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Join thousands of satisfied users
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
