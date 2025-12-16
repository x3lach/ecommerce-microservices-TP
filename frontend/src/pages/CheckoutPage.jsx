import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CheckoutPage.css';
import logo from '/logo.png';
import AuthContext from '../context/AuthContext';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);

    // Get product and quantity from navigation state (for Buy Now)
    const { product, quantity: initialQuantity } = location.state || {};

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    // Data states
    const [userDetails, setUserDetails] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [productDetails, setProductDetails] = useState({});

    // Fetch user data and addresses
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                // Fetch user details
                const userResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserDetails(userData);

                    // Create default address from user data
                    const defaultAddress = {
                        id: 'default',
                        label: 'Primary Address',
                        fullName: userData.fullName,
                        addressLine1: userData.addressLine1,
                        city: userData.city,
                        postalCode: userData.postalCode,
                        country: userData.country,
                        phone: userData.phone || '',
                        isDefault: true
                    };

                    // Check if primary address is valid (has minimum required fields)
                    const hasValidPrimaryAddress = userData.addressLine1 && userData.city && userData.country;

                    // Fetch other addresses
                    const addressesResponse = await fetch(`http://localhost:8081/api/v1/users/${user.id}/addresses`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    let otherAddresses = [];
                    if (addressesResponse.ok) {
                        otherAddresses = await addressesResponse.json();
                    }

                    // Filter valid addresses from others
                    const validOtherAddresses = otherAddresses.filter(a => a.addressLine1 && a.city && a.country);
                    
                    const allAddresses = [];
                    if (hasValidPrimaryAddress) allAddresses.push(defaultAddress);
                    allAddresses.push(...validOtherAddresses.filter(a => !a.isDefault));

                    if (allAddresses.length === 0) {
                        alert("You must provide a valid delivery address before placing an order. Please update your profile.");
                        navigate('/profile');
                        return;
                    }

                    setAddresses(allAddresses);
                    setSelectedAddress(allAddresses[0]);
                }

                // If coming from Buy Now, use the product directly
                if (product) {
                    const cartItem = {
                        productId: product.id,
                        quantity: initialQuantity || 1,
                        unitPrice: product.price,
                        productName: product.name
                    };
                    setCartItems([cartItem]);
                    setProductDetails({ [product.id]: product });

                    // Set default shipping if available
                    if (product.shippingOptions && product.shippingOptions.length > 0) {
                        setSelectedShipping(product.shippingOptions[0]);
                    }
                } else {
                    // Fetch cart items
                    const cartResponse = await fetch('http://localhost:8081/api/v1/cart', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (cartResponse.ok) {
                        const cartData = await cartResponse.json();
                        setCartItems(cartData.items || []);

                        // Fetch product details for each cart item
                        const details = {};
                        for (const item of (cartData.items || [])) {
                            const productResponse = await fetch(`http://localhost:8081/api/v1/products/${item.productId}`);
                            if (productResponse.ok) {
                                details[item.productId] = await productResponse.json();
                            }
                        }
                        setProductDetails(details);

                        // Set default shipping from first product
                        const firstProduct = Object.values(details)[0];
                        if (firstProduct?.shippingOptions?.length > 0) {
                            setSelectedShipping(firstProduct.shippingOptions[0]);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, product, initialQuantity]);

    // Get all available shipping options from products
    const getShippingOptions = () => {
        const options = new Map();
        Object.values(productDetails).forEach(product => {
            if (product.shippingOptions) {
                product.shippingOptions.forEach(opt => {
                    if (!options.has(opt.name)) {
                        options.set(opt.name, opt);
                    }
                });
            }
        });

        // If no shipping options, provide defaults
        if (options.size === 0) {
            return [
                { name: 'Standard Shipping', price: 0 },
                { name: 'Express Shipping', price: 9.99 }
            ];
        }

        return Array.from(options.values());
    };

    // Calculate totals
    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => {
            return sum + (item.unitPrice * item.quantity);
        }, 0);
    };

    const calculateShipping = () => {
        return selectedShipping?.price || 0;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateShipping();
    };

    // Get image URL
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8081${url}`;
    };

    // Handle step navigation
    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle order confirmation
    const handleConfirmOrder = async () => {
        if (!selectedAddress || !selectedShipping) {
            alert('Please select an address and shipping method');
            return;
        }

        // Validate address completeness
        if (!selectedAddress.addressLine1 || !selectedAddress.city || !selectedAddress.country || !selectedAddress.postalCode) {
            alert('The selected address is incomplete. Please select a valid address or update your profile.');
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            // If Buy Now, first add to cart
            if (product) {
                await fetch('http://localhost:8081/api/v1/cart/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId: product.id,
                        quantity: initialQuantity || 1
                    })
                });
            }

            // Create order with address and shipping
            const orderRequest = {
                shippingAddress: {
                    fullName: selectedAddress.fullName || userDetails?.fullName,
                    addressLine1: selectedAddress.addressLine1,
                    city: selectedAddress.city,
                    postalCode: selectedAddress.postalCode,
                    country: selectedAddress.country,
                    phone: selectedAddress.phone || userDetails?.phone || ''
                },
                shippingMethod: selectedShipping.name,
                shippingPrice: selectedShipping.price
            };

            const response = await fetch('http://localhost:8081/api/v1/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderRequest)
            });

            if (response.ok) {
                const order = await response.json();
                setOrderNumber(order.orderNumber);
                setOrderComplete(true);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Error creating order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="checkout-page">
                <div className="loading-container">
                    <p>Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="checkout-page">
                <header>
                    <div className="header-content">
                        <div className="header-left">
                            <div className="logo-container" onClick={() => navigate('/')}>
                                <img src={logo} alt="Logo" className="logo-img" />
                            </div>
                        </div>
                    </div>
                </header>
                <div className="checkout-container">
                    <div className="step-content success-container">
                        <div className="success-icon">✓</div>
                        <h2>Order Placed Successfully!</h2>
                        <p>Thank you for your order. Your order has been received and is being processed.</p>
                        <p className="order-number">Order #{orderNumber}</p>
                        <p>Status: <strong>PENDING</strong></p>
                        <p style={{ fontSize: '0.9rem', color: '#6B5B50', marginTop: '1rem' }}>
                            You will be able to confirm receipt once the seller ships your order.
                        </p>
                        <div className="success-buttons">
                            <button className="btn-secondary" onClick={() => navigate('/profile')}>
                                View Orders
                            </button>
                            <button className="btn-primary" onClick={() => navigate('/')}>
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {/* HEADER */}
            <header>
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                        <div className="logo-container" onClick={() => navigate('/')}>
                            <img src={logo} alt="Logo" className="logo-img" />
                        </div>
                        <h1 className="header-title">Checkout</h1>
                    </div>
                </div>
            </header>

            {/* STEPS INDICATOR */}
            <div className="checkout-container">
                <div>
                    <div className="steps-indicator">
                        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                            <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
                            <span className="step-label">Address</span>
                        </div>
                        <div className={`step-connector ${currentStep > 1 ? 'completed' : ''}`}></div>
                        <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                            <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
                            <span className="step-label">Shipping</span>
                        </div>
                        <div className={`step-connector ${currentStep > 2 ? 'completed' : ''}`}></div>
                        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <span className="step-label">Confirm</span>
                        </div>
                    </div>

                    {/* STEP 1: ADDRESS SELECTION */}
                    {currentStep === 1 && (
                        <div className="step-content">
                            <h2>📍 Select Delivery Address</h2>
                            <div className="address-list">
                                {addresses.map((address, index) => (
                                    <div
                                        key={address.id || index}
                                        className={`address-option ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedAddress(address)}
                                    >
                                        {address.isDefault && <span className="address-badge">Default</span>}
                                        <span className="radio-circle"></span>
                                        <div className="address-details">
                                            <div className="address-label">{address.label || 'Address'}</div>
                                            <div className="address-text">
                                                {address.fullName || userDetails?.fullName}<br />
                                                {address.addressLine1}<br />
                                                {address.city}, {address.postalCode}<br />
                                                {address.country}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="checkout-buttons">
                                <button className="btn-back" onClick={() => navigate(-1)}>Cancel</button>
                                <button
                                    className="btn-next"
                                    onClick={nextStep}
                                    disabled={!selectedAddress}
                                >
                                    Continue to Shipping →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SHIPPING SELECTION */}
                    {currentStep === 2 && (
                        <div className="step-content">
                            <h2>🚚 Select Shipping Method</h2>
                            <div className="shipping-options">
                                {getShippingOptions().map((option, index) => (
                                    <div
                                        key={index}
                                        className={`shipping-option ${selectedShipping?.name === option.name ? 'selected' : ''}`}
                                        onClick={() => setSelectedShipping(option)}
                                    >
                                        <div className="shipping-left">
                                            <span className="radio-circle"></span>
                                            <div className="shipping-info">
                                                <h4>{option.name}</h4>
                                                <p>
                                                    {option.name === 'Express Shipping'
                                                        ? 'Delivery in 2-3 business days'
                                                        : option.name === 'Local Pickup'
                                                        ? 'Pick up from seller'
                                                        : 'Delivery in 5-7 business days'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`shipping-price ${option.price === 0 ? 'free' : ''}`}>
                                            {option.price === 0 ? 'FREE' : `$${option.price.toFixed(2)}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="checkout-buttons">
                                <button className="btn-back" onClick={prevStep}>← Back</button>
                                <button
                                    className="btn-next"
                                    onClick={nextStep}
                                    disabled={!selectedShipping}
                                >
                                    Review Order →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONFIRMATION */}
                    {currentStep === 3 && (
                        <div className="step-content">
                            <h2>✅ Review & Confirm Order</h2>

                            <div className="confirmation-section">
                                <h3>📍 Delivery Address</h3>
                                <div className="confirmation-card">
                                    <p>
                                        <span className="highlight">{selectedAddress?.fullName || userDetails?.fullName}</span><br />
                                        {selectedAddress?.addressLine1}<br />
                                        {selectedAddress?.city}, {selectedAddress?.postalCode}<br />
                                        {selectedAddress?.country}
                                    </p>
                                </div>
                            </div>

                            <div className="confirmation-section">
                                <h3>🚚 Shipping Method</h3>
                                <div className="confirmation-card">
                                    <p>
                                        <span className="highlight">{selectedShipping?.name}</span><br />
                                        {selectedShipping?.price === 0 ? 'Free Shipping' : `$${selectedShipping?.price.toFixed(2)}`}
                                    </p>
                                </div>
                            </div>

                            <div className="confirmation-section">
                                <h3>📦 Order Items</h3>
                                <div className="confirmation-card">
                                    {cartItems.map((item, index) => {
                                        const product = productDetails[item.productId];
                                        return (
                                            <p key={index} style={{ marginBottom: index < cartItems.length - 1 ? '0.5rem' : 0 }}>
                                                <span className="highlight">{item.productName || product?.name}</span> × {item.quantity}<br />
                                                ${(item.unitPrice * item.quantity).toFixed(2)}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="checkout-buttons">
                                <button className="btn-back" onClick={prevStep}>← Back</button>
                                <button
                                    className="btn-confirm"
                                    onClick={handleConfirmOrder}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Processing...' : '🛒 Place Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ORDER SUMMARY SIDEBAR */}
                <div className="order-summary">
                    <h3>Order Summary</h3>

                    {cartItems.map((item, index) => {
                        const product = productDetails[item.productId];
                        const imageUrl = product?.imageUrls?.[0];
                        return (
                            <div className="summary-item" key={index}>
                                <div className="summary-item-image">
                                    {imageUrl ? (
                                        <img src={getImageUrl(imageUrl)} alt={item.productName} />
                                    ) : (
                                        <span className="no-image">📦</span>
                                    )}
                                </div>
                                <div className="summary-item-details">
                                    <h4>{item.productName || product?.name}</h4>
                                    <span className="quantity">Qty: {item.quantity}</span>
                                </div>
                                <div className="summary-item-price">
                                    ${(item.unitPrice * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        );
                    })}

                    <div className="summary-totals">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span className="amount">${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

