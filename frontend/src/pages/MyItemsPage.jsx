import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Header from '../components/Header';
import './MyItemsPage.css';

const MyItemsPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedCondition, setSelectedCondition] = useState('New');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]); // State for existing images in edit mode
    const [weight, setWeight] = useState('');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [selectedShipping, setSelectedShipping] = useState(['Standard Shipping']);
    const [expressShippingPrice, setExpressShippingPrice] = useState('');
    const [standardShippingPrice, setStandardShippingPrice] = useState('0');

    // Tab state
    const [activeTab, setActiveTab] = useState('addItem');
    const [myProducts, setMyProducts] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetching data
    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/v1/categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) setCategories(await response.json());
                else console.error('Failed to fetch categories');
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchBrands = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/v1/brands', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) setBrands(await response.json());
                else console.error('Failed to fetch brands');
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };

        fetchCategories();
        fetchBrands();
    }, []);

    // Fetch user products when tab changes
    useEffect(() => {
        if (activeTab === 'modifierItem' && user) {
            fetchMyProducts();
        }
    }, [activeTab, user]);

    const fetchMyProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8081/api/v1/products/seller/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMyProducts(data);
            }
        } catch (error) {
            console.error('Error fetching my products:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8081/api/v1/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setMyProducts(prev => prev.filter(p => p.id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleEdit = (product) => {
        setEditingProductId(product.id);
        setTitle(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setQuantity(product.stockQuantity);
        setSelectedCondition(product.condition || 'New'); // Map condition
        setSelectedCategory(categories.find(c => c.name === product.categoryName)?.id || '');
        // Note: Mapping brand name back to ID might be tricky if we only have name in response.
        // Assuming we can find it by name or need ID in response.
        // ProductResponse has brandName. We need ID.
        // Quick fix: find brand by name
        const foundBrand = brands.find(b => b.name === product.brandName);
        setSelectedBrand(foundBrand ? foundBrand.id : '');
        
        // Shipping mapping (simplified)
        if (product.shippingOptions) {
            const shippingNames = product.shippingOptions.map(s => s.name);
            setSelectedShipping(shippingNames);
            
            const std = product.shippingOptions.find(s => s.name === 'Standard Shipping');
            if (std) setStandardShippingPrice(std.price.toString());
            
            const exp = product.shippingOptions.find(s => s.name === 'Express Shipping');
            if (exp) setExpressShippingPrice(exp.price.toString());
        }

        // Set existing images
        if (product.imageUrls && product.imageUrls.length > 0) {
            const formattedImages = product.imageUrls.map(url => 
                url.startsWith('http') ? url : `http://localhost:8081${url}`
            );
            setExistingImages(formattedImages);
        } else {
            setExistingImages([]);
        }

        setImages([]); // Clear new file uploads
        // setActiveTab('addItem'); // Removed to stay in "Modifier my Item" tab
    };

    // Handlers
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 8) {
            alert("You can only upload a maximum of 8 images.");
            return;
        }
        setImages(prevImages => [...prevImages, ...files]);
    };

    const removeImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // Drag and drop handlers for reordering images
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newImages = [...images];
        const draggedImage = newImages[draggedIndex];
        newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, draggedImage);
        setImages(newImages);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSubmit = async () => {
        if (!title || !description || !price || !selectedCategory || (images.length === 0 && existingImages.length === 0)) {
            alert("Please fill out all required fields and upload at least one image.");
            return;
        }

        const token = localStorage.getItem('token');

        // Auto-generate SKU from title
        const generatedSku = `SKU-${title.replace(/\s+/g, '-').toUpperCase()}`;

        const shippingOptions = selectedShipping.map(name => {
            let priceValue;
            if (name === 'Standard Shipping') {
                priceValue = standardShippingPrice;
            } else if (name === 'Express Shipping') {
                priceValue = expressShippingPrice;
            } else { // Local Pickup
                priceValue = 0;
            }
            const finalPrice = parseFloat(priceValue);
            return { name, price: isNaN(finalPrice) ? 0 : finalPrice };
        });

        const productRequest = {
            name: title,
            description,
            price: parseFloat(price),
            stockQuantity: parseInt(quantity, 10),
            sku: generatedSku,
            categoryId: selectedCategory,
            brandId: selectedBrand || null,
            isActive: true,
            condition: selectedCondition,
            weight: parseFloat(weight) || null,
            packageLength: parseFloat(length) || null,
            packageWidth: parseFloat(width) || null,
            packageHeight: parseFloat(height) || null,
            shippingOptions: shippingOptions,
        };

        console.log("Product Request:", productRequest);

        try {
            const url = editingProductId 
                ? `http://localhost:8081/api/v1/products/${editingProductId}`
                : 'http://localhost:8081/api/v1/products';
            
            const method = editingProductId ? 'PUT' : 'POST';

            const productResponse = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productRequest)
            });

            if (!productResponse.ok) {
                const errorData = await productResponse.json();
                throw new Error(errorData.message || 'Failed to save product');
            }

            const savedProduct = await productResponse.json();
            const productId = savedProduct.id;

            // Only upload images if there are new ones
            if (images.length > 0) {
                const formData = new FormData();
                images.forEach(image => {
                    formData.append('files', image);
                });

                const imageResponse = await fetch(`http://localhost:8081/api/v1/products/${productId}/images`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!imageResponse.ok) {
                    throw new Error('Failed to upload images');
                }
            }

            alert(editingProductId ? 'Product updated successfully!' : 'Product listed successfully!');
            
            if (editingProductId) {
                // If editing, go back to list
                setEditingProductId(null);
                setActiveTab('modifierItem');
                fetchMyProducts(); // Refresh list
                // Reset form
                setTitle('');
                setDescription('');
                setPrice('');
                setQuantity(1);
                setImages([]);
                setExistingImages([]);
            } else {
                navigate(`/`);
            }
        } catch (error) {
            console.error("Failed to save item:", error);
            alert(`Error: ${error.message}`);
        }
    };
    
    // UI Helpers
    const renderCategories = (parentId = null, level = 0) => {
        const items = categories.filter(category => category.parentId === parentId);
        if (items.length === 0) return null;
        return items.map(category => (
            <React.Fragment key={category.id}>
                <option value={category.id}>
                    {'\u00A0'.repeat(level * 4)}{category.name}
                </option>
                {renderCategories(category.id, level + 1)}
            </React.Fragment>
        ));
    };

    const conditionOptions = ['New', 'Like New', 'Good', 'Fair', 'Poor', 'For Parts'];
    const conditionIcons = ['✨', '👌', '👍', '👎', '🔧', '📦'];

    const shippingOptions = [
        { id: 'standard', name: 'Standard Shipping', desc: 'Delivery in 5-7 business days', price: 'Free' },
        { id: 'express', name: 'Express Shipping', desc: 'Delivery in 2-3 business days', price: '$9.99' },
        { id: 'local', name: 'Local Pickup', desc: 'Buyer picks up the item', price: 'Free' }
    ];

    return (
        <div style={{ backgroundColor: '#FFFBF5', minHeight: '100vh' }}>
            <Header 
                onSearchChange={setSearchTerm} 
                initialSearchValue={searchTerm}
                showSearch={activeTab === 'modifierItem' && !editingProductId}
            />

            {/* TABS */}
            <div className="tabs-container">
                <button
                    onClick={() => {
                        setActiveTab('addItem');
                        setEditingProductId(null); // Clear edit mode
                        setTitle('');
                        setDescription('');
                        setPrice('');
                        setQuantity(1);
                        setImages([]);
                        setExistingImages([]);
                    }}
                    className={`tab-button ${activeTab === 'addItem' ? 'active' : ''}`}
                >
                    Add Item
                </button>
                <button
                    onClick={() => setActiveTab('modifierItem')}
                    className={`tab-button ${activeTab === 'modifierItem' ? 'active' : ''}`}
                >
                    Modifier my Item
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'modifierItem' && !editingProductId ? (
                <div className="my-products-list">
                    {myProducts.length === 0 ? (
                        <div className="done-message">You haven't listed any items yet.</div>
                    ) : (
                        (() => {
                            const filteredProducts = myProducts.filter(p => 
                                p.name.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            
                            if (filteredProducts.length === 0) {
                                return <div className="done-message">No products match your search.</div>;
                            }

                            return filteredProducts.map(product => (
                                <div key={product.id} className="my-product-card">
                                    <div className="my-product-image">
                                        {product.imageUrls && product.imageUrls.length > 0 ? (
                                            <img 
                                                src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:8081${product.imageUrls[0]}`} 
                                                alt={product.name} 
                                            />
                                        ) : (
                                            <div className="no-image-placeholder">📦</div>
                                        )}
                                    </div>
                                    <div className="my-product-info">
                                        <h3>{product.name}</h3>
                                        <p className="price">${product.price}</p>
                                        <p className="condition">{product.condition || 'New'}</p>
                                    </div>
                                    <div className="my-product-actions">
                                        <button className="edit-btn" onClick={() => handleEdit(product)}>Modifier</button>
                                        <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                                    </div>
                                </div>
                            ));
                        })()
                    )}
                </div>
            ) : (
                /* MAIN CONTAINER */
                <div className="sell-container">
                    {/* FORM SECTION */}
                    <div>
                        {/* PHOTOS SECTION */}
                    <section className="form-section" style={{ marginBottom: '2rem' }}>
                        <h2 className="section-title">📸 Photos</h2>
                        <p className="section-description">
                            Upload up to 8 high-quality photos. The first photo will be your main listing image.
                        </p>

                        <input
                            id="imageUpload"
                            type="file"
                            multiple
                            accept="image/png, image/jpeg"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />

                        {images.length === 0 && existingImages.length === 0 ? (
                            /* Empty state - Large upload area */
                            <label htmlFor="imageUpload" className="photo-upload-empty">
                                <div className="upload-empty-content">
                                    <div className="upload-camera-icon">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                    <h3 className="upload-empty-title">Add Your Product Photos</h3>
                                    <p className="upload-empty-text">Click to browse or drag and drop images here</p>
                                    <div className="upload-empty-specs">
                                        <span className="spec-badge">PNG or JPG</span>
                                        <span className="spec-badge">Up to 10MB each</span>
                                        <span className="spec-badge">Max 8 photos</span>
                                    </div>
                                </div>
                            </label>
                        ) : (
                            /* Photos added state */
                            <div className="photo-upload-grid">
                                {/* Main photo display - Logic: Prefer first existing image, then first new image */}
                                <div className="main-photo-container">
                                    <div className="main-photo-wrapper">
                                        <img
                                            src={existingImages.length > 0 ? existingImages[0] : URL.createObjectURL(images[0])}
                                            alt="Main product"
                                            className="main-photo-img"
                                        />
                                        <div className="main-photo-badge">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                            </svg>
                                            <span>Main Photo</span>
                                        </div>
                                        <button
                                            className="main-photo-remove"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (existingImages.length > 0) removeExistingImage(0);
                                                else removeImage(0);
                                            }}
                                            type="button"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="main-photo-tip">
                                        💡 This will be shown on the main page
                                    </p>
                                </div>

                                {/* Additional photos grid */}
                                <div className="additional-photos">
                                    <div className="additional-photos-header">
                                        <h4 className="additional-photos-title">Additional Photos ({existingImages.length + images.length - 1}/7)</h4>
                                        {existingImages.length + images.length < 8 && (
                                            <label htmlFor="imageUpload" className="add-more-btn">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>
                                                Add More
                                            </label>
                                        )}
                                    </div>

                                    <div className="photos-thumbnail-grid">
                                        {/* Render remaining Existing Images */}
                                        {existingImages.slice(1).map((imgUrl, index) => (
                                            <div key={`existing-${index}`} className="photo-thumbnail">
                                                <img src={imgUrl} alt={`Product existing ${index + 2}`} className="photo-thumbnail-img" />
                                                <div className="photo-thumbnail-number">{index + 2}</div>
                                                <button
                                                    className="photo-thumbnail-remove"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        removeExistingImage(index + 1);
                                                    }}
                                                    type="button"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}

                                        {/* Render remaining New Images */}
                                        {/* If existingImages has items, render all new images. If existingImages is empty, skip the first new image (main) */}
                                        {(existingImages.length > 0 ? images : images.slice(1)).map((image, index) => (
                                            <div key={`new-${index}`} className="photo-thumbnail">
                                                <img src={URL.createObjectURL(image)} alt={`Product new ${index}`} className="photo-thumbnail-img" />
                                                <div className="photo-thumbnail-number">
                                                    {existingImages.length > 0 ? existingImages.length + index + 1 : index + 2}
                                                </div>
                                                <button
                                                    className="photo-thumbnail-remove"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (existingImages.length > 0) removeImage(index);
                                                        else removeImage(index + 1);
                                                    }}
                                                    type="button"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add more placeholder */}
                                        {existingImages.length + images.length < 8 && (
                                            <label htmlFor="imageUpload" className="photo-thumbnail photo-thumbnail-add">
                                                <div className="photo-add-icon">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                    </svg>
                                                </div>
                                                <span className="photo-add-text">Add Photo</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* BASIC INFO SECTION */}
                    <section className="form-section" style={{ marginBottom: '2rem' }}>
                        <h2 className="section-title">📝 Basic Information</h2>
                        <p className="section-description">Tell us about your item</p>

                        <div className="form-group">
                            <label className="form-label">Title<span className="required">*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., iPhone 13 Pro Max 256GB"
                                maxLength="80"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div className="char-count">{title.length} / 80</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category<span className="required">*</span></label>
                            <select
                                className="form-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Select a category</option>
                                {renderCategories()}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Brand</label>
                            <select
                                className="form-select"
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                            >
                                <option value="">Select a brand (optional)</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description<span className="required">*</span></label>
                            <textarea
                                className="form-textarea"
                                placeholder="Describe your item in detail. Include condition, features, and any defects..."
                                maxLength="1000"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                            <div className="char-count">{description.length} / 1000</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Condition<span className="required">*</span></label>
                            <div className="condition-grid">
                                {conditionOptions.map((condition, index) => (
                                    <div
                                        key={condition}
                                        className={`condition-option ${selectedCondition === condition ? 'selected' : ''}`}
                                        onClick={() => setSelectedCondition(condition)}
                                    >
                                        <div className="condition-icon">{conditionIcons[index]}</div>
                                        <div className="condition-label">{condition}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* PRICING SECTION */}
                    <section className="form-section" style={{ marginBottom: '2rem' }}>
                        <h2 className="section-title">💰 Pricing</h2>
                        <p className="section-description">Set your price and shipping options</p>

                        <div className="form-group">
                            <label className="form-label">Price<span className="required">*</span></label>
                            <div className="price-input-wrapper">
                                <input
                                    type="number"
                                    className="form-input price-input"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Quantity<span className="required">*</span></label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="1"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                    </section>

                    {/* SHIPPING SECTION */}
                    <section className="form-section" style={{ marginBottom: '2rem' }}>
                        <h2 className="section-title">🚚 Shipping</h2>
                        <p className="section-description">Choose shipping options (you can select multiple)</p>

                        {/* Standard Shipping with custom price input */}
                        <div
                            className={`shipping-option ${selectedShipping.includes('Standard Shipping') ? 'selected' : ''}`}
                        >
                            <div
                                className="shipping-checkbox"
                                onClick={() => {
                                    if (selectedShipping.includes('Standard Shipping')) {
                                        setSelectedShipping(selectedShipping.filter(name => name !== 'Standard Shipping'));
                                        setStandardShippingPrice('0');
                                    } else {
                                        setSelectedShipping([...selectedShipping, 'Standard Shipping']);
                                    }
                                }}
                            >
                                {selectedShipping.includes('Standard Shipping') && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                            <div className="shipping-info" onClick={() => {
                                if (!selectedShipping.includes('Standard Shipping')) {
                                    setSelectedShipping([...selectedShipping, 'Standard Shipping']);
                                }
                            }}>
                                <div className="shipping-title">Standard Shipping</div>
                                <div className="shipping-desc">Delivery in 5-7 business days</div>
                            </div>
                            {selectedShipping.includes('Standard Shipping') ? (
                                <div className="shipping-price-input-wrapper" onClick={(e) => e.stopPropagation()}>
                                    {standardShippingPrice === '0' || standardShippingPrice === '' ? (
                                        <div
                                            className="shipping-price-display free-shipping"
                                            onClick={() => setStandardShippingPrice('1')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Free
                                        </div>
                                    ) : (
                                        <input
                                            type="number"
                                            className="shipping-price-input"
                                            placeholder="1"
                                            step="1"
                                            min="1"
                                            value={standardShippingPrice}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value >= 1 || e.target.value === '') {
                                                    setStandardShippingPrice(e.target.value);
                                                }
                                            }}
                                            onBlur={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (isNaN(value) || value < 1) {
                                                    setStandardShippingPrice('0');
                                                }
                                            }}
                                            onKeyPress={(e) => {
                                                // Prevent decimal point and comma
                                                if (e.key === '.' || e.key === ',') {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    )}
                                    {standardShippingPrice !== '0' && standardShippingPrice !== '' && (
                                        <span className="dollar-sign">$</span>
                                    )}
                                    {standardShippingPrice !== '0' && standardShippingPrice !== '' && (
                                        <button
                                            className="set-free-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStandardShippingPrice('0');
                                            }}
                                            type="button"
                                        >
                                            Set Free
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="shipping-price">Custom Price</div>
                            )}
                        </div>

                        {/* Express Shipping with custom price input */}
                        <div
                            className={`shipping-option ${selectedShipping.includes('Express Shipping') ? 'selected' : ''}`}
                        >
                            <div
                                className="shipping-checkbox"
                                onClick={() => {
                                    if (selectedShipping.includes('Express Shipping')) {
                                        setSelectedShipping(selectedShipping.filter(name => name !== 'Express Shipping'));
                                        setExpressShippingPrice('');
                                    } else {
                                        setSelectedShipping([...selectedShipping, 'Express Shipping']);
                                    }
                                }}
                            >
                                {selectedShipping.includes('Express Shipping') && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                            <div className="shipping-info" onClick={() => {
                                if (!selectedShipping.includes('Express Shipping')) {
                                    setSelectedShipping([...selectedShipping, 'Express Shipping']);
                                }
                            }}>
                                <div className="shipping-title">Express Shipping</div>
                                <div className="shipping-desc">Delivery in 2-3 business days</div>
                            </div>
                            {selectedShipping.includes('Express Shipping') ? (
                                <div className="shipping-price-input-wrapper" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="number"
                                        className="shipping-price-input"
                                        placeholder="1"
                                        step="1"
                                        min="1"
                                        value={expressShippingPrice}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (value >= 1 || e.target.value === '') {
                                                setExpressShippingPrice(e.target.value);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (value < 1 && e.target.value !== '') {
                                                setExpressShippingPrice('1');
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            // Prevent decimal point and comma
                                            if (e.key === '.' || e.key === ',') {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <span className="dollar-sign">$</span>
                                </div>
                            ) : (
                                <div className="shipping-price">Custom Price</div>
                            )}
                        </div>

                        {/* Local Pickup */}
                        <div
                            className={`shipping-option ${selectedShipping.includes('Local Pickup') ? 'selected' : ''}`}
                            onClick={() => {
                                if (selectedShipping.includes('Local Pickup')) {
                                    setSelectedShipping(selectedShipping.filter(name => name !== 'Local Pickup'));
                                } else {
                                    setSelectedShipping([...selectedShipping, 'Local Pickup']);
                                }
                            }}
                        >
                            <div className="shipping-checkbox">
                                {selectedShipping.includes('Local Pickup') && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                            <div className="shipping-info">
                                <div className="shipping-title">Local Pickup</div>
                                <div className="shipping-desc">Buyer picks up the item</div>
                            </div>
                            <div className="shipping-price">Free</div>
                        </div>





                    </section>

                    {/* SUBMIT SECTION */}
                    <section className="submit-section">
                        <p className="terms-text">
                            By listing this item, you agree to our <a href="#">Seller Terms</a> and <a href="#">Fees Policy</a>
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {editingProductId && (
                                <button 
                                    className="submit-button" 
                                    style={{ background: '#e0e0e0', color: '#333' }}
                                    onClick={() => {
                                        setEditingProductId(null);
                                        setTitle('');
                                        setDescription('');
                                        setPrice('');
                                        setQuantity(1);
                                        setImages([]);
                                        setExistingImages([]);
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button className="submit-button" onClick={handleSubmit}>
                                {editingProductId ? '💾 Update Item' : '🚀 List Item'}
                            </button>
                        </div>
                    </section>
                </div>

                {/* PREVIEW SIDEBAR */}
                <aside className="preview-sidebar">
                    <div className="preview-card">
                        <h3 className="preview-title">Preview</h3>
                        <div className="preview-image">
                            {existingImages.length > 0 ? (
                                <img
                                    src={existingImages[0]}
                                    alt="preview"
                                    style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px'}}
                                />
                            ) : images.length > 0 ? (
                                <img
                                    src={URL.createObjectURL(images[0])}
                                    alt="preview"
                                    style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px'}}
                                />
                            ) : '📦'}
                        </div>
                        <h4 className="preview-product-title">{title || 'Your Item Title'}</h4>
                        <p className="preview-category">
                            {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Category'}
                        </p>
                        <div className="preview-price">${price || '0.00'}</div>
                        <p className="preview-description">
                            {description || 'Your description will appear here. Add details about your item to help buyers make a decision.'}
                        </p>
                        <span className="preview-condition">Condition: {selectedCondition}</span>
                    </div>

                    <div className="tips-card">
                        <div className="tips-title">💡 Listing Tips</div>
                        <ul className="tips-list">
                            <li>Use clear, well-lit photos from multiple angles</li>
                            <li>Write detailed, honest descriptions</li>
                            <li>Research similar items for competitive pricing</li>
                            <li>Mention any defects or wear clearly</li>
                            <li>Respond to buyer questions quickly</li>
                            <li>Ship items promptly after purchase</li>
                        </ul>
                    </div>
                </aside>
            </div>
            )}
        </div>
    );
};

export default MyItemsPage;
