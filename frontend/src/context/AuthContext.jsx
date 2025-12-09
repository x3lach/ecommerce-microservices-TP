import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
        try {
            const decodedToken = jwtDecode(token);
            setUser({
                id: decodedToken.sub,
                email: decodedToken.email,
                role: decodedToken.role,
                fullName: decodedToken.fullName
            });
        } catch (error) {
            localStorage.removeItem('token');
        }
        }
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
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
