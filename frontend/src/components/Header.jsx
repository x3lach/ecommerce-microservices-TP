import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import logo from '/logo.png';
import './Header.css';

const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Header = ({ toggleSidebar, onSearchChange, initialSearchValue }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    
    const [profileDropdownActive, setProfileDropdownActive] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [searchValue, setSearchValue] = useState(initialSearchValue || '');

    useEffect(() => {
        setSearchValue(initialSearchValue || '');
    }, [initialSearchValue]);
    
    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        if (onSearchChange) {
            onSearchChange(e.target.value);
        }
    };

    // Fetch user details
    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => response.json())
            .then(data => setUserDetails(data))
            .catch(error => console.error('Failed to fetch user details', error));
        }
    }, [user]);

    const toggleProfile = (e) => {
        e.stopPropagation();
        setProfileDropdownActive(!profileDropdownActive);
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        const closeDropdown = () => setProfileDropdownActive(false);
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    return (
        <header>
            <div className="header-left">
                {toggleSidebar && <button className="menu-toggle" onClick={toggleSidebar}>☰</button>}
                <div className="logo-container" onClick={() => navigate('/')}>
                    <img src={logo} alt="SouqUp Logo" className="logo-img logo-img-large" />
                    <img src="/SouqUp.png" alt="SouqUp" className="logo-img" />
                </div>
            </div>

            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Search products..." 
                    value={searchValue}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="header-actions">
                <button className="icon-button" onClick={() => navigate('/cart')}>
                    🛒
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
                <div className="profile-wrapper">
                    {userDetails ? (
                        <>
                            <div className="profile-avatar-header" onClick={toggleProfile} title="Profile options">
                                {userDetails.profileImageUrl ? (
                                    <img src={userDetails.profileImageUrl} alt="Profile" />
                                ) : (
                                    getInitials(userDetails.fullName)
                                )}
                            </div>
                            <div className={`profile-dropdown ${profileDropdownActive ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
                                <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                    <span>View Profile</span>
                                </button>
                                <button className="dropdown-item" onClick={() => navigate('/my-items')}>
                                    <span>My Items</span>
                                </button>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
