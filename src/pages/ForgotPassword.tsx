import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordSchema } from '../utils/validationSchemas';
import { userForgotPassword } from '../utils/services/Registration.services';
import { showToast } from '../utils/toast.util';
import Button from '../components/common/Button';
import PhoneInput from '../components/common/PhoneInput';

interface ForgotPasswordFormData {
  phoneNumber: string;
}

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await userForgotPassword({
        phone: data.phoneNumber,
      });

      if (response?.data) {
        showToast('OTP sent to your phone number!', 'success');
        navigate('/otp-verification', { 
          state: { 
            phoneNumber: data.phoneNumber,
            fromForgotPassword: true 
          } 
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to send OTP. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-orange-100 shadow-lg">
            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto">
            Enter your phone number and we'll send you a verification code to reset your password
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200">
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
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="pt-2 border-t border-gray-200">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Secure password recovery process
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
