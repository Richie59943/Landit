const express = require("express"); // Imports Express to build our web server
const cors = require("cors"); // Imports CORS to allow cross-origin requests
const mongoose = require("mongoose"); // Imports Mongoose to connect to our MongoDB database
const path = require("path");
const jobRoutes = require("./routes/jobs");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
// Loads environment variables from .env file

// List of allowed frontend URLs that can call this API
const allowedOrigins = [
  "http://localhost:5001", // Vite dev (local)
  "https://landitr.vercel.app", // Your main Vercel frontend
  "https://landit-phi.vercel.app", // Any extra Vercel preview you want to allow
];

const authRoutes = require("./routes/auth"); // Imports the auth routes

const app = express(); // Creates an instance of Express (the app)

// CORS setup so only the URLs in allowedOrigins can access the backend
app.use(
  cors({
    origin: allowedOrigins, // Allow only these origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allows credentials like cookies or auth headers
  })
);

app.use(express.json()); // Middleware to parse incoming JSON request bodies

// Route handlers
app.use("/api/auth", authRoutes); // All auth routes go under /api/auth
app.use("/api/jobs", jobRoutes); // All job routes go under /api/jobs

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Logs the error stack trace
  res.status(500).json({ message: "Something went wrong!" }); // Sends generic error message
});

// Connect to MongoDB and start server
const startServer = async () => {
  // Validate required environment variables
  if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI is not set in .env file");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is not set in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI); // Connects to MongoDB
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 5001;
    // Uses Render's assigned PORT in production, 5001 when running locally

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

startServer();
