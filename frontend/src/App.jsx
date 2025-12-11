import React from 'react';



import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';







import LoginPage from './pages/LoginPage';



import RegisterPage from './pages/RegisterPage';



import MainPage from './pages/MainPage';



import ProfilePage from './pages/ProfilePage';
import MyItemsPage from './pages/MyItemsPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';



import ProtectedRoute from './utils/ProtectedRoute';



import { AuthProvider } from './context/AuthContext';







function App() {



    return (



        <Router>



            <AuthProvider>



                <Routes>



                    <Route path="/login" element={<LoginPage />} />



                    <Route path="/register" element={<RegisterPage />} />



                    <Route path="/product/:id" element={<ProductPage />} />



                    <Route element={<ProtectedRoute />}>



                        <Route path="/" element={<MainPage />} />



                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/my-items" element={<MyItemsPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />



                    </Route>



                </Routes>



            </AuthProvider>



        </Router>



    );



}







export default App;
