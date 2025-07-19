# Password Recovery Backend

A Node.js/Express backend service for handling password recovery with OTP functionality.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Gmail app password (not regular password)
- `PORT`: Server port (default: 3001)

## Gmail App Password Setup

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this app password in the `EMAIL_PASS` environment variable

## API Endpoints

### POST /api/password-reset/request
Request password reset OTP
```json
{
  "email": "user@example.com"
}
```

### POST /api/password-reset/verify-otp
Verify OTP code
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### POST /api/password-reset/reset
Reset password with verified token
```json
{
  "email": "user@example.com",
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## Security Features

- OTP expires in 10 minutes
- Maximum 3 OTP verification attempts
- Password hashing with bcrypt
- CORS protection
- Input validation

## Deployment

Deploy to services like:
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2