import React from 'react';
import {BrowserRouter, Routes,Route} from 'react-router-dom';
import Login from './pages/Login' // import from the log in page
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar';




const App = () => {
  return (
    <BrowserRouter>
    <Navbar /> { }
      <Routes>
        {/* main route */}
        <Route path="/" element={<Login />} />

        {/* Other pages you'll add later */}
        <Route path="/register" element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App
