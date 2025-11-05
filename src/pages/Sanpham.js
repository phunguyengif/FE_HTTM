import React, { useState, useEffect } from 'react';
import ProductList from '../components/DanhSachSanPham';

const Sanpham = () => {
    const [productCount, setProductCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State cho các bộ lọc
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [minPriceInput, setMinPriceInput] = useState('');
    const [maxPriceInput, setMaxPriceInput] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);

    // State mới cho Danh mục được tải từ API
    const [apiCategories, setApiCategories] = useState([]); 
    const [categoryLoading, setCategoryLoading] = useState(true); // State loading mới cho danh mục

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const pageSize = 10;

    // Dữ liệu mẫu CỐ ĐỊNH 
    const colors = [
        { name: 'Đen', value: 'Black' },
        { name: 'Trắng', value: 'White' },
        { name: 'Đỏ', value: 'Red' },
        { name: 'Xanh dương', value: 'Blue' },
    ];
    const genders = [
        { name: 'Nam', value: 'Nam' },
        { name: 'Nữ', value: 'Nữ' },
        { name: 'Unisex', value: 'Unisex' },
    ];

    // --- Hàm Fetch Categories ---
    const fetchCategories = async () => {
        setCategoryLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/categories');
            if (!response.ok) {
                throw new Error('Không thể tải danh mục');
            }
            const data = await response.json();
            setApiCategories(data);
        } catch (err) {
            console.error('Lỗi tải danh mục:', err);
            // Có thể hiển thị lỗi nhỏ nếu cần, nhưng không chặn trang chính
        } finally {
            setCategoryLoading(false);
        }
    };

    // --- Gọi API Categories khi component mount ---
    useEffect(() => {
        fetchCategories();
    }, []); 

    // --- Hàm Fetch Products (Giữ nguyên) ---
    const fetchProducts = async (pageNumber, category = null, color = null, gender = null, minP = null, maxP = null, reset = false) => {
        setLoading(true);
        setError(null);
        // ... (Logic fetch Products giữ nguyên) ...
        try {
            const categoryFilter = category ? `&categoryId=${category}` : '';
            const colorFilter = color ? `&color=${color}` : '';
            const genderFilter = gender ? `&genderTarget=${gender}` : '';

            const priceFilter =
                `${minP !== null && minP !== '' ? `&minPrice=${minP}` : ''}` +
                `${maxP !== null && maxP !== '' ? `&maxPrice=${maxP}` : ''}`;

            const response = await fetch(
                `http://localhost:8080/api/products/filter?page=${pageNumber}&size=${pageSize}${categoryFilter}${priceFilter}${colorFilter}${genderFilter}`
            );

            if (!response.ok) {
                throw new Error('Lỗi khi gọi API');
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setProducts((prevProducts) =>
                    reset ? data : [...prevProducts, ...data]
                );
                setHasMore(data.length === pageSize);
                setProductCount(data.length);
            } else {
                throw new Error('Dữ liệu không hợp lệ');
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // --- useEffect: Kích hoạt lại API khi bộ lọc thay đổi (Giữ nguyên) ---
    useEffect(() => {
        fetchProducts(
            0,
            selectedCategory,
            selectedColor,
            selectedGender,
            minPriceInput,
            maxPriceInput,
            true
        );
    }, [selectedCategory, selectedColor, selectedGender, minPriceInput, maxPriceInput]);

    // --- Các Hàm Xử lý Thay đổi Bộ lọc (Giữ nguyên) ---
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setPage(0);
    };

    const handleMinPriceChange = (event) => {
        setMinPriceInput(event.target.value);
        setPage(0);
    };

    const handleMaxPriceChange = (event) => {
        setMaxPriceInput(event.target.value);
        setPage(0);
    };

    const handleColorChange = (colorValue) => {
        setSelectedColor(colorValue);
        setPage(0);
    };

    const handleGenderChange = (genderValue) => {
        setSelectedGender(genderValue);
        setPage(0);
    };

    const handleShowAllProducts = () => {
        setSelectedCategory(null);
        setMinPriceInput('');
        setMaxPriceInput('');
        setSelectedColor(null);
        setSelectedGender(null);
        setPage(0);
    };

    const loadMoreProducts = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(
            nextPage,
            selectedCategory,
            selectedColor,
            selectedGender,
            minPriceInput,
            maxPriceInput
        );
    };

    if (error) {
        return <p>Có lỗi xảy ra khi lấy dữ liệu: {error.message}</p>;
    }

    // Kiểm tra xem có bộ lọc nào đang được chọn không
    const isFilterApplied = selectedCategory !== null || minPriceInput !== '' || maxPriceInput !== '' || selectedColor !== null || selectedGender !== null;

    // --- Giao diện (JSX) Cập Nhật ---
    return (
        <div className="containerr product-page-layout">

            <aside className="filter-sidebar">
                <h3 className="sidebar-headings mb-3">Bộ lọc tìm kiếm</h3>

                {/* Lọc theo Danh mục --- */}
                <p className="sidebar-heading">Danh mục</p>
                <div className="category-list mb-4">
                    {categoryLoading ? (
                        <p>Đang tải danh mục...</p>
                    ) : (
                        apiCategories.map((category) => ( 
                            <button
                                key={category.id}
                                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(category.id)}
                            >
                                {category.name}
                            </button>
                        ))
                    )}
                </div>

                <hr className="divider" />

                {/* Lọc theo Khoảng giá --- */}
                <p className="sidebar-heading">Lọc theo giá (VNĐ)</p>
                <div className="price-input-filter mb-4">
                    <input
                        type="number"
                        placeholder="Tối thiểu"
                        value={minPriceInput}
                        onChange={handleMinPriceChange}
                        className="form-control price-input"
                        min="0"
                    />
                    <div className="price-divider">~</div>
                    <input
                        type="number"
                        placeholder="Tối đa"
                        value={maxPriceInput}
                        onChange={handleMaxPriceChange}
                        className="form-control price-input"
                        min="0"
                    />
                </div>

                <hr className="divider" />

                {/* Lọc theo Giới tính --- */}
                <p className="sidebar-heading">Giới tính</p>
                <div className="gender-filter mb-4">
                    {genders.map((gender) => (
                        <button
                            key={gender.value}
                            className={`filter-btn ${selectedGender === gender.value ? 'active' : ''}`}
                            onClick={() => handleGenderChange(gender.value)}
                        >
                            {gender.name}
                        </button>
                    ))}
                </div>

                <hr className="divider" />

                {/* Lọc theo Màu sắc --- */}
                <p className="sidebar-heading">Màu sắc</p>
                <div className="color-filter d-flex flex-wrap gap-2 mb-4">
                    {colors.map((color) => (
                        <button
                            key={color.value}
                            className={`color-swatch ${selectedColor === color.value ? 'selected' : ''}`}
                            style={{ backgroundColor: color.value, borderColor: color.value }}
                            title={color.name}
                            onClick={() => handleColorChange(color.value)}
                        >
                            {selectedColor === color.value && <span className="check-mark">✓</span>}
                        </button>
                    ))}
                    {selectedColor && (
                        <button className="btn btn-sm btn-link" onClick={() => handleColorChange(null)}>
                            (Bỏ chọn)
                        </button>
                    )}
                </div>
                {/*  Nút Reset (Đặt ở vị trí dễ thấy) --- */}
                {isFilterApplied && (
                    <button
                        className="btn btn-secondary mb-3 w-100"
                        onClick={handleShowAllProducts}
                    >
                        Bỏ Tất Cả Bộ Lọc
                    </button>
                )}

            </aside>

            {/* 2. MAIN CONTENT - Khu vực hiển thị sản phẩm */}
            <main className="product-main-content">
                <h2>Tất cả sản phẩm</h2>
                <ProductList products={products} />

                {hasMore && (
                    <div className="load-more-container">
                        <button
                            className="btn btn-primary load-more-button"
                            onClick={loadMoreProducts}
                            disabled={loading}
                        >
                            {loading ? 'Đang tải...' : 'Tải thêm'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Sanpham;