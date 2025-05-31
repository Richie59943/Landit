const express = require("express"); // Imports Express to build our web server
const cors = require("cors"); // Imports CORS to allow cross-origin requests
const mongoose = require("mongoose"); // Imports Mongoose to connect to our MongoDB database
const path = require('path');
const jobRoutes = require ('./routes/jobs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); 
 // Imports dotenv to load environment variables from .env file

const authRoutes = require("./routes/auth"); // Imports the authRoutes module

const app = express(); // Creates an instance of Express ( or a express app)

app.use(cors()); // Uses the cors middleware to allow cross-origin requests(so front end can make requests)
app.use(express.json()); //Middle ware to parse incomsing json request 

app.use('/api/auth',authRoutes); // this sets all auth-related routes under /api/auth
app.use('/api/jobs', jobRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
};

startServer();

