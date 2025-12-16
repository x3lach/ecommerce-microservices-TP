import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const { user } = useContext(AuthContext);

    const fetchCart = async () => {
        if (!user) {
            setCartCount(0);
            setCartItems([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/v1/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setCartItems(data.items || []);
                // Calculate total quantity
                const count = (data.items || []).reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(count);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (productId, quantity = 1) => {
        if (!user) {
            alert("Please login to add items to cart");
            return false;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/v1/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId, quantity })
            });

            if (response.ok) {
                await fetchCart(); // Refresh cart data
                return true;
            } else {
                const error = await response.json();
                alert(error.message || "Failed to add to cart");
                return false;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            return false;
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, cartItems, fetchCart, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
