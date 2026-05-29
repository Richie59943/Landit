const mongoose = require("mongoose"); // Import Mongoose

//defining the schema
//for a user

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});


//Export the model to use it elssewhere
module.exports = mongoose.model("User", userSchema);
