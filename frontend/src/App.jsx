


import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';

import RegisterPage from './pages/RegisterPage';

import MainPage from './pages/MainPage';

import ProtectedRoute from './utils/ProtectedRoute';

import { AuthProvider } from './context/AuthContext';



function App() {

    return (

        <Router>

            <AuthProvider>

                <Routes>

                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<ProtectedRoute />}>

                        <Route path="/" element={<MainPage />} />

                    </Route>

                </Routes>

            </AuthProvider>

        </Router>

    );

}



export default App;
