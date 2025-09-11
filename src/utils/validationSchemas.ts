import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object({
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
});

// Signup validation schema
export const signupSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),

  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password must not exceed 20 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    ),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});


// OTP validation schema
export const otpSchema = yup.object({
  otp: yup
    .string()
    .required('OTP is required')
    .length(4, 'OTP must be exactly 4 digits')
    .matches(/^\d{4}$/, 'OTP must contain only numbers')
});

// Forgot password validation schema
export const forgotPasswordSchema = yup.object({
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
});

// Reset password validation schema
export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
     .max(20, "Password must not exceed 20 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export const changePasswordSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("Old password is required")
    .min(8, "Password must be at least 8 characters"),
  password: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must not exceed 20 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});