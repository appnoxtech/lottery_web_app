import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { signupSchema } from "../utils/validationSchemas";
import { userSignup } from "../utils/services/Registration.services";
import { showToast } from "../utils/toast.util";
import { Input, Button, PhoneInput } from "../components/common";

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
        const otp = response.data.result.otp;
        showToast(
          "Registration successful! Please verify your OTP.",
          "success"
        );
        navigate("/otp-verification", {
          state: {
            phoneNumber: data.phoneNumber,
            fromSignup: true,
            otp,
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
        
        {/* Title Section */}
        <div className="text-center">
          

          {/* Logo Image Instead of UserPlus */}
          <div className="mx-auto mt-6 h-16 w-16 flex items-center justify-center rounded-full  shadow-lg overflow-hidden">
            <img
              src="/image.png" // ✅ public folder image
              alt="Logo"
              className="h-14 w-14 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Wega di Number <span className="block text-[#EDB726] tracking-[0.8em] text-semibold text-lg">online</span>
          </h1>

          {/* Subtitle */}
          <h3 className="mt-6 text-center text-xl font-medium text-white sm:text-2xl">
            Sign Up For An <span className="text-[#EDB726]">Account</span>
          </h3>
        </div>

        {/* Form Section */}
        <div className="bg-[#2A2D36] py-8 px-6 shadow-xl rounded-xl border border-white">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="User Name"
                    error={errors.name?.message}
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
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.phoneNumber?.message}
                    placeholder="Phone Number"
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
                    isPassword={true}
                    placeholder="Password"
                    error={errors.password?.message}
                    maxLength={20}
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
                    isPassword={true}
                    placeholder="Confirm Password"
                    error={errors.confirmPassword?.message}
                    maxLength={20}
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

            <div className="text-md text-white text-center">
              <p>By signing up you accept our{" "}</p>
              <Link
                to="/terms"
                className="text-[#EDB726] hover:text-[#d4a422] hover:underline transition-colors duration-200"
              >
                terms and conditions
              </Link>
            </div>
          </form>
        </div>

        {/* Already Have Account */}
        <p className="mt-2 text-center text-md text-gray-300">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[#EDB726] hover:text-[#d4a422] transition-colors duration-200 underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
