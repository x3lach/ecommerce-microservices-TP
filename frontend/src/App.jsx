import React from 'react';



import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';







import LoginPage from './pages/LoginPage';



import RegisterPage from './pages/RegisterPage';



import MainPage from './pages/MainPage';



import ProfilePage from './pages/ProfilePage';
import MyItemsPage from './pages/MyItemsPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';



import ProtectedRoute from './utils/ProtectedRoute';



import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';







function App() {



    return (



        <Router>



            <AuthProvider>
                <CartProvider>


                <Routes>



                    <Route path="/login" element={<LoginPage />} />



                    <Route path="/register" element={<RegisterPage />} />



                    <Route path="/product/:id" element={<ProductPage />} />



                    <Route element={<ProtectedRoute />}>



                        <Route path="/" element={<MainPage />} />



                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/my-items" element={<MyItemsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />



                    </Route>



                </Routes>
                </CartProvider>


            </AuthProvider>



        </Router>



    );



}







export default App;
