import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSchema } from '../utils/validationSchemas';
import { userSignIn } from '../utils/services/Registration.services';
import { showToast } from '../utils/toast.util';
import { Input, Button, PhoneInput } from '../components/common';
import { User, Lock } from 'lucide-react';
import { setUser } from '../store/slicer/userSlice';

interface LoginFormData {
  phoneNumber: string;
  password: string;
}

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await userSignIn({
        phone_number: `+${data.phoneNumber}`,
        password: data.password,
      });

      console.log('Login response:', response); // Debug log

      if (response?.data?.success && response?.data?.result) {
        showToast(response.data.message || 'Login successful!', 'success');
        
        // Extract token and user data from the correct response structure
        const token = response.data.result.token;
        const userData = response.data.result.data;
        
        // Store token and user data in localStorage
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Dispatch user data to Redux store
        dispatch(setUser({
          userData: userData as Record<string, string>,
          token: token
        }));
        
        console.log('Token stored:', token); // Debug log
        console.log('User data stored:', userData); // Debug log
        
        // Small delay to ensure data is stored before navigation
        setTimeout(() => {
          navigate('/new-lottery', { replace: true });
        }, 100);
      } else {
        showToast('Login response invalid. Please try again.', 'error');
      }
    } catch (error: unknown) {
      console.error('Login error:', error); // Debug log
      let errorMessage = 'Login failed. Please try again.';
      if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data) {
        errorMessage = (error.response.data as { message: string }).message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D1F27] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          

          {/* Logo Image Instead of UserPlus */}
          <div className="mx-auto mt-6  h-16 w-16 flex items-center justify-center rounded-full  shadow-lg overflow-hidden">
            <img
              src="/image.png" // ✅ public folder image
              alt="Logo"
              className="h-14 w-14 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-8">
            Wega di Number <span className="block text-[#EDB726] tracking-[0.8em] text-semibold text-lg">online</span>
          </h1>

          {/* Subtitle */}
          <h3 className="mt-6 text-center text-2xl font-medium text-white sm:text-3xl">
            Welcome back! <span className="text-[#EDB726]">login</span>
          </h3>
        </div>

        <div className="bg-[#2A2D36] py-8 px-6 shadow-xl rounded-xl border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    // label="Phone Number"
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
                    // label="Password"
                    isPassword={true}
                    placeholder="Password"
                    error={errors.password?.message}
                    // icon={<Lock className="h-5 w-5" />}
                  />
                )}
              />
            </div>

            <div className="flex float-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#EDB726] hover:text-[#d4a422] transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-3 text-base font-bold shadow-lg hover:shadow-xl"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' :'Login'}
              </Button>
            </div>
          </form>
        </div>
        <p className="mt-2 text-center text-sm text-gray-300">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="underline font-medium text-[#EDB726] hover:text-[#d4a422] transition-colors duration-200 hover:underline"
            >
              Signup
            </Link>
          </p>
        
      </div>
    </div>
  );
};

export default Login;
