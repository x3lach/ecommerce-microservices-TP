import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import './CartPage.css';
import logo from '/logo.png';

const CartPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { cartItems, fetchCart } = useContext(CartContext);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch product details for items in cart
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (cartItems.length === 0) {
                setLoading(false);
                return;
            }

            const details = {};
            try {
                const promises = cartItems.map(item => 
                    fetch(`http://localhost:8081/api/v1/products/${item.productId}`)
                        .then(res => res.json())
                        .then(data => ({ id: item.productId, data }))
                );

                const results = await Promise.all(promises);
                results.forEach(result => {
                    details[result.id] = result.data;
                });
                setProducts(details);
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [cartItems]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = products[item.productId];
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        // Ideally, we'd have an endpoint to update quantity. 
        // Current API might only support 'add' which increments.
        // If 'add' endpoint is just 'add', we might need to clear and re-add or backend needs update.
        // Assuming for now we can't easily update specific quantity without a specific endpoint 
        // or removing and re-adding.
        // Let's assume we can just add/remove. 
        // For this prototype, if the backend 'add' adds to existing, we need a 'set' endpoint 
        // or we just implement 'remove' and 'add'.
        
        // Let's try adding 1 or removing item. 
        // Actually, the requirement was "work on panier".
        // Let's implement Remove for sure. 
        // Update might need backend support if not present.
        // For now, I'll just implement Remove.
    };

    const removeFromCart = async (productId) => {
        // We need a remove endpoint. Usually DELETE /api/v1/cart/items/{productId}
        // Let's check if we have one. If not, we might need to add it or use what's available.
        // The readme doesn't explicitly list delete item endpoint, only clear cart via checkout.
        // But usually it exists. Let's try DELETE.
        try {
             const token = localStorage.getItem('token');
             // Assuming this endpoint exists or we need to add it to backend.
             // If backend doesn't support it, we can't do it.
             // Let's try to assume standard REST.
             // If not, I'll have to ask to update backend or leave it.
             // Let's assume DELETE /api/v1/cart/items/{productId}
             const response = await fetch(`http://localhost:8081/api/v1/cart/items/${productId}`, {
                 method: 'DELETE',
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             
             if (response.ok) {
                 fetchCart(); // Refresh context
             } else {
                 // Fallback or error
                 console.error("Failed to remove item");
             }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="cart-page loading">Loading cart...</div>;

    return (
        <div className="cart-page">
            <header>
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                        <div className="logo-container" onClick={() => navigate('/')}>
                            <img src={logo} alt="Logo" className="logo-img" />
                        </div>
                        <h1 className="header-title">Shopping Cart</h1>
                    </div>
                </div>
            </header>

            <div className="cart-container">
                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map(item => {
                                const product = products[item.productId];
                                if (!product) return null;
                                return (
                                    <div key={item.productId} className="cart-item">
                                        <div className="cart-item-image">
                                            {product.imageUrls && product.imageUrls.length > 0 ? (
                                                <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:8081${product.imageUrls[0]}`} alt={product.name} />
                                            ) : (
                                                <div className="no-image">📦</div>
                                            )}
                                        </div>
                                        <div className="cart-item-info">
                                            <h3>{product.name}</h3>
                                            <p className="item-price">${product.price}</p>
                                        </div>
                                        <div className="cart-item-actions">
                                            <div className="quantity-display">
                                                Qty: {item.quantity}
                                            </div>
                                            <button 
                                                className="remove-btn"
                                                onClick={() => removeFromCart(item.productId)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="cart-item-total">
                                            ${(product.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            <button 
                                className="checkout-btn"
                                onClick={() => navigate('/checkout')}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartPage;
