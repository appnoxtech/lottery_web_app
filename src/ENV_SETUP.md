# Environment Variables Setup

This document explains the environment variables configuration for the lottery web application.

## Environment File (.env)

The application uses environment variables to configure API endpoints, Firebase settings, and third-party service keys. Create a `.env` file in the root directory of your project.

### Environment Variables

```env
# API Configuration
VITE_API_URL=your_api_url_here
VITE_IMAGE_URL=your_image_url_here

# Stripe Configuration (Payment Processing)
VITE_STRIPE_KEY=your_stripe_publishable_key_here

# Firebase Configuration (Push Notifications & Analytics)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Variable Descriptions

### API Configuration
- **VITE_API_URL**: Base URL for the backend API endpoints
- **VITE_IMAGE_URL**: Base URL for serving images and static assets

### Stripe Configuration
- **VITE_STRIPE_KEY**: Stripe publishable key for payment processing
  - Uses live key for production
  - Test key is commented out for development

### Firebase Configuration
- **VITE_FIREBASE_API_KEY**: Firebase API key for authentication
- **VITE_FIREBASE_AUTH_DOMAIN**: Firebase authentication domain
- **VITE_FIREBASE_PROJECT_ID**: Firebase project identifier
- **VITE_FIREBASE_STORAGE_BUCKET**: Firebase storage bucket for file uploads
- **VITE_FIREBASE_MESSAGING_SENDER_ID**: Firebase Cloud Messaging sender ID
- **VITE_FIREBASE_APP_ID**: Firebase application identifier

## Usage in Code

Environment variables are accessed using `import.meta.env` in Vite:

```typescript
// API Configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'https://hopisuerte.com/api/';
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'https://hopisuerte.com/public/';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
};
```

## TypeScript Support

Environment variables are typed in `src/vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_IMAGE_URL: string
  readonly VITE_STRIPE_KEY: string
  readonly VITE_FIREBASE_API_KEY: string
  // ... other variables
}
```

## Security Notes

1. **Never commit the .env file** to version control
2. **Use different keys for development and production**
3. **Keep API keys secure** and rotate them regularly
4. **Validate environment variables** on application startup

## Development vs Production

### Development Environment
```env
VITE_API_URL=http://localhost:3000/api/
VITE_STRIPE_KEY=pk_test_your_test_key_here
```

### Production Environment
```env
VITE_API_URL=your_production_api_url
VITE_STRIPE_KEY=pk_live_your_live_key_here
```

## Error Handling

The application includes fallback values for critical environment variables:

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'https://hopisuerte.com/api/';
```

This ensures the application continues to work even if environment variables are not properly configured.

## Deployment

When deploying to production:

1. Set environment variables in your hosting platform
2. Ensure all required variables are configured
3. Test the application with production values
4. Monitor for any configuration-related errors

## Troubleshooting

### Common Issues

1. **Variables not loading**: Ensure variables start with `VITE_`
2. **Build errors**: Check that all required variables are defined
3. **API connection issues**: Verify the API URL is correct and accessible
4. **Payment failures**: Confirm Stripe key is valid and active

### Debugging

Add logging to verify environment variables are loaded correctly:

```typescript
console.log('Environment loaded:', {
  apiUrl: import.meta.env.VITE_API_URL,
  hasStripeKey: !!import.meta.env.VITE_STRIPE_KEY,
  hasFirebaseKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
});
```
