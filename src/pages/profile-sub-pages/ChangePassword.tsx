import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// import { useSelector } from "react-redux";
import { changePasswordSchema } from "../../utils/validationSchemas";
import { userChangePassword } from "../../utils/services/Registration.services";
import { showToast } from "../../utils/toast.util";
import { Input, Button } from "../../components/common";
// import { type RootState } from "../../store";

interface ChangePasswordFormData {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // add reset here
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await userChangePassword({
        old_password: data.oldPassword,
        new_password: data.password,
      });

      if (response?.data?.success) {
        showToast("Password updated successfully!", "success");
        reset(); // Reset the form fields here
      } else {
        showToast(
          response?.data?.message || "Failed to update password.",
          "error"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to update password.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D1F27] text-white p-6 rounded-lg shadow-lg flex flex-col items-center">
      <div className="mb-6 flex flex-col text-center items-center mt-8 lg:mt-0">
        <img
          src="/image.png" // Path relative to public folder
          alt="Transactions Icon"
          className="w-12 h-12"
        />
        <h1 className="text-3xl font-semibold text-white mb-1">Wega di Number</h1>
        <span className="block text-[#EDB726] tracking-[0.8em] text-semibold text-lg">online</span>
      </div>

      <h1 className="text-2xl sm:text-3xl mb-8 text-center">
        <span className="text-white">Change </span>
        <span className="text-[#EDB726]">Password?</span>
      </h1>


      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm mb-8 space-y-6"
      >
        <Controller
          name="oldPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              // label="Old Password"
              isPassword={true}
              placeholder="Old Password"
              error={errors.oldPassword?.message}
              // icon={<Lock className="h-5 w-5" />}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              // label="New Password"
              isPassword={true}
              placeholder="Create New Password"
              error={errors.password?.message}
              // icon={<Lock className="h-5 w-5" />}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              // label="Confirm Password"
              isPassword={true}
              placeholder="Confirm Password"
              error={errors.confirmPassword?.message}
              // icon={<CheckCircle className="h-5 w-5" />}
            />
          )}
        />

        <Button
          type="submit"
          className="w-full font-bold"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
