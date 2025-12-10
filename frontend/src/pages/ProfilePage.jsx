import React, { useContext, useEffect, useState } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [userDetails, setUserDetails] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (user) {
                const token = localStorage.getItem('token');
                console.log('Fetching user details for ID:', user.id);
                try {
                    const response = await fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('Response status:', response.status);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Fetched user details:', data);
                        setUserDetails(data);
                    } else {
                        const errorText = await response.text();
                        console.error('Failed to fetch user details:', response.status, errorText);
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }
        };

        const fetchOrders = async () => {
            if (user) {
                const token = localStorage.getItem('token');
                try {
                    const response = await fetch(`http://localhost:8081/api/v1/orders`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setOrders(data);
                    } else {
                        console.error('Failed to fetch orders');
                    }
                } catch (error) {
                    console.error('Error fetching orders:', error);
                }
            }
        };

        fetchUserDetails();
        fetchOrders();
    }, [user]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header>
                <div className="header-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <h1 className="header-title">My Profile</h1>
                </div>
            </header>

            <div className="profile-container">
                <aside className="profile-sidebar">
                    <div className="profile-avatar">
                    </div>
                    <h2 className="profile-name">{user.fullName}</h2>
                    <p className="profile-email">{user.email}</p>
                </aside>

                <main className="profile-content">
                    <section className="content-section">
                        <div className="section-header">
                            <h2 className="section-title">Personal Information</h2>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label className="info-label">Full Name</label>
                                <div className="info-value">{user.fullName}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Email Address</label>
                                <div className="info-value">{user.email}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Phone Number</label>
                                <div className="info-value">{userDetails?.phone || 'N/A'}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Address</label>
                                <div className="info-value">{userDetails?.addressLine1 || 'N/A'}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">City</label>
                                <div className="info-value">{userDetails?.city || 'N/A'}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Postal Code</label>
                                <div className="info-value">{userDetails?.postalCode || 'N/A'}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Country</label>
                                <div className="info-value">{userDetails?.country || 'N/A'}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Role</label>
                                <div className="info-value">{user.role}</div>
                            </div>
                        </div>
                    </section>

                    <section className="content-section">
                        <div className="section-header">
                            <h2 className="section-title">Saved Addresses</h2>
                            <button className="edit-button">
                                ➕ Add New
                            </button>
                        </div>
                        <div className="address-grid">
                            {userDetails && userDetails.addressLine1 && (
                                <div className="address-card default">
                                    <span className="address-badge">Default</span>
                                    <div className="address-details">
                                        {userDetails.addressLine1}<br />
                                        {userDetails.city}, {userDetails.postalCode}<br />
                                        {userDetails.country}
                                    </div>
                                    <div className="address-actions">
                                        <button className="address-action-btn">Edit</button>
                                        <button className="address-action-btn">Remove</button>
                                    </div>
                                </div>
                            )}
                            <div className="address-card add-address-card">
                                <div className="add-icon">+</div>
                                <div className="add-text">Add New Address</div>
                            </div>
                        </div>
                    </section>

                    <section className="content-section">
                        <div className="section-header">
                            <h2 className="section-title">Payment Methods</h2>
                            <button className="edit-button">
                                ➕ Add Card
                            </button>
                        </div>
                        <div className="payment-grid">
                            <div className="payment-card">
                                <div className="payment-icon">💳</div>
                                <div className="payment-info">
                                    <div className="payment-type">Visa ending in 4242</div>
                                    <div className="payment-number">Expires 12/2025</div>
                                </div>
                                <div className="payment-actions">
                                    <button className="icon-button-small">✏️</button>
                                    <button className="icon-button-small">🗑️</button>
                                </div>
                            </div>

                            <div className="payment-card">
                                <div className="payment-icon">💳</div>
                                <div className="payment-info">
.                                    <div className="payment-type">Mastercard ending in 8888</div>
                                    <div className="payment-number">Expires 08/2026</div>
                                </div>
                                <div className="payment-actions">
                                    <button className="icon-button-small">✏️</button>
                                    <button className="icon-button-small">🗑️</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="content-section">
                        <div className="section-header">
                            <h2 className="section-title">Recent Orders</h2>
                            <button className="edit-button">
                                View All
                            </button>
                        </div>
                        <div className="order-list">
                            {orders.map(order => (
                                <div className="order-card" key={order.id}>
                                    <div className="order-header">
                                        <div>
                                            <div className="order-number">Order #{order.orderNumber}</div>
                                            <div className="order-date">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                                    </div>
                                    <div className="order-footer">
                                        <div className="order-total">${order.totalAmount}</div>
                                        <div className="order-actions">
                                            <button className="order-button">View Details</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
