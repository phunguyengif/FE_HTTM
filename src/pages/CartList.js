import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MenuBar from "../components/MenuBar";

const CartList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        price: '',
        category: '',
        size: '',
        color: '',
        genderTarget: '',
        images: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeTab, setActiveTab] = useState('list');

    const pageSize = 8;
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts(page);
    }, [page]);

    const fetchProducts = async (currentPage) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/products/getAll?page=${currentPage}&size=${pageSize}`
            );
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

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Lỗi khi lấy danh mục:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData((prev) => ({ ...prev, images: Array.from(files) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formPayload = new FormData();
        if (isEditing) {
            formPayload.append("productDTO.name", formData.name);
            formPayload.append("productDTO.description", formData.description);
            formPayload.append("productDTO.price", formData.price);
            formPayload.append("productDTO.category", formData.category);
            formPayload.append("productDTO.size", formData.size);
            formPayload.append("productDTO.color", formData.color);
            formPayload.append("productDTO.genderTarget", formData.genderTarget);

            formData.images.forEach((file) => {
                formPayload.append("newImages", file);
            });
        } else {
            formPayload.append("name", formData.name);
            formPayload.append("description", formData.description);
            formPayload.append("price", formData.price);
            formPayload.append("category", formData.category);
            formPayload.append("size", formData.size);
            formPayload.append("color", formData.color);
            formPayload.append("genderTarget", formData.genderTarget);

            formData.images.forEach((file) => {
                formPayload.append("images", file);
            });
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            };

            if (isEditing) {
                await axios.put(
                    `http://localhost:8080/api/products/update/${formData.id}`,
                    formPayload,
                    config
                );
                alert("Cập nhật sản phẩm thành công!");
            } else {
                await axios.post(
                    "http://localhost:8080/api/products/add",
                    formPayload,
                    config
                );
                alert("Thêm sản phẩm thành công!");
            }

            fetchProducts(page);
            resetForm();
            setActiveTab("list");
        } catch (err) {
            console.error("Lỗi khi gửi form:", err);
            setError(err);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category?.name || '',
            size: product.size || '',
            color: product.color || '',
            genderTarget: product.genderTarget || '',
            images: [],
        });
        setIsEditing(true);
        setActiveTab('add');
    };

    const handleDelete = async (id) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            };
            await axios.post(`http://localhost:8080/api/products/delete/${id}`, null, config);
            alert("Xóa sản phẩm thành công");
            fetchProducts(page);
        } catch (err) {
            console.error("Lỗi khi gửi form:", err);
            alert("Lỗi khi xóa sản phẩm!");
            setError(err);
        }
    };

    const handleRestore = async (id) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.post(`http://localhost:8080/api/products/restore/${id}`, null, config);
            alert("Khôi phục sản phẩm thành công!");
            fetchProducts(page);
        } catch (err) {
            console.error("Lỗi khi khôi phục:", err);
            alert("Không thể khôi phục sản phẩm!");
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            price: '',
            category: '',
            size: '',
            color: '',
            genderTarget: '',
            images: [],
        });
        setIsEditing(false);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <MenuBar />
            <article>
                <h4 className="text-sm mb-0 text-capitalize">Quản lý sản phẩm</h4>

                {/* TAB MENU */}
                <ul
                    className="nav nav-tabs shadow-sm bg-white rounded px-3 py-2"
                    style={{ marginTop: "20px", marginBottom: "20px" }}
                >
                    <li className="nav-item">
                        <a
                            href="#"
                            className={`nav-link ${activeTab === "list" ? "active" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("list");
                            }}
                        >
                            Danh sách sản phẩm
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            href="#"
                            className={`nav-link ${activeTab === "add" ? "active" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("add");
                                resetForm();
                            }}
                        >
                            {isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            href="#"
                            className={`nav-link ${activeTab === "restore" ? "active" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("restore");
                            }}
                        >
                            Danh sách sản phẩm bị xóa
                        </a>
                    </li>
                </ul>

                {/* DANH SÁCH ACTIVE TRUE */}
                {activeTab === "list" && (
                    <div>
                        <div className="tablee">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tên</th>
                                        <th>Mô tả</th>
                                        <th>Ngày tạo</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>Số lượng</th>
                                        <th>Hình ảnh</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p => p.active === true).map((product) => (
                                        <tr key={product.id}>
                                            <td style={{ maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {product.name}
                                            </td>
                                            <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {product.description}
                                            </td>
                                            <td>{new Date(product.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}</td>
                                            <td>{product.category?.name}</td>
                                            <td>{product.price}</td>
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
                                                    className="btn btn-sm btn-primary me-1"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    Xóa
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

                {/* DANH SÁCH ACTIVE FALSE */}
                {activeTab === "restore" && (
                    <div>
                        <div className="tablee">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tên</th>
                                        <th>Mô tả</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>Ngày tạo</th>
                                        <th>Khôi phục</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p => p.active === false).map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td>{product.description}</td>
                                            <td>{product.category?.name}</td>
                                            <td>{product.price}</td>
                                            <td>{new Date(product.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleRestore(product.id)}
                                                >
                                                    Khôi phục
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

                {/* FORM THÊM / SỬA */}
                {activeTab === "add" && (
                    <div className="container-fluid mt-3">
                        <div className="card">
                            <div className="card-header p-3 bg-white">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-2">
                                        <label className="form-label">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Mô tả</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Giá</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Danh mục</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.name}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Kích cỡ</label>
                                        <input
                                            type="text"
                                            name="size"
                                            value={formData.size}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="VD: M, L, XL..."
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Màu sắc</label>
                                        <input
                                            type="text"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="VD: đen, trắng..."
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Giới tính</label>
                                        <select
                                            name="genderTarget"
                                            value={formData.genderTarget}
                                            onChange={handleChange}
                                            className="form-control"
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="nam">Nam</option>
                                            <option value="nu">Nữ</option>
                                            <option value="unisex">Unisex</option>
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Hình ảnh (chọn nhiều ảnh)</label>
                                        <input
                                            type="file"
                                            name="images"
                                            accept="image/*"
                                            multiple
                                            onChange={handleChange}
                                            className="form-control"
                                            required={!isEditing}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-success me-2"
                                    >
                                        {isEditing ? "Cập nhật" : "Thêm sản phẩm"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetForm}
                                    >
                                        Hủy
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
};

export default CartList;
