import React, { useState, useEffect } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'CLIENT',
        phone: '',
        addressLine1: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/v1/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8081/api/v1/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setUsers(users.filter(user => user.id !== userId));
                } else {
                    alert('Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setNewUser({
            firstName: '', lastName: '', email: '', password: '',
            role: 'CLIENT', phone: '', addressLine1: '',
            city: '', postalCode: '', country: ''
        });
        setEditingUserId(null);
        setShowCreateModal(false);
        setShowPassword(false);
    };

    const handleEditClick = (user) => {
        const nameParts = user.fullName ? user.fullName.split(' ') : ['', ''];
        setNewUser({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email,
            password: '', // Don't fill password on edit
            role: user.role,
            phone: user.phone || '',
            addressLine1: user.addressLine1 || '',
            city: user.city || '',
            postalCode: user.postalCode || '',
            country: user.country || ''
        });
        setEditingUserId(user.id);
        setShowCreateModal(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const userData = {
                ...newUser,
                fullName: `${newUser.firstName} ${newUser.lastName}`.trim()
            };

            // If editing, don't send password if it's empty
            if (editingUserId && !userData.password) {
                delete userData.password;
            }
            
            const url = editingUserId 
                ? `http://localhost:8081/api/v1/users/${editingUserId}` 
                : 'http://localhost:8081/api/v1/users';
            
            const method = editingUserId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const savedUser = await response.json();
                if (editingUserId) {
                    setUsers(users.map(u => u.id === editingUserId ? savedUser : u));
                    alert('User updated successfully!');
                } else {
                    setUsers([...users, savedUser]);
                    alert('User created successfully!');
                }
                resetForm();
            } else {
                alert(`Failed to ${editingUserId ? 'update' : 'create'} user`);
            }
        } catch (error) {
            console.error(`Error ${editingUserId ? 'updating' : 'creating'} user:`, error);
            alert('An error occurred');
        }
    };

    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (user.fullName || '').toLowerCase().includes(term) || 
                              (user.email || '').toLowerCase().includes(term);
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="admin-section">
            <div className="section-header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Gestion Utilisateurs</h2>
                <div className="results-count">
                    Found <span>{filteredUsers.length}</span> user{filteredUsers.length !== 1 ? 's' : ''}
                </div>
            </div>
            
            <div className="filters-wrapper">
                <div className="search-input-group">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        className="admin-filter-input"
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-select-group">
                    <span className="filter-label">Role:</span>
                    <select 
                        className="admin-filter-select"
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">All Roles</option>
                        <option value="CLIENT">Client</option>
                        <option value="SELLER">Seller</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <div className="create-action-group">
                    <button className="create-user-btn" onClick={() => { setEditingUserId(null); setShowCreateModal(true); }}>
                        <span>+</span> Add User
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(user)}>Edit</button>
                                        <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">
                                    <div className="empty-state" style={{ 
                                        textAlign: 'center', 
                                        padding: '4rem 2rem',
                                        color: '#64748b'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No users found</h3>
                                        <p style={{ margin: 0 }}>Try adjusting your search or filters to find what you're looking for.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingUserId ? 'Edit User' : 'Add New User'}</h3>
                            <button className="modal-close" onClick={resetForm}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveUser}>
                            <div className="form-grid">
                                <div>
                                    <label className="form-label">First Name *</label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        className="admin-filter-input"
                                        required
                                        value={newUser.firstName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Last Name *</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        className="admin-filter-input"
                                        required
                                        value={newUser.lastName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Email Address *</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        className="admin-filter-input"
                                        required
                                        value={newUser.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Password {editingUserId && '(Leave blank to keep current)'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            name="password"
                                            className="admin-filter-input"
                                            required={!editingUserId}
                                            value={newUser.password}
                                            onChange={handleInputChange}
                                            style={{ paddingRight: '40px', width: '100%' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#64748b',
                                                padding: '5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Role *</label>
                                    <select 
                                        name="role"
                                        className="admin-filter-select"
                                        style={{ width: '100%', backgroundPosition: 'right 1rem center' }}
                                        value={newUser.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="CLIENT">Client</option>
                                        <option value="SELLER">Seller</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Phone</label>
                                    <input 
                                        type="text" 
                                        name="phone"
                                        className="admin-filter-input"
                                        value={newUser.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Country</label>
                                    <input 
                                        type="text" 
                                        name="country"
                                        className="admin-filter-input"
                                        value={newUser.country}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Address</label>
                                    <input 
                                        type="text" 
                                        name="addressLine1"
                                        className="admin-filter-input"
                                        value={newUser.addressLine1}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">City</label>
                                    <input 
                                        type="text" 
                                        name="city"
                                        className="admin-filter-input"
                                        value={newUser.city}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Postal Code</label>
                                    <input 
                                        type="text" 
                                        name="postalCode"
                                        className="admin-filter-input"
                                        value={newUser.postalCode}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="create-user-btn">
                                    {editingUserId ? 'Update User' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
