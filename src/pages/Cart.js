import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductItemCart from "../components/ProductItemCart";
import DanhGia from "./Đánh giá";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [status, setStatus] = useState({ loading: true, error: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setStatus({ loading: false, error: "Vui lòng đăng nhập để xem giỏ hàng!" });
                return;
            }

            try {
                setStatus({ loading: true, error: "" });
                const { data } = await axios.get("http://localhost:8080/api/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCartItems(data.cart);
                setSelectedItems([]); // Không chọn sản phẩm nào khi mới tải giỏ hàng
            } catch {
                setStatus({ loading: false, error: "Không thể tải giỏ hàng. Vui lòng thử lại." });
            } finally {
                setStatus((prev) => ({ ...prev, loading: false }));
            }
        };

        fetchCartItems();
    }, []);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleRemoveItem = async (productId) => {
        try {
            await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const updatedItems = cartItems.filter((item) => item.product.id !== productId);
            setCartItems(updatedItems);
            setSelectedItems((prev) => prev.filter(id => id !== productId));
        } catch {
            alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
        }
    };

    const handleSelectItem = (productId) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(productId)
                ? prevSelected.filter((id) => id !== productId)
                : [...prevSelected, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            // Nếu tất cả đều đã được chọn, bỏ chọn tất cả
            setSelectedItems([]);
        } else {
            // Chọn tất cả sản phẩm trong giỏ hàng
            setSelectedItems(cartItems.map(item => item.product.id));
        }
    };

    const selectedTotalPrice = cartItems
        .filter((item) => selectedItems.includes(item.product.id))
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handlePlaceOrder = () => {
        // Lọc ra các sản phẩm đã được chọn
        const selectedProducts = cartItems.filter((item) =>
            selectedItems.includes(item.product.id) // Sử dụng item.product.id để so khớp
        );

        // Kiểm tra nếu không có sản phẩm nào được chọn
        if (selectedProducts.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
            return;
        }

        // Debug: Xem danh sách sản phẩm đã chọn và tổng tiền
        console.log("Selected Products:", selectedProducts);
        console.log("Total Price:", selectedTotalPrice);

        // Truyền thông tin về các sản phẩm đã chọn và tổng tiền sang trang CartBill
        navigate("/CartBill", {
            state: {
                totalprice: selectedTotalPrice,
                cartItems: selectedProducts,
            },
        });
    };


    if (status.loading) return <p>Đang tải dữ liệu...</p>;
    if (status.error) return <p className="text-red-500">{status.error}</p>;

    return (
        <section className="Cart-pages">
            <div className="containerr">
                <div className="cart-header">
                    <h4 style={{ fontWeight: "bold" }}>Giỏ hàng của bạn</h4>
                    <a href="/Sanpham">Tiếp tục mua sắm</a>
                    <a href="/OrderHistory">Lịch sử mua hàng</a>
                    <a href="/DanhGia">Đánh giá</a>
                </div>
                {/* Checkbox "Chọn tất cả" */}
                <div className="select-all-container">
                    <input
                        type="checkbox"
                        checked={selectedItems.length === cartItems.length}
                        onChange={handleSelectAll}
                    />
                    <span>Chọn tất cả</span>
                </div>

                <div className="cart-product">
                    <div className="product-buy-1-content-product">
                        {cartItems.length === 0 ? (
                            <p>Chưa có sản phẩm nào trong giỏ hàng</p>
                        ) : (
                            <>

                                {/* Hiển thị các sản phẩm */}
                                {cartItems.map((item) => (
                                    <ProductItemCart
                                        key={item.id}
                                        imageUrl={item.product.imageUrl}
                                        name={item.product.name}
                                        price={item.product.price}
                                        quantity={item.quantity}
                                        onClick={() => handleProductClick(item.product.id)}
                                        onRemove={() => handleRemoveItem(item.product.id)}
                                        isSelected={selectedItems.includes(item.product.id)}
                                        onSelect={() => handleSelectItem(item.product.id)}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="cart-infor">
                    <p style={{ fontWeight: "bold", fontSize: "20px" }}>Thông tin đơn hàng</p>
                    <p style={{ fontWeight: "bold" }}>
                        <span>Tổng tiền đã chọn: </span>
                        <span>{selectedTotalPrice.toLocaleString()} VND</span>
                    </p>

                    <button
                        className="btn btn-dark"
                        onClick={handlePlaceOrder}
                    >
                        Đặt hàng
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Cart;
