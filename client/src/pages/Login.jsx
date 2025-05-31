import React, {useEffect, useState} from 'react'; // Import React and state hook 
import {useNavigate} from 'react-router-dom'; // hook to redirect
import API from '../utils/api'; // Axios instance for making calls 
import { isAuthenticated } from '../utils/auth'; // this function is going to check if the user is logged in 

const Login = () => {

    console.log('Login component is rendering'); // Debug log

    //track form inputs
    const [email, setEmail] = useState(''); // email input 
    const[password, setPassword] = useState('');    // password input
    const [error,setError] = useState('');  // tracks eerors

    const navigate = useNavigate(); // hook to redirect after login 

useEffect(() => {
    if(isAuthenticated()) {
        navigate('/dashboard'); // if we are logged in then we naviagte themto the dashbaord
    }
}, []);


    // This will run once the user submits the form 
    const handleLogin = async (e) => {
        e.preventDefault(); // prevents default page refresh 

        try {
            //call backend api
            const res = await API.post('/auth/login', {email, password}); // sends log in request

            //save the JWT token that is returned from backedn 
            localStorage.setItem('token', res.data.token);  // saves the user toekn
            localStorage.setItem('userID', res.data.userId); // saves user id


            //redirect to the dashboard
            navigate('/dashboard');
        }
        catch(err)
        {
            console.error('Login erorr:',err);
            // if the login fails (wrong password or email) we show error 
            const message = err.response?.data?.message || 'Login Failed';
            setError(message); // shows on page
        }
    };


    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="bg-white shadow-md p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full mb-4 px-4 py-2 border rounded"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full mb-4 px-4 py-2 border rounded"
                required
              />
              {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Log In</button>
            </form>
          </div>
        </div>
      );
    };
    
    export default Login;