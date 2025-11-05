import React, { useState, useEffect } from "react";
import axios from 'axios';
import MenuBar from "../components/MenuBar";

const StockImport = () => {
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [activeTab, setActiveTab] = useState("list");
    const [formData, setFormData] = useState({
        productName: "",
        quantity: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const pageSize = 10;

    useEffect(() => {
        fetchProducts(page);
    }, [page]);

    const fetchProducts = async (currentPage) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/products/getAll?page=${currentPage}&size=${pageSize}`);
            if (response.data.content) {
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Bạn cần đăng nhập để thực hiện chức năng này.");
            return;
        }

        try {
            const payload = {
                productName: formData.productName,
                quantity: parseInt(formData.quantity, 10),
            };

            const response = await fetch("http://localhost:8080/api/stock-imports/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Thêm hàng thành công!");
                setFormData({ productName: "", quantity: "" });
                fetchProducts(page);
                setActiveTab("list");
            } else {
                const errorMessage = await response.text();
                setError(errorMessage);
            }
        } catch {
            setError("Lỗi hệ thống: Không thể kết nối đến server.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message || error}</p>;

    return (
        <div>
            <MenuBar />

            <article>
                <h2>Nhập Hàng</h2>

                {/* Tabs */}
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "list" ? "active" : ""}`}
                            onClick={() => setActiveTab("list")}
                        >
                            Danh sách sản phẩm
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "import" ? "active" : ""}`}
                            onClick={() => setActiveTab("import")}
                        >
                            Nhập hàng
                        </button>
                    </li>
                </ul>

                {/* Tab nội dung */}
                <div>
                    {/* ==== TAB DANH SÁCH ==== */}
                    {activeTab === "list" && (
                        <div>
                            <div className="tablee">
                                <div className="position-relative">
                                    <div className='d-flex justify-content-end mt-2 mb-2'>
                                        <input
                                            type="text"
                                            className=""
                                            placeholder="Search..."
                                            style={{
                                                paddingRight: "40px",
                                                backgroundColor: "#f8f9fa",
                                                width: "200px",
                                                transition: "width 0.3s ease",
                                                cursor: "text",
                                            }}
                                        />
                                    </div>
                                    <i
                                        className="fa fa-search position-absolute"
                                        style={{
                                            right: "15px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "gray",
                                            pointerEvents: "none",
                                            cursor: "pointer",
                                        }}
                                    ></i>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Tên</th>
                                            <th>Mô tả</th>
                                            <th>Giá</th>
                                            <th>Danh mục</th>
                                            <th>Số lượng</th>
                                            <th>Hình ảnh</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td>{product.name}</td>
                                                <td>{product.description}</td>
                                                <td>{product.price}</td>
                                                <td>{product.category.name}</td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    <img
                                                        src={
                                                            product.imageUrl
                                                                ? product.imageUrl.split(";")[0].startsWith("http")
                                                                    ? product.imageUrl.split(";")[0]
                                                                    : `http://localhost:8080/${product.imageUrl.split(";")[0]}`
                                                                : ""
                                                        }
                                                        alt={product.name}
                                                        width="50"
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => {
                                                            setFormData({
                                                                productName: product.name,
                                                                quantity: "",
                                                            });
                                                            setActiveTab("import");
                                                        }}
                                                    >
                                                        Nhập hàng
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-end mt-2">
                                <div className="pagination mt-2">
                                    <button onClick={() => handlePageChange(0)} disabled={page === 0}>«</button>
                                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>‹</button>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={page === i ? 'active' : ''}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1}>›</button>
                                    <button onClick={() => handlePageChange(totalPages - 1)} disabled={page === totalPages - 1}>»</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==== TAB NHẬP HÀNG ==== */}
                    {activeTab === "import" && (
                        <div>
                            <h3 className="mb-4">Nhập Hàng</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Tên Sản Phẩm</label>
                                    <select
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleChange}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Chọn sản phẩm</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.name}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Số Lượng</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Nhập số lượng"
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary me-2">
                                    Nhập Hàng
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setActiveTab("list")}
                                >
                                    Quay lại danh sách
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
};

export default StockImport;
