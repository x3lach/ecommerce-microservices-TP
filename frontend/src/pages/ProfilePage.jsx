import React, { useContext, useEffect, useState } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [userDetails, setUserDetails] = useState(null);
    const [orders, setOrders] = useState([]);
    const [editableFields, setEditableFields] = useState({
        phone: '',
        addressLine1: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [addresses, setAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        addressLine1: '',
        city: '',
        postalCode: '',
        country: '',
        label: 'Home',
        isDefault: false
    });

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
                        setEditableFields({
                            phone: data.phone || '',
                            addressLine1: data.addressLine1 || '',
                            city: data.city || '',
                            postalCode: data.postalCode || '',
                            country: data.country || ''
                        });

                        // If user has address data, create a default address object for display
                        if (data.addressLine1 || data.city || data.postalCode || data.country) {
                            const defaultAddress = {
                                id: 'default-' + user.id, // Temporary ID for the default address
                                addressLine1: data.addressLine1 || '',
                                city: data.city || '',
                                postalCode: data.postalCode || '',
                                country: data.country || '',
                                isDefault: true,
                                label: 'Home',
                                isFromUserTable: true // Flag to indicate this is from users table
                            };
                            setAddresses([defaultAddress]);
                        }
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

        const fetchAddresses = async () => {
            if (user) {
                const token = localStorage.getItem('token');
                try {
                    const response = await fetch(`http://localhost:8081/api/v1/users/${user.id}/addresses`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Fetched addresses from API:', data);
                        // If we have addresses from API, use those instead
                        if (data && data.length > 0) {
                            setAddresses(data);
                        }
                    } else {
                        console.log('Address API not available yet (404), using user table data');
                    }
                } catch (error) {
                    console.log('Error fetching addresses, using user table data:', error);
                }
            }
        };

        fetchUserDetails();
        fetchOrders();
        fetchAddresses();
    }, [user]);

    const handleFieldChange = (field, value) => {
        setEditableFields(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateUserField = async (field, value) => {
        if (user && userDetails) {
            const token = localStorage.getItem('token');
            try {
                const updatedData = {
                    ...userDetails,
                    [field]: value
                };

                const response = await fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserDetails(data);
                    console.log(`${field} updated successfully`);
                } else {
                    console.error(`Failed to update ${field}`);
                    setEditableFields(prev => ({
                        ...prev,
                        [field]: userDetails[field] || ''
                    }));
                }
            } catch (error) {
                console.error(`Error updating ${field}:`, error);
                setEditableFields(prev => ({
                    ...prev,
                    [field]: userDetails[field] || ''
                }));
            }
        }
    };

    const handleBlur = (field) => {
        if (editableFields[field] !== (userDetails?.[field] || '')) {
            updateUserField(field, editableFields[field]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const handleAddressFormChange = (field, value) => {
        setAddressForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (user && userDetails) {
            const token = localStorage.getItem('token');
            try {
                // If editing an address from the users table (temporary ID), update the user record instead
                if (editingAddress && editingAddress.isFromUserTable) {
                    // Update the user's primary address fields directly
                    const updatedUserData = {
                        ...userDetails,
                        addressLine1: addressForm.addressLine1,
                        city: addressForm.city,
                        postalCode: addressForm.postalCode,
                        country: addressForm.country,
                    };

                    const userResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedUserData)
                    });

                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        setUserDetails(userData);
                        setEditableFields({
                            phone: userData.phone || '',
                            addressLine1: userData.addressLine1 || '',
                            city: userData.city || '',
                            postalCode: userData.postalCode || '',
                            country: userData.country || ''
                        });

                        // Update the addresses display
                        const updatedAddress = {
                            id: 'default-' + user.id,
                            addressLine1: userData.addressLine1 || '',
                            city: userData.city || '',
                            postalCode: userData.postalCode || '',
                            country: userData.country || '',
                            isDefault: true,
                            label: addressForm.label || 'Home',
                            isFromUserTable: true
                        };
                        setAddresses([updatedAddress]);

                        setShowAddressModal(false);
                        setAddressForm({
                            addressLine1: '',
                            city: '',
                            postalCode: '',
                            country: '',
                            label: 'Home',
                            isDefault: false
                        });
                        setEditingAddress(null);
                        console.log('Address updated successfully in users table');
                    } else {
                        console.error('Failed to update user address');
                    }
                } else {
                    // Use the Address API for addresses table (when backend is ready)
                    const url = editingAddress && !editingAddress.isFromUserTable
                        ? `http://localhost:8081/api/v1/users/${user.id}/addresses/${editingAddress.id}`
                        : `http://localhost:8081/api/v1/users/${user.id}/addresses`;

                    const response = await fetch(url, {
                        method: editingAddress ? 'PUT' : 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(addressForm)
                    });

                    if (response.ok) {
                        const addressesResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}/addresses`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (addressesResponse.ok) {
                            const updatedAddresses = await addressesResponse.json();
                            setAddresses(updatedAddresses);
                        }

                        if (addressForm.isDefault) {
                            const userResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            if (userResponse.ok) {
                                const userData = await userResponse.json();
                                setUserDetails(userData);
                                setEditableFields({
                                    phone: userData.phone || '',
                                    addressLine1: userData.addressLine1 || '',
                                    city: userData.city || '',
                                    postalCode: userData.postalCode || '',
                                    country: userData.country || ''
                                });
                            }
                        }

                        setShowAddressModal(false);
                        setAddressForm({
                            addressLine1: '',
                            city: '',
                            postalCode: '',
                            country: '',
                            label: 'Home',
                            isDefault: false
                        });
                        setEditingAddress(null);
                        console.log('Address saved successfully');
                    } else {
                        console.error('Failed to save address - API endpoint may not be available yet');
                        alert('Cannot save new addresses yet. The backend needs to be restarted with the new Address API. You can still edit the default address.');
                    }
                }
            } catch (error) {
                console.error('Error saving address:', error);
                alert('Failed to save address. Please try again.');
            }
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            addressLine1: address.addressLine1,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            label: address.label,
            isDefault: address.isDefault
        });
        setShowAddressModal(true);
    };

    const handleDeleteAddress = async (addressId) => {
        if (user) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:8081/api/v1/users/${user.id}/addresses/${addressId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    setAddresses(prev => prev.filter(address => address.id !== addressId));
                } else {
                    console.error('Failed to delete address');
                }
            } catch (error) {
                console.error('Error deleting address:', error);
            }
        }
    };

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
                                <input
                                    type="text"
                                    className="info-value editable-field"
                                    value={editableFields.phone}
                                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                                    onBlur={() => handleBlur('phone')}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="info-item">
                                <label className="info-label">Address</label>
                                <input
                                    type="text"
                                    className="info-value editable-field"
                                    value={editableFields.addressLine1}
                                    onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
                                    onBlur={() => handleBlur('addressLine1')}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter address"
                                />
                            </div>
                            <div className="info-item">
                                <label className="info-label">City</label>
                                <input
                                    type="text"
                                    className="info-value editable-field"
                                    value={editableFields.city}
                                    onChange={(e) => handleFieldChange('city', e.target.value)}
                                    onBlur={() => handleBlur('city')}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter city"
                                />
                            </div>
                            <div className="info-item">
                                <label className="info-label">Postal Code</label>
                                <input
                                    type="text"
                                    className="info-value editable-field"
                                    value={editableFields.postalCode}
                                    onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                                    onBlur={() => handleBlur('postalCode')}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter postal code"
                                />
                            </div>
                            <div className="info-item">
                                <label className="info-label">Country</label>
                                <input
                                    type="text"
                                    className="info-value editable-field"
                                    value={editableFields.country}
                                    onChange={(e) => handleFieldChange('country', e.target.value)}
                                    onBlur={() => handleBlur('country')}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter country"
                                />
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
                            <button className="edit-button" onClick={() => setShowAddressModal(true)}>
                                ➕ Add New
                            </button>
                        </div>
                        <div className="address-grid">
                            {addresses.length > 0 ? (
                                addresses.map(address => (
                                    <div className={`address-card ${address.isDefault ? 'default' : ''}`} key={address.id}>
                                        {address.isDefault && <span className="address-badge">Default</span>}
                                        <div className="address-details">
                                            {address.addressLine1}<br />
                                            {address.city}, {address.postalCode}<br />
                                            {address.country}
                                        </div>
                                        <div className="address-actions">
                                            <button className="address-action-btn" onClick={() => handleEditAddress(address)}>Edit</button>
                                            <button className="address-action-btn" onClick={() => handleDeleteAddress(address.id)}>Remove</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-addresses">
                                    No saved addresses. Add a new address.
                                </div>
                            )}
                            <div className="address-card add-address-card" onClick={() => setShowAddressModal(true)}>
                                <div className="add-icon">+</div>
                                <div className="add-text">Add New Address</div>
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

            {showAddressModal && (
                <div className="address-modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowAddressModal(false)}>&times;</span>
                        <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                        <form onSubmit={handleAddressSubmit}>
                            <div className="form-group">
                                <label>Address Line 1</label>
                                <input
                                    type="text"
                                    value={addressForm.addressLine1}
                                    onChange={(e) => handleAddressFormChange('addressLine1', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => handleAddressFormChange('city', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input
                                    type="text"
                                    value={addressForm.postalCode}
                                    onChange={(e) => handleAddressFormChange('postalCode', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    value={addressForm.country}
                                    onChange={(e) => handleAddressFormChange('country', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Label</label>
                                <input
                                    type="text"
                                    value={addressForm.label}
                                    onChange={(e) => handleAddressFormChange('label', e.target.value)}
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    checked={addressForm.isDefault}
                                    onChange={(e) => handleAddressFormChange('isDefault', e.target.checked)}
                                    id="defaultAddress"
                                />
                                <label htmlFor="defaultAddress">Set as default address</label>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowAddressModal(false)}>Cancel</button>
                                <button type="submit" className="save-button">
                                    {editingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
