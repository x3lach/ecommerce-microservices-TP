import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    // Sign-in state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSignInPassword, setShowSignInPassword] = useState(false);


    // Sign-up state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('CLIENT');
    const [phone, setPhone] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);


    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8085/auth/login', { email, password }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            login(response.data);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerPassword !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        const userData = {
            fullName: `${firstName} ${lastName}`,
            email: registerEmail,
            password: registerPassword,
            role,
            phone,
            addressLine1,
            city,
            postalCode,
            country
        };

        try {
            await axios.post('http://localhost:8085/api/v1/users', userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // automatically sign in the user after registration
            const response = await axios.post('http://localhost:8085/auth/login', { email: registerEmail, password: registerPassword }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            login(response.data);
            navigate('/');

        } catch (error) {
            console.error('Registration failed', error);
        }
    };


    const handleSignUpClick = () => {
        setIsSignUp(true);
    };

    const handleSignInClick = () => {
        setIsSignUp(false);
    };

    return (
        <div>
            <div className={`container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
                <div className="form-container sign-up-container">
                    <form onSubmit={handleRegister}>
                        <h1>Create Account</h1>

                        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        <input type="email" placeholder="Email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                        <div className="password-container">
                            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowPassword(!showPassword)}></i>
                        </div>
                        <div className="password-container">
                            <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowConfirmPassword(!showConfirmPassword)}></i>
                        </div>

                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="CLIENT">Client</option>
                            <option value="SELLER">Seller</option>
                        </select>

                        <input type="text" placeholder="Phone (Optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <input type="text" placeholder="Address (Optional)" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
                        <input type="text" placeholder="City (Optional)" value={city} onChange={(e) => setCity(e.target.value)} />
                        <input type="text" placeholder="Postal Code (Optional)" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                        <input type="text" placeholder="Country (Optional)" value={country} onChange={(e) => setCountry(e.target.value)} />


                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLogin}>
                        <img src="/logo.png" alt="App Logo" className="app-logo" />
                        <h1>Sign in</h1>
                        <span>or use your account</span>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="password-container">
                            <input
                                type={showSignInPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <i className={`fas ${showSignInPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowSignInPassword(!showSignInPassword)}></i>
                        </div>
                        <a href="#">Forgot your password?</a>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start journey with us</p>
                            <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;