# Auth Service (Logout + Password Recovery with OTP)

A professional, reusable NestJS microservice that provides:

- Logout endpoint (JWT invalidation via user record token field)
- Password recovery flow using email-delivered OTP:
  - Request OTP
  - Verify OTP (issues short-lived reset token)
  - Reset password

## Endpoints

- POST /security/logout
  - Headers: Authorization: Bearer <jwt>
  - Response: { message: 'Logged out successfully' }

- POST /security/password-reset/request
  - Body: { email: string }
  - Response: { message: 'OTP sent successfully', email }

- POST /security/password-reset/verify-otp
  - Body: { email: string, otp: string }
  - Response: { message: 'OTP verified successfully', token }

- POST /security/password-reset/reset
  - Body: { email: string, token: string, newPassword: string }
  - Response: { message: 'Password reset successfully' }

## Tech
- NestJS 11, Mongoose 8
- JWT for reset token(s)

## Environment
Create a .env with:

- MONGODB_URI=mongodb://localhost:27017/auth
- JWT_SECRET=replace-with-strong-secret
- PORT=3000

## Run

- npm install
- npm run start:dev

Open Swagger at /api for docs.

## Notes
- Replace EmailService with a real provider (SES/SendGrid). The current implementation logs OTPs to console for development.
- User schema includes fields to store OTP hash, attempts, expiry, and reset token state.
- Token invalidation is handled by clearing the persisted token; integrate with your auth middleware accordingly.
