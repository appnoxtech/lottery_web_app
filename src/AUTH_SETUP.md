# Authentication System Setup

This document explains the comprehensive authentication system that has been implemented for the lottery web application.

## Features Implemented

✅ **Login Page**
- Phone number input with country code selection
- Password field with show/hide toggle
- Form validation using Yup and React Hook Form
- API integration with existing backend services
- Responsive design for all devices

✅ **Signup Page**
- Name, phone number, password, and confirm password fields
- Comprehensive form validation
- Redirect to OTP verification after successful signup
- Links to login page and terms/privacy policy

✅ **OTP Verification Page**
- 6-digit OTP input with auto-focus and paste support
- Countdown timer for resend functionality
- Integration with backend OTP services
- Support for both signup and forgot password flows

✅ **Forgot Password Page**
- Phone number input to request password reset
- OTP verification flow integration
- Clean, user-friendly interface

✅ **Reset Password Page**
- New password and confirm password fields
- Password strength requirements display
- Form validation and API integration

✅ **Dashboard Page**
- Protected route that requires authentication
- Simple welcome interface with logout functionality
- Ready for integration with lottery features

## Technical Implementation

### Dependencies Installed
- `react-router-dom` - For navigation and routing
- `react-hook-form` - For form management
- `@hookform/resolvers` - For Yup integration
- `yup` - For form validation schemas
- `react-phone-input-2` - For international phone number input
- `react-toastify` - For toast notifications

### File Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Input.tsx          # Reusable input component
│   │   ├── Button.tsx         # Reusable button component
│   │   ├── PhoneInput.tsx     # Phone number input component
│   │   └── index.ts           # Component exports
├── pages/
│   ├── Login.tsx              # Login page
│   ├── Signup.tsx             # Registration page
│   ├── OTPVerification.tsx    # OTP verification page
│   ├── ForgotPassword.tsx     # Forgot password page
│   ├── ResetPassword.tsx      # Reset password page
│   ├── Dashboard.tsx          # Protected dashboard page
│   └── index.ts               # Page exports
├── utils/
│   ├── validationSchemas.ts   # Yup validation schemas
│   └── toast.util.ts          # Toast utility functions
└── App.tsx                    # Main app with routing
```

### API Integration

The system integrates with your existing API services:

- **Login**: `userSignIn()` from Registration.services.ts
- **Signup**: `userSignup()` from Registration.services.ts
- **OTP Verification**: `userOTPVerfication()` from Registration.services.ts
- **Send OTP**: `userSendOTP()` from Registration.services.ts
- **Forgot Password**: `userForgotPassword()` from Registration.services.ts
- **Reset Password**: `userUpdatePassword()` from Registration.services.ts

### Routing System

- **Public Routes**: Login, Signup, Forgot Password (redirect to dashboard if already logged in)
- **Mixed Routes**: OTP Verification, Reset Password (accessible during auth flows)
- **Protected Routes**: Dashboard (requires authentication token)
- **Default Route**: Redirects to login page

### Form Validation

Comprehensive validation using Yup schemas:

- **Phone Number**: International format validation
- **Password**: Minimum 6 characters, must contain uppercase, lowercase, and number
- **Name**: 2-50 characters
- **OTP**: Exactly 6 digits
- **Confirm Password**: Must match password field

### Responsive Design

- Mobile-first approach with Tailwind CSS classes
- Custom responsive CSS for small screens
- Optimized phone input for mobile devices
- Responsive toast notifications
- Touch-friendly button and input sizes

### Security Features

- Protected routes with token-based authentication
- Automatic redirects for authenticated/unauthenticated users
- Form validation on both client and server side
- Secure password handling with show/hide toggle
- OTP auto-expiry and resend functionality

## Usage Instructions

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173` in your browser

3. The application will redirect to the login page by default

### Authentication Flow

1. **New User Registration**:
   - Click "Sign up here" on login page
   - Fill in name, phone number, password, and confirm password
   - Submit form → redirects to OTP verification
   - Enter 6-digit OTP → redirects to login page
   - Login with credentials → redirects to dashboard

2. **Existing User Login**:
   - Enter phone number and password
   - Submit form → redirects to dashboard

3. **Password Reset**:
   - Click "Forgot your password?" on login page
   - Enter phone number → OTP sent
   - Enter OTP → redirects to reset password page
   - Enter new password → redirects to login page

### Customization

- **Styling**: Modify `src/App.css` for global styles
- **Validation**: Update schemas in `src/utils/validationSchemas.ts`
- **API Endpoints**: Services are already integrated with existing backend
- **Routes**: Add new routes in `src/App.tsx`
- **Components**: Reuse components from `src/components/common/`

### Toast Notifications

The system uses react-toastify for user feedback:
- Success messages for successful operations
- Error messages for failed operations
- Warning and info messages as needed

All toast messages are responsive and positioned appropriately for mobile devices.

## Next Steps

The authentication system is now fully functional and ready for integration with your lottery application features. You can:

1. Replace the placeholder Dashboard component with your actual lottery interface
2. Add additional protected routes for lottery features
3. Integrate user profile management
4. Add more sophisticated error handling
5. Implement refresh token logic if needed

The system is built with scalability and maintainability in mind, using modern React patterns and best practices.
