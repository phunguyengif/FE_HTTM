import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const productId = id;
    const [product, setProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const quantityInputRef = useRef(null);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");// trạng thái lưu comment
    const [reviews, setReviews] = useState([]); // Thêm trạng thái lưu nhận xét

    // --- Xử lý gallery ảnh ---
    const [mainImage, setMainImage] = useState("");
    const [imageUrls, setImageUrls] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isReadyToBuy = selectedColor && selectedSize;


    const formatPrice = (price) => {
        if (typeof price !== 'number') return '';
        return price.toLocaleString('vi-VN');
    };
    useEffect(() => {
        if (quantityInputRef.current) {
            quantityInputRef.current.value = quantity;
        }
        localStorage.setItem(`quantity_${id}`, quantity);
        fetchReviews();
        fetchProduct();
    }, [quantity, id]);



    const fetchProduct = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/products/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setProduct(data);
            const storedQuantity = localStorage.getItem(`quantity_${id}`) || 1;
            setQuantity(parseInt(storedQuantity));
            setTotalPrice(parseInt(data.price * quantity));

            const imgs = data.imageUrl ? data.imageUrl.split(";") : [];
            setImageUrls(imgs);
            if (imgs.length > 0) setMainImage(imgs[0]);

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (event) => {
        let value = parseInt(event.target.value);
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        setQuantity(value);
    };
    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };
    // Hàm hiển thị sao theo rating
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <span>
                {'★'.repeat(fullStars)}
                {hasHalfStar && '☆'}
                {'☆'.repeat(emptyStars)}
            </span>
        );
    };

    //Tải danh sách nhân xét
    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/reviews/product/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }
            const data = await response.json();
            setReviews(data); // Cập nhật nhận xét vào state
        } catch (err) {
            console.error(err);
        }
    };


    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        try {

            const response = await fetch('http://localhost:8080/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Thêm token vào header
                },
                body: JSON.stringify({
                    productId: id, // ID sản phẩm
                    quantity: quantity, // Số lượng sản phẩm
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json();
            alert(data.message); // Thông báo thành công
        } catch (err) {
            console.log(err);
            alert('Có lỗi xảy ra: ' + err.message);
        }
    };

    const handlePlace = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("Bạn cần đăng nhập để thực hiện đặt hàng!");
            return;
        }

        try {
            // 1. Thêm sản phẩm vào giỏ hàng
            const addToCartRes = await fetch('http://localhost:8080/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: id,
                    quantity: quantity,
                }),
            });

            if (!addToCartRes.ok) {
                const errorData = await addToCartRes.json();
                throw new Error(errorData.message || "Không thể thêm sản phẩm vào giỏ hàng.");
            }

            // 2. Lấy toàn bộ giỏ hàng để lấy cartItem theo product ID
            const cartRes = await fetch('http://localhost:8080/api/cart', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const cartData = await cartRes.json();

            const selectedItem = cartData.cart.find(item => item.product.id.toString() === id);

            if (!selectedItem) {
                throw new Error("Không tìm thấy sản phẩm vừa thêm trong giỏ hàng.");
            }

            // 3. Tính tổng tiền
            const total = selectedItem.product.price * selectedItem.quantity;

            // 4. Điều hướng đến CartBill
            navigate("/CartBill", {
                state: {
                    cartItems: [selectedItem],
                    totalprice: total,
                },
            });

        } catch (err) {
            console.error("Lỗi khi xử lý đặt hàng:", err);
            alert(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };


    if (loading) {
        return <p>Đang tải thông tin sản phẩm...</p>;
    }

    if (error) {
        return <p>Có lỗi xảy ra khi lấy dữ liệu: {error.message}</p>;
    }

    if (!product) {
        return <p>Không tìm thấy sản phẩm.</p>;
    }

    return (
        <section className="Item">
            <div className="containerr">
                <div className="Item-pages">
                    <div className="Item-pages-Img">
                        <div className="Item-pages-Img text-center">
                            {/* Ảnh lớn */}
                            <div className="Item-img mb-3">
                                <img
                                    src={mainImage}
                                    alt="Ảnh sản phẩm"
                                    className="img-fluid rounded shadow-sm"
                                    style={{
                                        width: "100%",
                                        maxWidth: "400px",
                                        height: "auto",
                                        objectFit: "contain",
                                        transition: "transform 0.3s ease",
                                    }}
                                />
                            </div>

                            {/* Ảnh nhỏ bên dưới */}
                            <div className="d-flex justify-content-center gap-2 flex-wrap">
                                {imageUrls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`thumb-${index}`}
                                        onClick={() => setMainImage(url)}
                                        className={`rounded border ${mainImage === url ? "border-3 border-primary" : "border-1 border-secondary"
                                            }`}
                                        style={{
                                            width: "70px",
                                            height: "70px",
                                            objectFit: "cover",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease-in-out",
                                        }}
                                    />
                                ))}
                            </div>
                            <div className='chia_se' >
                                <p>Chia sẻ:</p>
                                <img src='/Image/facebook.png' />
                                <img src='/Image/messenger.png' />
                                <img src='/Image/pinterest.png' />
                                <img src='/Image/twitter.png' />
                            </div>
                        </div>
                    </div>
                    <div className="Item-content">
                        <div className="Item-content-text">
                            <h4>{product.name}</h4>
                            {/* Phần đánh giá */}
                            <p className="text-muted mb-2">
                                {reviews.length > 0 ? (
                                    <span>{reviews.length} đánh giá</span>
                                ) : (
                                    <span className="fst-italic text-secondary">Chưa có đánh giá</span>
                                )}
                            </p>

                            {/* Giá sản phẩm */}
                            <p
                                className="fw-bold mb-3"
                                style={{ fontSize: "1.6rem", color: "#ff6600", backgroundColor: "#fafafa" }}
                            >
                                {product.price.toLocaleString()}
                                <sup
                                    style={{
                                        fontSize: "0.9rem",
                                        top: "-0.6em",
                                        position: "relative",
                                        marginLeft: "2px",
                                    }}
                                >
                                    ₫
                                </sup>
                            </p>
                        </div>
                        {/* ✅ Thêm phần chọn màu sắc */}
                        <div className="mb-3">
                            <label className="fw-semibold">Màu sắc:</label>
                            <div>
                                {["Đen", "Trắng", "Xanh", "Đỏ"].map((color) => (
                                    <div className="form-check form-check-inline" key={color}>
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="color"
                                            id={`color-${color}`}
                                            value={color}
                                            onChange={(e) => setSelectedColor(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor={`color-${color}`}>
                                            {color}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ✅ Thêm phần chọn size */}
                        <div className="mb-3">
                            <label htmlFor="sizeSelect" className="fw-semibold">Kích cỡ:</label>
                            <select
                                id="sizeSelect"
                                className="form-select w-auto"
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                            >
                                <option value="">-- Chọn size --</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                            </select>
                        </div>
                        <div className='Item-content-button-addd'>
                            <div className="input-group">
                                <button className="btn btn-outline-secondary" type="button" onClick={handleDecrease}>-</button>
                                <input
                                    type="number"
                                    className="form-control text-center"
                                    ref={quantityInputRef}
                                    value={quantity}
                                    min="1"
                                    onChange={handleQuantityChange}
                                />
                                <button className="btn btn-outline-secondary" type="button" onClick={handleIncrease}>+</button>
                            </div>
                        </div>

                        <div className="Item-content-button-add">

                            <div className="mt-3 d-flex gap-2">
                                <button
                                    className="btn btn-outline-primary flex-fill"
                                    onClick={() => handleAddToCart({ ...product, quantity, selectedColor, selectedSize })}
                                    disabled={!isReadyToBuy}
                                >
                                    <i className="bi bi-cart-plus me-1"></i> Thêm vào giỏ hàng
                                </button>

                                <button
                                    className="btn btn-primary flex-fill"
                                    onClick={() => handlePlace({ ...product, quantity, selectedColor, selectedSize })}
                                    disabled={!isReadyToBuy}
                                >
                                    <i className="bi bi-bag-check me-1"></i> Đặt hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='Review-pages'>
                    <div className='Review-pages-container'>
                        <div className="Item-content-description">
                            <div className="Item-content-description-header">
                                <p>MÔ TẢ SẢN PHẨM</p>
                            </div>
                            <div className="Item-content-description-title">
                                <p>{product.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="Review-pages">
                    <div className="Review-pages-container">
                        <div className="Review-header">
                            <p style={{ fontSize: "15px" }}>ĐÁNH GIÁ SẢN PHẨM</p>
                        </div>
                        <div className="Review-content-pages">
                            {/* dùng để show tất cả nhận xét */}
                            <div className="Review-content">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.id} className="review-item">
                                            <p><strong>{review.userFullName}</strong> <span style={{ marginLeft: "8px", color: "#999", fontSize: "0.9rem" }}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span></p>

                                            <p>
                                                {renderStars(review.rating)}
                                                <span style={{ marginLeft: "8px", color: "#999", fontSize: "0.9rem" }}>
                                                    ({review.rating}/5)
                                                </span>
                                            </p>
                                            <p>{review.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>Chưa có nhận xét nào cho sản phẩm này.</p>
                                )}

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default ProductDetail;
