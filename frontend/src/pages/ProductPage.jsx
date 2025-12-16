import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductPage.css';
import logo from '/logo.png';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToCart, cartCount } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [profileDropdownActive, setProfileDropdownActive] = useState(false);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8081/api/v1/products/${id}`);
                if (!response.ok) {
                    throw new Error('Product not found');
                }
                const data = await response.json();
                setProduct(data);

                // Fetch seller info if sellerId exists
                if (data.sellerId) {
                    try {
                        const sellerResponse = await fetch(`http://localhost:8081/api/v1/users/${data.sellerId}`);
                        if (sellerResponse.ok) {
                            const sellerData = await sellerResponse.json();
                            setSeller(sellerData);
                        }
                    } catch (err) {
                        console.error('Error fetching seller:', err);
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Fetch user details if logged in
    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => response.json())
                .then(data => setUserDetails(data))
                .catch(error => console.error('Error fetching user details:', error));
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const closeDropdown = (event) => {
            const profileWrapper = document.querySelector('.profile-wrapper');
            if (profileWrapper && !profileWrapper.contains(event.target)) {
                setProfileDropdownActive(false);
            }
        };

        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    const toggleProfile = () => {
        setProfileDropdownActive(!profileDropdownActive);
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const increaseQuantity = () => {
        if (quantity < (product?.stockQuantity || 10)) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const success = await addToCart(product.id, quantity);
        if (success) {
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3500);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8081${url}`;
    };

    if (loading) {
        return (
            <div className="product-page">
                <div className="loading-container">
                    <p>Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-page">
                <div className="error-container">
                    <h2>😕 Product Not Found</h2>
                    <p>{error || 'The product you are looking for does not exist.'}</p>
                    <button onClick={() => navigate('/')}>← Back to Home</button>
                </div>
            </div>
        );
    }

    const images = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : [];

    return (
        <div className="product-page">
            {/* HEADER */}
            <header>
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                        <div className="logo-container" onClick={() => navigate('/')}>
                            <img src={logo} alt="SouqUp Logo" className="logo-img logo-img-large" />
                            <img src="/SouqUp.png" alt="SouqUp" className="logo-img" />
                        </div>
                    </div>
                    <div className="header-icons">
                        <button className="icon-btn" onClick={() => navigate('/cart')}>
                            🛒
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>
                        {user && userDetails ? (
                            <div className="profile-wrapper">
                                <div className="profile-avatar-header" onClick={toggleProfile} title="Profile options">
                                    {userDetails.profileImageUrl ? (
                                        <img src={userDetails.profileImageUrl} alt="Profile" />
                                    ) : (
                                        getInitials(userDetails.fullName)
                                    )}
                                </div>
                                <div className={`profile-dropdown ${profileDropdownActive ? 'active' : ''}`}>
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
                            </div>
                        ) : (
                            <button className="icon-btn" onClick={() => navigate('/login')}>👤</button>
                        )}
                    </div>
                </div>
            </header>

            {/* BREADCRUMB */}
            <div className="breadcrumb">
                <a onClick={() => navigate('/')}>Home</a> ›
                {product.categoryName && (
                    <>
                        <a onClick={() => navigate(`/?category=${product.categoryName}`)}>{product.categoryName}</a> ›
                    </>
                )}
                <span>{product.name}</span>
            </div>

            {/* MAIN CONTENT */}
            <div className="product-container">
                {/* LEFT: IMAGE GALLERY */}
                <div className="image-gallery">
                    <br/>
                    <div className="main-image-container">
                        {images.length > 0 ? (
                            <img src={getImageUrl(images[selectedImage])} alt={product.name} />
                        ) : (
                            <span className="no-image">📦</span>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="image-thumbnails">
                            {images.slice(0, 5).map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={getImageUrl(img)} alt={`${product.name} ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: PRODUCT INFO & PURCHASE */}
                <div className="product-info">
                    {/* PRODUCT DETAILS */}
                    <div className="info-card">
                        <div className="product-header">
                            {product.categoryName && (
                                <div className="product-category">
                                    {product.categoryName}
                                    {product.brandName && ` • ${product.brandName}`}
                                </div>
                            )}
                            <h1 className="product-title">{product.name}</h1>
                            <div className="product-rating">
                                <span className="rating-text">5.0 out of 5</span>
                            </div>
                        </div>

                        <div className="price-section">
                            <div className="current-price">${product.price?.toFixed(2)}</div>
                        </div>

                        <div className="stock-info">
                            {product.stockQuantity > 0 ? (
                                <div className="stock-badge">✓ In Stock ({product.stockQuantity} available)</div>
                            ) : (
                                <div className="stock-badge out-of-stock">✕ Out of Stock</div>
                            )}
                            <div className="shipping-info">🚚 Free shipping • Arrives in 2-3 days</div>
                        </div>

                        {product.description && (
                            <p className="product-description">{product.description}</p>
                        )}
                    </div>

                    {/* SPECIFICATIONS */}
                    <div className="info-card">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Product Details</h2>
                        <div className="specs-grid">
                            {product.brandName && (
                                <div className="spec-item">
                                    <span className="spec-label">Brand</span>
                                    <span className="spec-value">{product.brandName}</span>
                                </div>
                            )}
                            {product.categoryName && (
                                <div className="spec-item">
                                    <span className="spec-label">Category</span>
                                    <span className="spec-value">{product.categoryName}</span>
                                </div>
                            )}
                            <div className="spec-item">
                                <span className="spec-label">SKU</span>
                                <span className="spec-value">{product.sku}</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Availability</span>
                                <span className="spec-value">{product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                            </div>
                        </div>
                    </div>

                    {/* PURCHASE SECTION */}
                    <div className="purchase-section">
                        <div className="quantity-selector">
                            <label className="quantity-label">Quantity</label>
                            <div className="quantity-controls">
                                <button
                                    className="quantity-btn"
                                    onClick={decreaseQuantity}
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    className="quantity-input"
                                    value={quantity}
                                    readOnly
                                />
                                <button
                                    className="quantity-btn"
                                    onClick={increaseQuantity}
                                    disabled={quantity >= product.stockQuantity}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            className="product-page-add-btn"
                            onClick={handleAddToCart}
                            disabled={product.stockQuantity <= 0}
                        >
                            🛒 Add to Cart
                        </button>

                        <button
                            className="buy-now-btn"
                            onClick={() => {
                                if (!user) {
                                    navigate('/login');
                                    return;
                                }
                                navigate('/checkout', {
                                    state: {
                                        product: product,
                                        quantity: quantity
                                    }
                                });
                            }}
                            disabled={product.stockQuantity <= 0}
                        >
                            ⚡ Buy Now
                        </button>

                        {seller && (
                            <div className="seller-card">
                                <div className="seller-avatar">
                                    {seller.profileImageUrl ? (
                                        <img src={seller.profileImageUrl} alt={seller.fullName} />
                                    ) : (
                                        getInitials(seller.fullName)
                                    )}
                                </div>
                                <div className="seller-info-text">
                                    <div className="seller-name">{seller.fullName}</div>
                                    <div className="seller-rating">⭐ Verified Seller</div>
                                </div>
                                <button className="contact-btn">💬 Chat</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* NOTIFICATION */}
            <div className={`notification ${showNotification ? 'show' : ''}`}>
                <span style={{ fontSize: '1.75rem' }}>✓</span>
                <div>
                    <div style={{ fontSize: '1.1rem' }}>Added to cart!</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        {product.name} (Qty: {quantity})
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;

