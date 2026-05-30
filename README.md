# Landit

## Environment Notes

The backend expects these values in `server/.env`:

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: secret used to sign authentication tokens.
- `CLIENT_URL`: frontend base URL used for password reset links, for example `http://localhost:5173` locally or your deployed Vercel URL in production.
- `SMTP_HOST`: SMTP server host used to send password reset emails.
- `SMTP_PORT`: SMTP server port, commonly `587` for TLS.
- `SMTP_SECURE`: set to `true` only for secure SMTP ports like `465`; otherwise use `false`.
- `SMTP_USER`: SMTP account username.
- `SMTP_PASS`: SMTP account password or app password.
- `EMAIL_FROM`: sender address, for example `Landit <no-reply@yourdomain.com>`.

Password reset links are returned in API responses only outside production so the flow can be tested locally without adding email credentials.

## Deployment Notes

The client includes `client/vercel.json` so direct visits or reloads on React Router pages, such as `/dashboard` and `/reset-password/:token`, serve `index.html` instead of returning a 404.
