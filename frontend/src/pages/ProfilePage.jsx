import React, { useContext, useEffect, useState, useCallback } from 'react';
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

    const fetchAllData = useCallback(async () => {
        if (user) {
            const token = localStorage.getItem('token');
            try {
                // Fetch user details
                const userResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!userResponse.ok) throw new Error('Failed to fetch user details');
                const userData = await userResponse.json();
                setUserDetails(userData);
                setEditableFields({ phone: userData.phone || '' });

                // Create the default address object from user data
                const defaultAddress = {
                    id: `user-${user.id}`, // Unique ID for the main address
                    addressLine1: userData.addressLine1,
                    city: userData.city,
                    postalCode: userData.postalCode,
                    country: userData.country,
                    isDefault: true,
                    label: 'Primary',
                };

                // Fetch other addresses
                const addressesResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}/addresses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                let otherAddresses = [];
                if (addressesResponse.ok) {
                    otherAddresses = await addressesResponse.json();
                } else if (addressesResponse.status !== 404) {
                    console.error('Failed to fetch addresses');
                }

                // Filter out any address that might be a stray duplicate of the default
                otherAddresses = otherAddresses.filter(addr => 
                    !addr.isDefault && (
                    addr.addressLine1 !== defaultAddress.addressLine1 ||
                    addr.city !== defaultAddress.city ||
                    addr.postalCode !== defaultAddress.postalCode
                    )
                );

                // Combine and set addresses, ensuring default is first
                setAddresses([defaultAddress, ...otherAddresses]);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchAllData();

        const fetchOrders = async () => {
            if (user) {
                const token = localStorage.getItem('token');
                try {
                    const response = await fetch(`http://localhost:8081/api/v1/orders`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) setOrders(await response.json());
                    else console.error('Failed to fetch orders');
                } catch (error) {
                    console.error('Error fetching orders:', error);
                }
            }
        };
        fetchOrders();
    }, [user, fetchAllData]);

    const handleFieldChange = (field, value) => {
        setEditableFields(prev => ({ ...prev, [field]: value }));
    };

    const updateUserField = async (field, value) => {
        if (user && userDetails) {
            const token = localStorage.getItem('token');
            const updatedData = { ...userDetails, [field]: value };
            try {
                const response = await fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                if (response.ok) {
                    setUserDetails(await response.json());
                    console.log(`${field} updated successfully`);
                } else {
                    console.error(`Failed to update ${field}`);
                    setEditableFields(prev => ({ ...prev, [field]: userDetails[field] || '' }));
                }
            } catch (error) {
                console.error(`Error updating ${field}:`, error);
                setEditableFields(prev => ({ ...prev, [field]: userDetails[field] || '' }));
            }
        }
    };

    const handleBlur = (field) => {
        if (editableFields[field] !== (userDetails?.[field] || '')) {
            updateUserField(field, editableFields[field]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') e.target.blur();
    };

    const handleAddressFormChange = (field, value) => {
        setAddressForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        const token = localStorage.getItem('token');
        const isEditing = !!editingAddress;
        const isDefaultAddressEdit = isEditing && editingAddress.id === `user-${user.id}`;

        try {
            // Case 1: The user wants to make a different address the new default.
            if (addressForm.isDefault && !isDefaultAddressEdit) {
                await handleSetDefaultAddress(
                    isEditing ? { ...editingAddress, ...addressForm } : addressForm,
                    isEditing ? editingAddress.id : null
                );
            
            // Case 2: The user is editing the current default address.
            } else if (isDefaultAddressEdit) {
                const updatedUserData = {
                    ...userDetails,
                    addressLine1: addressForm.addressLine1,
                    city: addressForm.city,
                    postalCode: addressForm.postalCode,
                    country: addressForm.country,
                };
                const userUpdateUrl = `http://localhost:8081/api/v1/users/${user.id}`;
                const response = await fetch(userUpdateUrl, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUserData)
                });
                if (!response.ok) throw new Error('Failed to update default user address');

            // Case 3: Creating or updating a non-default address.
            } else {
                const method = isEditing ? 'PUT' : 'POST';
                let url = `http://localhost:8081/api/v1/users/${user.id}/addresses`;
                if (isEditing) {
                    url += `/${editingAddress.id}`;
                }

                const response = await fetch(url, {
                    method,
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...addressForm, isDefault: false }) // Ensure isDefault is false for this path
                });
                if (!response.ok) throw new Error('Failed to save address');
            }
            
            await fetchAllData();
            closeAddressModal();

        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address. Please try again.');
        }
    };

    const handleSetDefaultAddress = async (newDefaultAddressData, sourceAddressId) => {
        if (!user || !userDetails) return;
        const token = localStorage.getItem('token');

        // 1. Define the old default address from the current userDetails
        const oldDefaultAddress = {
            addressLine1: userDetails.addressLine1,
            city: userDetails.city,
            postalCode: userDetails.postalCode,
            country: userDetails.country,
            label: 'Old Primary', // Give it a sensible label
            isDefault: false,
        };

        try {
            // 2. Update the main user record with the new default address
            const updatedUserDetails = {
                ...userDetails,
                addressLine1: newDefaultAddressData.addressLine1,
                city: newDefaultAddressData.city,
                postalCode: newDefaultAddressData.postalCode,
                country: newDefaultAddressData.country,
            };
            const userUpdateResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUserDetails)
            });
            if (!userUpdateResponse.ok) throw new Error('Failed to update user with new default address');

            // 3. Add the old default address to the addresses list
            //    Only do this if the old address actually had data
            if (oldDefaultAddress.addressLine1) {
                const addOldAddressResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}/addresses`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(oldDefaultAddress)
                });
                if (!addOldAddressResponse.ok) {
                    // This is not ideal, but we should log it. The main update succeeded.
                    console.error('Could not save the old default address as a secondary address.');
                }
            }

            // 4. If the new default was an existing address, delete it from the secondary list
            if (sourceAddressId && sourceAddressId.startsWith('user-') === false) { // Ensure it's not the user id placeholder
                const deleteSourceAddressResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}/addresses/${sourceAddressId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!deleteSourceAddressResponse.ok) {
                    console.error('Could not remove the promoted address from the secondary list.');
                }
            }

        } catch (error) {
            console.error(error);
            alert('A multi-step operation to set the default address failed. Data might be inconsistent.');
            throw error; // Re-throw to prevent modal from closing
        }
    };
    
    const openAddressModal = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setAddressForm({
                addressLine1: address.addressLine1,
                city: address.city,
                postalCode: address.postalCode,
                country: address.country,
                label: address.label,
                isDefault: address.isDefault
            });
        } else {
            // Reset for "Add New"
            setEditingAddress(null);
            setAddressForm({
                addressLine1: '', city: '', postalCode: '', country: '',
                label: 'Home', isDefault: addresses.length === 0
            });
        }
        setShowAddressModal(true);
    };
    
    const closeAddressModal = () => {
        setShowAddressModal(false);
        setEditingAddress(null);
        setAddressForm({
            addressLine1: '', city: '', postalCode: '', country: '',
            label: 'Home', isDefault: false
        });
    };

    const handleDeleteAddress = async (addressId) => {
        if (addresses.length <= 1) {
            alert('You must have at least one address.');
            return;
        }

        const addressToDelete = addresses.find(addr => addr.id === addressId);
        if (addressToDelete?.isDefault) {
            alert('Cannot delete the default address. Please set another address as default first.');
            return;
        }

        if (user && window.confirm('Are you sure you want to delete this address?')) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:8081/api/v1/users/${user.id}/addresses/${addressId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    await fetchAllData();
                } else {
                    console.error('Failed to delete address');
                    alert('Failed to delete address.');
                }
            } catch (error) {
                console.error('Error deleting address:', error);
            }
        }
    };

    if (!user || !userDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header>
                <div className="header-content">
                    <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                    <h1 className="header-title">My Profile</h1>
                </div>
            </header>

            <div className="profile-container">
                <aside className="profile-sidebar">
                    <div className="profile-avatar"></div>
                    <h2 className="profile-name">{userDetails.fullName}</h2>
                    <p className="profile-email">{userDetails.email}</p>
                </aside>

                <main className="profile-content">
                    <section className="content-section">
                        <div className="section-header">
                            <h2 className="section-title">Personal Information</h2>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label className="info-label">Full Name</label>
                                <div className="info-value">{userDetails.fullName}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Email Address</label>
                                <div className="info-value">{userDetails.email}</div>
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
                                <label className="info-label">Role</label>
                                <div className="info-value">{userDetails.role}</div>
                            </div>
                        </div>
                    </section>

                    <section className="content-section">
                        <div className="section-header">
                            <h2 className="section-title">Saved Addresses</h2>
                            <button className="edit-button" onClick={() => openAddressModal()}>
                                ➕ Add New
                            </button>
                        </div>
                        <div className="address-grid">
                            {addresses.map(address => (
                                <div className={`address-card ${address.isDefault ? 'default' : ''}`} key={address.id}>
                                    {address.isDefault && <span className="address-badge">Default</span>}
                                    <div className="address-details">
                                        <strong>{address.label}</strong><br />
                                        {address.addressLine1}<br />
                                        {address.city}, {address.postalCode}<br />
                                        {address.country}
                                    </div>
                                    <div className="address-actions">
                                        <button className="address-action-btn" onClick={() => openAddressModal(address)}>Edit</button>
                                        {!address.isDefault && (
                                            <button className="address-action-btn" onClick={() => handleDeleteAddress(address.id)}>Remove</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="address-card add-address-card" onClick={() => openAddressModal()}>
                                <div className="add-icon">+</div>
                                <div className="add-text">Add New Address</div>
                            </div>
                        </div>
                    </section>
                    
                    <section className="content-section">
                        <div className="section-header">
                            <h2 className="section-title">Recent Orders</h2>
                            <button className="edit-button">View All</button>
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
                        <span className="close" onClick={closeAddressModal}>&times;</span>
                        <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                        <form onSubmit={handleAddressSubmit}>
                            <div className="form-group">
                                <label>Address Line 1</label>
                                <input type="text" value={addressForm.addressLine1} onChange={(e) => handleAddressFormChange('addressLine1', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" value={addressForm.city} onChange={(e) => handleAddressFormChange('city', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input type="text" value={addressForm.postalCode} onChange={(e) => handleAddressFormChange('postalCode', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input type="text" value={addressForm.country} onChange={(e) => handleAddressFormChange('country', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Label</label>
                                <input type="text" value={addressForm.label} onChange={(e) => handleAddressFormChange('label', e.target.value)} />
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="defaultAddress"
                                    checked={addressForm.isDefault}
                                    onChange={(e) => handleAddressFormChange('isDefault', e.target.checked)}
                                    // Can't uncheck if it's the only address OR if editing the current default address
                                    disabled={editingAddress?.isDefault || addresses.length === 0}
                                />
                                <label htmlFor="defaultAddress">
                                    Set as default address
                                    {(editingAddress?.isDefault || addresses.length === 0) && ' (Cannot uncheck the current default)'}
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={closeAddressModal}>Cancel</button>
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
