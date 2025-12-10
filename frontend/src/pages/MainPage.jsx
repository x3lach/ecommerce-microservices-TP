import React, { useState, useEffect, useContext } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '/logo.png';

const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const MainPage = () => {
    const [sidebarHidden, setSidebarHidden] = useState(false);
    const [profileDropdownActive, setProfileDropdownActive] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [userDetails, setUserDetails] = useState(null);

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


    const toggleSidebar = () => {
        setSidebarHidden(!sidebarHidden);
    };

    const toggleProfile = () => {
        setProfileDropdownActive(!profileDropdownActive);
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            alert('Logging out...');
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    useEffect(() => {
        const closeDropdown = (event) => {
            const profileWrapper = document.querySelector('.profile-wrapper');
            if (profileWrapper && !profileWrapper.contains(event.target)) {
                setProfileDropdownActive(false);
            }
        };

        document.addEventListener('click', closeDropdown);

        return () => {
            document.removeEventListener('click', closeDropdown);
        };
    }, []);

    return (
        <>
            <header>
                <div className="header-left">
                    <button className="menu-toggle" onClick={toggleSidebar}>☰</button>
                    <div className="logo-container" onClick={() => navigate('/')}>
                        <img src={logo} alt="SouqUp Logo" className="logo-img logo-img-large" />
                        <img src="/SouqUp.png" alt="SouqUp" className="logo-img" />
                    </div>
                </div>

                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input type="text" className="search-bar" placeholder="Search products..." />
                </div>

                <div className="header-actions">
                    <button className="icon-button">
                        🛒
                        <span className="cart-badge">3</span>
                    </button>
                    <div className="profile-wrapper">
                        {userDetails && (
                            <div className="profile-avatar-header" onClick={toggleProfile} title="Profile options">
                                {userDetails.profileImageUrl ? (
                                    <img src={userDetails.profileImageUrl} alt="Profile" />
                                ) : (
                                    getInitials(userDetails.fullName)
                                )}
                            </div>
                        )}
                        <div className={`profile-dropdown ${profileDropdownActive ? 'active' : ''}`} id="profileDropdown">
                                                    <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                                        <span>View Profile</span>
                                                    </button>                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="main-container">
                <aside className={`sidebar ${sidebarHidden ? 'hidden' : ''}`} id="sidebar">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Filters</h2>
                        <p className="sidebar-subtitle">Refine your search</p>
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Search by Name</label>
                        <input type="text" className="filter-input" placeholder="Product name..." />
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Price Range</label>
                        <div className="price-range">
                            <div className="price-input-wrapper">
                                <input type="number" className="filter-input price-input" placeholder="Min" />
                            </div>
                            <div className="price-input-wrapper">
                                <input type="number" className="filter-input price-input" placeholder="Max" />
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Categories</label>
                        <div className="category-list">
                            <label className="category-item">
                                <input type="checkbox" className="category-checkbox" />
                                <span className="category-label">Electronics</span>
                            </label>
                            <label className="category-item">
                                <input type="checkbox" className="category-checkbox" />
                                <span className="category-label">Fashion</span>
                            </label>
                            <label className="category-item">
                                <input type="checkbox" className="category-checkbox" />
                                <span className="category-label">Home & Garden</span>
                            </label>
                            <label className="category-item">
                                <input type="checkbox" className="category-checkbox" />
                                <span className="category-label">Sports</span>
                            </label>
                            <label className="category-item">
                                <input type="checkbox" className="category-checkbox" />
                                <span className="category-label">Accessories</span>
                            </label>
                            <label className="category-item">
                                <input type="checkbox" className="category-checkbox" />
                                <span className="category-label">Toys & Games</span>
                            </label>
                        </div>
                    </div>

                    <button className="apply-filters-btn">Apply Filters</button>
                </aside>

                <main className={`content ${sidebarHidden ? 'expanded' : ''}`} id="content">
                    <div className="content-header">
                        <h1 className="content-title">Discover Products</h1>
                        <p className="results-info">Showing 12 products</p>
                    </div>

                    <div className="products-grid">
                        <article className="product-card">
                            <div className="product-image">
                                <span>🎧</span>
                                <span className="product-tag">NEW</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Electronics</p>
                                <h3 className="product-title">Wireless Headphones Pro</h3>
                                <div className="product-footer">
                                    <span className="product-price">$89.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>⌚</span>
                                <span className="product-tag">HOT</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Electronics</p>
                                <h3 className="product-title">Smart Watch Ultra</h3>
                                <div className="product-footer">
                                    <span className="product-price">$299.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>👕</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Fashion</p>
                                <h3 className="product-title">Premium Cotton T-Shirt</h3>
                                <div className="product-footer">
                                    <span className="product-price">$29.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>👟</span>
                                <span className="product-tag">SALE</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Sports</p>
                                <h3 className="product-title">Running Shoes Elite</h3>
                                <div className="product-footer">
                                    <span className="product-price">$79.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>☕</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Home & Garden</p>
                                <h3 className="product-title">Coffee Maker Deluxe</h3>
                                <div className="product-footer">
                                    <span className="product-price">$49.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>🎮</span>
                                <span className="product-tag">NEW</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Electronics</p>
                                <h3 className="product-title">Gaming Console Pro</h3>
                                <div className="product-footer">
                                    <span className="product-price">$499.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>🎒</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Accessories</p>
                                <h3 className="product-title">Travel Backpack</h3>
                                <div className="product-footer">
                                    <span className="product-price">$59.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>💡</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Home & Garden</p>
                                <h3 className="product-title">Smart LED Desk Lamp</h3>
                                <div className="product-footer">
                                    <span className="product-price">$39.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>📷</span>
                                <span className="product-tag">HOT</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Electronics</p>
                                <h3 className="product-title">Digital Camera 4K</h3>
                                <div className="product-footer">
                                    <span className="product-price">$699.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>🧘</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Sports</p>
                                <h3 className="product-title">Yoga Mat Premium</h3>
                                <div className="product-footer">
                                    <span className="product-price">$24.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>🎲</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Toys & Games</p>
                                <h3 className="product-title">Board Game Collection</h3>
                                <div className="product-footer">
                                    <span className="product-price">$44.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>

                        <article className="product-card">
                            <div className="product-image">
                                <span>🔊</span>
                                <span className="product-tag">SALE</span>
                            </div>
                            <div className="product-info">
                                <p className="product-category">Electronics</p>
                                <h3 className="product-title">Bluetooth Speaker</h3>
                                <div className="product-footer">
                                    <span className="product-price">$119.99</span>
                                    <div className="product-icon">🏷️</div>
                                </div>
                            </div>
                        </article>
                    </div>
                </main>
            </div>
        </>
    );
};

export default MainPage;
