# HopiSuerte – customer web app

React 19 + Vite + Tailwind. Phone-first (works from 360 px up). English only.

Branch `redesign/main` is a clean rebuild; the previous Stripe/Redux prototype is in git history on `development`.

## Run it

```
npm install
npm run dev        # http://localhost:5173 and http://<PC-IP>:5173 for phones on the same Wi-Fi
```

The dev server forwards `/api` to the Laravel API (default `http://127.0.0.1:3002`, change with `VITE_API_PROXY`, see `.env.example`). Start the API first: `php artisan serve --host=0.0.0.0 --port=3002` in `lottery_app_backend`.

## What is here (Phase 2)

- Sign in with a phone number and a 4-digit code (no password, no separate registration). Numbers typed the local Curaçao way work.
- Home: today's games with the closing time and a countdown driven by the **server clock** (`GET /api/v1/time`), always in Curaçao time whatever the phone is set to.
- The session is kept in `localStorage` (30 days, revoked by the server when an account is suspended or blocked).

Buying tickets, balance, tickets and results arrive in the next phases.

## Checks

`npx tsc -b` · `npx eslint .` · `npm run build`

## Login codes in development

The API's `log` OTP driver writes codes to `lottery_app_backend/storage/logs/otp.log`. From the backend folder: `php artisan otp:latest 5181234`.
