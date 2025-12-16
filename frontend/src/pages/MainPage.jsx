import React, { useState, useEffect, useContext } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '/logo.png';

const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const MainPage = () => {
    const [sidebarHidden, setSidebarHidden] = useState(false);
    const [profileDropdownActive, setProfileDropdownActive] = useState(false);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Filter States
    const [filterName, setFilterName] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [userDetails, setUserDetails] = useState(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes, brandsRes] = await Promise.all([
                    fetch('http://localhost:8081/api/v1/products'),
                    fetch('http://localhost:8081/api/v1/categories'),
                    fetch('http://localhost:8081/api/v1/brands')
                ]);

                if (productsRes.ok) {
                    const data = await productsRes.json();
                    setProducts(data);
                    setFilteredProducts(data);
                }
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

    // Filter Logic
    useEffect(() => {
        let result = products;

        // Name Filter
        if (filterName) {
            result = result.filter(p => p.name.toLowerCase().includes(filterName.toLowerCase()));
        }

        // Price Filter
        if (minPrice) {
            result = result.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            result = result.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Category Filter
        if (selectedCategories.length > 0) {
            // Check against categoryName (since product has categoryName flattened in DTO) or fetch full structure if needed.
            // Assuming product.categoryName is available as per DTO.
            result = result.filter(p => selectedCategories.includes(p.categoryName));
        }

        // Brand Filter
        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.brandName));
        }

        setFilteredProducts(result);
    }, [products, filterName, minPrice, maxPrice, selectedCategories, selectedBrands]);

    const handleCategoryChange = (categoryName) => {
        setSelectedCategories(prev => 
            prev.includes(categoryName) 
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleBrandChange = (brandName) => {
        setSelectedBrands(prev => 
            prev.includes(brandName) 
                ? prev.filter(b => b !== brandName)
                : [...prev, brandName]
        );
    };

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            fetch(`http://localhost:8081/api/v1/users/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => response.json())
            .then(data => setUserDetails(data))
            .catch(error => console.error('Failed to fetch user details', error));
        }
    }, [user]);


    const toggleSidebar = () => {
        setSidebarHidden(!sidebarHidden);
    };

    const toggleProfile = () => {
        setProfileDropdownActive(!profileDropdownActive);
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            alert('Logging out...');
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    useEffect(() => {
        const closeDropdown = (event) => {
            const profileWrapper = document.querySelector('.profile-wrapper');
            if (profileWrapper && !profileWrapper.contains(event.target)) {
                setProfileDropdownActive(false);
            }
        };

        document.addEventListener('click', closeDropdown);

        return () => {
            document.removeEventListener('click', closeDropdown);
        };
    }, []);

    return (
        <>
            <header>
                <div className="header-left">
                    <button className="menu-toggle" onClick={toggleSidebar}>☰</button>
                    <div className="logo-container" onClick={() => navigate('/')}>
                        <img src={logo} alt="SouqUp Logo" className="logo-img logo-img-large" />
                        <img src="/SouqUp.png" alt="SouqUp" className="logo-img" />
                    </div>
                </div>

                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        className="search-bar" 
                        placeholder="Search products..." 
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                </div>

                <div className="header-actions">
                    <button className="icon-button">
                        🛒
                        <span className="cart-badge">3</span>
                    </button>
                    <div className="profile-wrapper">
                        {userDetails && (
                            <div className="profile-avatar-header" onClick={toggleProfile} title="Profile options">
                                {userDetails.profileImageUrl ? (
                                    <img src={userDetails.profileImageUrl} alt="Profile" />
                                ) : (
                                    getInitials(userDetails.fullName)
                                )}
                            </div>
                        )}
                        <div className={`profile-dropdown ${profileDropdownActive ? 'active' : ''}`} id="profileDropdown">
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
                </div>
            </header>

            <div className="main-container">
                <aside className={`sidebar ${sidebarHidden ? 'hidden' : ''}`} id="sidebar">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Filters</h2>
                        <p className="sidebar-subtitle">Refine your search</p>
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Search by Name</label>
                        <input 
                            type="text" 
                            className="filter-input" 
                            placeholder="Product name..." 
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Price Range</label>
                        <div className="price-range">
                            <div className="price-input-wrapper">
                                <input 
                                    type="number" 
                                    className="filter-input price-input" 
                                    placeholder="Min" 
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                            </div>
                            <div className="price-input-wrapper">
                                <input 
                                    type="number" 
                                    className="filter-input price-input" 
                                    placeholder="Max" 
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Categories</label>
                        <div className="category-list">
                            {categories.map(category => (
                                <label key={category.id} className="category-item">
                                    <input 
                                        type="checkbox" 
                                        className="category-checkbox" 
                                        checked={selectedCategories.includes(category.name)}
                                        onChange={() => handleCategoryChange(category.name)}
                                    />
                                    <span className="category-label">{category.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Brands</label>
                        <div className="category-list">
                            {brands.map(brand => (
                                <label key={brand.id} className="category-item">
                                    <input 
                                        type="checkbox" 
                                        className="category-checkbox" 
                                        checked={selectedBrands.includes(brand.name)}
                                        onChange={() => handleBrandChange(brand.name)}
                                    />
                                    <span className="category-label">{brand.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Button removed as filtering is instant/reactive, or can remain to reset */}
                    <button 
                        className="apply-filters-btn"
                        onClick={() => {
                            setFilterName('');
                            setMinPrice('');
                            setMaxPrice('');
                            setSelectedCategories([]);
                            setSelectedBrands([]);
                        }}
                    >
                        Reset Filters
                    </button>
                </aside>

                <main className={`content ${sidebarHidden ? 'expanded' : ''}`} id="content">
                    <div className="content-header">
                        <h1 className="content-title">Discover Products</h1>
                        <p className="results-info">
                            {loading ? 'Loading...' : `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <div className="products-grid">
                        {loading ? (
                            <p>Loading products...</p>
                        ) : filteredProducts.length === 0 ? (
                            <p>No products found</p>
                        ) : (
                            filteredProducts.map(product => (
                                <article className="product-card" key={product.id} onClick={() => navigate(`/product/${product.id}`)}>
                                    <div className="product-image">
                                        {product.imageUrls && product.imageUrls.length > 0 ? (
                                            <img
                                                src={`http://localhost:8081${product.imageUrls[0]}`}
                                                alt={product.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="no-image-placeholder" style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#f0f0f0',
                                                fontSize: '3rem'
                                            }}>
                                                📦
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <p className="product-category">{product.categoryName || 'Uncategorized'}</p>
                                        <h3 className="product-title">{product.name}</h3>
                                        <div className="product-footer">
                                            <span className="product-price">${product.price}</span>
                                            <div className="product-icon">🏷️</div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default MainPage;
