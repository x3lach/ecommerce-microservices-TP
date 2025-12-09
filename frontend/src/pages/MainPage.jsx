
import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const MainPage = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Main Page</h2>
                {user && (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            <span className="font-medium">Full Name:</span> {user.fullName}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Logged in as:</span> {user.email}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">User ID:</span> {user.id}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Role:</span> {user.role}
                        </p>
                    </div>
                )}
                <button
                    onClick={logout}
                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default MainPage;
