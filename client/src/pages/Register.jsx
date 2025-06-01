import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api' // this is out Axios calling the API 
import { isAuthenticated } from '../utils/auth';

const Register = () => {
    const [email, setEmail] = useState(''); // users email input 
    const [password, setPassword] = useState('');   // users password input 
    const[error, setError] = useState('');  // to store any error 
    const navigate = useNavigate(); // hook for redirecting after successfull process

useEffect (() => {
  if(isAuthenticated()){
    navigate('/dashboard'); // prevents acces if logged in already
  }
}, []);



    const handleRegister = async (e) => 
    {
        e.preventDefault(); // prevents the pafe from reloading after a subimit 

        try {
            // register the user by sending their email and pass word to the backend 
            await API.post('/auth/register', {email,password});

            // log the user in automatically 
            const res = await API.post('/auth/login', {email,password});

            //save the token from JWT and the user id in local storage so we can use it later 
            localStorage.setItem('token',res.data.token); // saves the jwt token
            localStorage.setItem('userId', res.data.userId); // saves user id


           //edirect the user to our dashboard after signin in 
           navigate('/dashboard');
        }
        catch (err) {
          console.error("Registration error;", err); 
            // if theres a error (user already exist)
            const msg = err.response?.data?.message || "Registration Failed";
            setError(msg);
        }

    };


    return (
<div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      {/* Card-style white box for the form */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-8 rounded-lg w-full max-w-md">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
          Register
        </h2>

        {/* Registration form */}
        <form onSubmit={handleRegister}>
          {/* Email input field */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-green-400"
              value={email} // controlled input
              onChange={(e) => setEmail(e.target.value)} // update state on type
              required // input must be filled
              placeholder="Email" // helpful placeholder text
            />
          </div>

          {/* Password input field */}
          <div className="mb-6">
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-green-400"
              value={password} // controlled input
              onChange={(e) => setPassword(e.target.value)} // update state on type
              required // input must be filled
              placeholder="Password" // placeholder for password
            />
          </div>

          {/* Show error message if any */}
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

// Export the component so it can be used in App.jsx
export default Register;