import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector } from "react-redux";
import { resetPasswordSchema } from "../../utils/validationSchemas";
import { userUpdatePassword } from "../../utils/services/Registration.services";
import { showToast } from "../../utils/toast.util";
import { Input, Button } from "../../components/common";
import { Lock, CheckCircle } from "lucide-react";
import { type RootState } from "../../store";

interface ChangePasswordFormData {
  password: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const userPhoneNumber = useSelector(
    (state: RootState) => state.user.userData?.phone_number || ""
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!userPhoneNumber) {
      showToast("User phone number not found.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await userUpdatePassword({
        phone_number: Number(userPhoneNumber),
        new_password: data.password,
      });

      if (response?.data) {
        showToast("Password updated successfully!", "success");
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
      <div className="mb-6 text-center mt-8">
        <h1 className="text-3xl font-bold text-white mb-1">Wega di Number</h1>
        <p className="text-lg font-light text-[#EDB726] tracking-widest">
          online
        </p>
      </div>

      <h1 className="text-3xl sm:text-4xl mb-8 text-center">
        <span className="text-white">Change </span>
        <span className="text-[#EDB726]">Password?</span>
      </h1>

      <h4 className="mb-6">
        <span className="text-[#EDB726]">
          Change Password for this number -{" "}
        </span>
        <span className="text-white">{userPhoneNumber}</span>
      </h4>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm mb-8 space-y-6"
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="New Password"
              isPassword={true}
              placeholder="Create New Password"
              error={errors.password?.message}
              icon={<Lock className="h-5 w-5" />}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Confirm Password"
              isPassword={true}
              placeholder="Confirm Password"
              error={errors.confirmPassword?.message}
              icon={<CheckCircle className="h-5 w-5" />}
            />
          )}
        />

        <Button
          type="submit"
          className="w-full"
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

