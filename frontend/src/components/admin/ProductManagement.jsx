import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: '',
        brandId: '',
        condition: 'New'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes, brandsRes] = await Promise.all([
                    fetch('http://localhost:8081/api/v1/products'),
                    fetch('http://localhost:8081/api/v1/categories'),
                    fetch('http://localhost:8081/api/v1/brands')
                ]);

                if (productsRes.ok) setProducts(await productsRes.json());
                if (categoriesRes.ok) setCategories(await categoriesRes.json());
                if (brandsRes.ok) setBrands(await brandsRes.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            stockQuantity: '',
            categoryId: '',
            brandId: '',
            condition: 'New'
        });
        setImageFiles([]);
        setEditingProduct(null);
        setShowModal(false);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        // Find category ID by name if needed, or if product has categoryId use it. 
        // ProductResponse usually has categoryName. We need to map it back to ID for the select if ID isn't present.
        // Assuming we might need to find the ID from the name if the DTO only sends name.
        // Checking ProductResponse DTO from previous turn: it has categoryName.
        const cat = categories.find(c => c.name === product.categoryName);
        const brand = brands.find(b => b.name === product.brandName);

        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stockQuantity: product.stockQuantity,
            categoryId: cat ? cat.id : '',
            brandId: brand ? brand.id : '',
            condition: product.condition || 'New'
        });
        setShowModal(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingProduct 
                ? `http://localhost:8081/api/v1/products/${editingProduct.id}`
                : 'http://localhost:8081/api/v1/products';
            const method = editingProduct ? 'PUT' : 'POST';

            // Basic validation
            if (!productForm.categoryId) {
                alert("Please select a category");
                return;
            }

            const payload = {
                ...productForm,
                sku: editingProduct ? editingProduct.sku : `SKU-${Date.now()}`, // Simple SKU generation
                isActive: true
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                let savedProduct = await response.json();

                // Upload images if any
                if (imageFiles.length > 0) {
                    const formData = new FormData();
                    Array.from(imageFiles).forEach(file => {
                        formData.append('files', file);
                    });

                    const imageUploadResponse = await fetch(`http://localhost:8081/api/v1/products/${savedProduct.id}/images`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (imageUploadResponse.ok) {
                        savedProduct = await imageUploadResponse.json();
                    } else {
                        console.error("Failed to upload images");
                        alert("Product saved, but failed to upload images.");
                    }
                }

                if (editingProduct) {
                    setProducts(products.map(p => p.id === editingProduct.id ? savedProduct : p));
                    alert('Product updated successfully!');
                } else {
                    setProducts([...products, savedProduct]);
                    alert('Product created successfully!');
                }
                resetForm();
            } else {
                alert('Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8081/api/v1/products/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setProducts(products.filter(p => p.id !== productId));
                } else {
                    alert('Failed to delete product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Match Category by Name (since product only has categoryName)
        let matchesCategory = true;
        if (selectedCategory) {
            const catObj = categories.find(c => c.id === selectedCategory);
            if (catObj) {
                matchesCategory = product.categoryName === catObj.name;
            }
        }
        
        // Match Brand by Name
        let matchesBrand = true;
        if (selectedBrand) {
            const brandObj = brands.find(b => b.id === selectedBrand);
            if (brandObj) {
                matchesBrand = product.brandName === brandObj.name;
            }
        }
        
        const price = parseFloat(product.price);
        const matchesMinPrice = minPrice ? price >= parseFloat(minPrice) : true;
        const matchesMaxPrice = maxPrice ? price <= parseFloat(maxPrice) : true;

        return matchesName && matchesCategory && matchesBrand && matchesMinPrice && matchesMaxPrice;
    });

    // Helper to render categories recursively for filter dropdown (flattened for now or reuse renderCategories)
    // We can reuse renderCategories but maybe we want a flat list for simple filtering or reuse the hierarchy with indentation
    const renderFilterCategories = (parentId = null, level = 0) => {
        const items = categories.filter(category => category.parentId === parentId);
        if (items.length === 0) return null;
        return items.map(category => (
            <React.Fragment key={category.id}>
                <option value={category.id}>
                    {'\u00A0'.repeat(level * 4)}{category.name}
                </option>
                {renderFilterCategories(category.id, level + 1)}
            </React.Fragment>
        ));
    };

    // Helper to render categories recursively for form dropdown
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

    if (loading) return <div>Loading products...</div>;

    return (
        <div className="admin-section">
            <div className="section-header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Gestion Produits</h2>
                <div className="results-count">
                    Found <span>{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="filters-wrapper" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div className="search-input-group" style={{ minWidth: '250px' }}>
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        className="admin-filter-input"
                        placeholder="Search product..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-select-group">
                    <select 
                        className="admin-filter-select"
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        <option value="">All Categories</option>
                        {renderFilterCategories()}
                    </select>
                </div>

                <div className="filter-select-group">
                    <select 
                        className="admin-filter-select"
                        value={selectedBrand} 
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        <option value="">All Brands</option>
                        {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                        type="number" 
                        min="0"
                        className="admin-filter-input"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || parseFloat(val) >= 0) {
                                setMinPrice(val);
                            }
                        }}
                        style={{ width: '100px', paddingLeft: '1rem' }}
                    />
                    <span style={{ color: '#94a3b8' }}>-</span>
                    <input 
                        type="number" 
                        min="0"
                        className="admin-filter-input"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || parseFloat(val) >= 0) {
                                setMaxPrice(val);
                            }
                        }}
                        style={{ width: '100px', paddingLeft: '1rem' }}
                    />
                </div>

                <div className="create-action-group" style={{ marginLeft: 'auto' }}>
                    <button className="create-user-btn" onClick={() => setShowModal(true)}>
                        <span>+</span> Add Product
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        {product.imageUrls && product.imageUrls.length > 0 ? (
                                            <img 
                                                src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:8081${product.imageUrls[0]}`} 
                                                alt={product.name} 
                                                className="product-thumb"
                                            />
                                        ) : (
                                            <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                                        )}
                                    </td>
                                    <td>{product.name}</td>
                                    <td><span className="role-badge client">{product.categoryName}</span></td>
                                    <td>${product.price}</td>
                                    <td>{product.stockQuantity}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(product)}>Edit</button>
                                        <button className="action-btn delete" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-state" style={{ 
                                        textAlign: 'center', 
                                        padding: '4rem 2rem',
                                        color: '#64748b'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No products found</h3>
                                        <p style={{ margin: 0 }}>Try adjusting your search.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button className="modal-close" onClick={resetForm}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveProduct}>
                            <div className="form-grid">
                                <div className="full-width">
                                    <label className="form-label">Product Name *</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        className="admin-filter-input"
                                        required
                                        value={productForm.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Description</label>
                                    <textarea 
                                        name="description"
                                        className="admin-filter-input"
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                        value={productForm.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Price *</label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        className="admin-filter-input"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={productForm.price}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Stock Quantity *</label>
                                    <input 
                                        type="number" 
                                        name="stockQuantity"
                                        className="admin-filter-input"
                                        required
                                        min="0"
                                        value={productForm.stockQuantity}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Category *</label>
                                    <select 
                                        name="categoryId"
                                        className="admin-filter-select"
                                        style={{ width: '100%', backgroundPosition: 'right 1rem center' }}
                                        required
                                        value={productForm.categoryId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Category</option>
                                        {renderCategories()}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Brand</label>
                                    <select 
                                        name="brandId"
                                        className="admin-filter-select"
                                        style={{ width: '100%', backgroundPosition: 'right 1rem center' }}
                                        value={productForm.brandId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Condition</label>
                                    <select 
                                        name="condition"
                                        className="admin-filter-select"
                                        style={{ width: '100%', backgroundPosition: 'right 1rem center' }}
                                        value={productForm.condition}
                                        onChange={handleInputChange}
                                    >
                                        <option value="New">New</option>
                                        <option value="Like New">Like New</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                    </select>
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Product Images</label>
                                    <input 
                                        type="file" 
                                        multiple
                                        className="admin-filter-input"
                                        accept="image/*"
                                        onChange={(e) => setImageFiles(e.target.files)}
                                    />
                                    <small style={{ color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
                                        {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Select one or more images'}
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="create-user-btn">
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
