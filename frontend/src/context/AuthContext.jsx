import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    console.log('Token expired, clearing storage');
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    setUser({
                        id: decodedToken.sub,
                        email: decodedToken.email,
                        role: decodedToken.role,
                        fullName: decodedToken.fullName
                    });
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token);
        setUser({
            id: decodedToken.sub,
            email: decodedToken.email,
            role: decodedToken.role,
            fullName: decodedToken.fullName
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
