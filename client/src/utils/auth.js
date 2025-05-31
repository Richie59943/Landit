
import React from "react";

//This utility checks if the user is logged in by checking if a token is saved
export const isAuthenticated = () => {
    return !!localStorage.getItem('token'); // returns true if the toke exists 
};