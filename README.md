# Landit

## Environment Notes

The backend expects these values in `server/.env`:

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: secret used to sign authentication tokens.
- `CLIENT_URL`: frontend base URL used for password reset links, for example `http://localhost:5173` locally or your deployed Vercel URL in production.

Password reset links are returned in API responses only outside production so the flow can be tested locally without adding email credentials.
