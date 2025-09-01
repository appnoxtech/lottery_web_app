import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordSchema } from '../utils/validationSchemas';
import { userUpdatePassword } from '../utils/services/Registration.services';
import { showToast } from '../utils/toast.util';
import { Input, Button } from '../components/common';
import { Key, Lock, CheckCircle, Info } from 'lucide-react';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const phoneNumber = location.state?.phoneNumber || '';
  const verified = location.state?.verified || false;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!phoneNumber || !verified) {
      navigate('/forgot-password');
    }
  }, [phoneNumber, verified, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await userUpdatePassword({
        phone_number: `+${phoneNumber}`,
        new_password: data.password,
      });

      if (response?.data) {
        showToast('Password reset successfully!', 'success');
        navigate('/login');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to reset password. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D1F27] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#EDB726]">
            <Key className="h-6 w-6 text-[#1D1F27]" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Enter your new password for{' '}
            <span className="font-medium text-[#EDB726]">{phoneNumber}</span>
          </p>
        </div>

        <div className="bg-[#2A2D36] py-8 px-6 shadow-lg rounded-lg border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="New Password"
                    isPassword={true}
                    placeholder="Enter your new password"
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
                    label="Confirm New Password"
                    isPassword={true}
                    placeholder="Confirm your new password"
                    error={errors.confirmPassword?.message}
                    icon={<CheckCircle className="h-5 w-5" />}
                  />
                )}
              />
            </div>

            <div className="bg-[#1D1F27] border border-[#EDB726] rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-[#EDB726]" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[#EDB726]">Password Requirements</h3>
                  <div className="mt-2 text-sm text-gray-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>At least 6 characters long</li>
                      <li>Contains uppercase and lowercase letters</li>
                      <li>Contains at least one number</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
