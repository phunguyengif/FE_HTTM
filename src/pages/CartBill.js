import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CartBill = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems: initialCartItems } = location.state || {};
    const [cartItems, setCartItems] = useState(initialCartItems || []);
    const initialTotalPrice = location.state?.totalprice || 0; // Nhận tổng số tiền từ state
    const [discountCodes, setDiscountCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDiscount, setSelectedDiscount] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [finalTotal, setFinalTotal] = useState(initialTotalPrice);
    const [placingOrder, setPlacingOrder] = useState(false); // Trạng thái xử lý đặt hàng

    console.log(cartItems)


    useEffect(() => {
        const fetchDiscountCodes = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/discount/available");
                if (!response.ok) {
                    throw new Error("Lỗi khi gọi API mã giảm giá");
                }
                const data = await response.json();
                setDiscountCodes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscountCodes();
    }, []);

    const handleSelectChange = (e) => {
        const selectedCode = e.target.value;
        setSelectedDiscount(selectedCode);

        const discount = discountCodes.find((d) => d.code === selectedCode);
        if (discount) {
            setDiscountPercentage(discount.discountPercentage);
            console.log(selectedDiscount);
            const discountAmount = (initialTotalPrice * discount.discountPercentage) / 100;
            setFinalTotal(initialTotalPrice - discountAmount);
        } else {
            setDiscountPercentage(0);
            setFinalTotal(initialTotalPrice);
        }
    };

    const handlePlaceOrder = async () => {
        setPlacingOrder(true);

        try {
            const items = cartItems.map(item => ({
                cartItemId: item.id,
                quantity: item.quantity
            }));

            const orderData = {
                discountCode: selectedDiscount || "",
                items: items
            };

            const response = await fetch("http://localhost:8080/api/order/place", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error("Lỗi khi đặt hàng. Vui lòng thử lại.");
            }

            const data = await response.json();
            alert("Đơn hàng đã được đặt thành công!");
            navigate("/Cart", { state: { order: data } });

        } catch (err) {
            alert(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setPlacingOrder(false);
        }
    };




    if (loading) {
        return <p>Đang tải danh sách mã giảm giá...</p>;
    }

    if (error) {
        return <p>Có lỗi xảy ra: {error}</p>;
    }

    return (
        <div className="containerrr">
            <div className="Header">
                <p>THANH TOÁN</p>
            </div>
            <div className="Bill-container">
                <div className="Billheader">
                    <p>ĐƠN HÀNG</p>
                </div>
                <div className="Bill-Products">
                    <h4>Sản phẩm</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.length > 0 ? (
                                cartItems.map((item) => (
                                    <tr key={item.product.id} className="product-item">
                                        <td className="product-info">
                                            <img
                                                src={
                                                    item.product.imageUrl
                                                        ? item.product.imageUrl.split(";")[0].startsWith("http")
                                                            ? item.product.imageUrl.split(";")[0]
                                                            : `http://localhost:8080/${item.product.imageUrl.split(";")[0]}`
                                                        : ""
                                                }
                                                alt={item.product.name}
                                                width="50"
                                            />
                                            <span className="product-name">{item.product.name}</span>
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>{item.product.price.toLocaleString("vi-VN")} VND</td>
                                        <td>{(item.product.price * item.quantity).toLocaleString("vi-VN")} VND</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center" }}>Không có sản phẩm nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>
                <div className="Bill-Content">
                    <h4>Mã giảm giá:</h4>
                    {discountCodes.length > 0 ? (
                        <select
                            value={selectedDiscount}
                            onChange={handleSelectChange}
                            className="border p-2 rounded"
                        >
                            <option value="">-- Chọn mã giảm giá --</option>
                            {discountCodes.map((discount) => (
                                <option key={discount.code} value={discount.code}>
                                    {discount.code} - {discount.description} ({discount.discountPercentage}%)
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p>Không có mã giảm giá hiện tại</p>
                    )}
                    {selectedDiscount && (
                        <p className="mt-4">
                            Mã giảm giá đã chọn: <strong>{selectedDiscount}</strong>
                            <br />
                            Giảm giá: {discountPercentage}%
                        </p>
                    )}
                    <p style={{ fontWeight: "bold" }}>Tổng tiền ban đầu: {initialTotalPrice.toLocaleString("vi-VN")} VND</p>
                    <p style={{ fontWeight: "bold" }}>
                        Tổng tiền sau giảm giá: {finalTotal.toLocaleString("vi-VN")} VND
                    </p>
                </div>
                <div className="Bill-Button">
                    <button
                        className="btn btn-dark"
                        onClick={handlePlaceOrder}
                        disabled={placingOrder} // Vô hiệu hóa trong khi xử lý
                    >
                        {placingOrder ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartBill;
