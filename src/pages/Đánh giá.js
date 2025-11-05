import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DanhGia = () => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("COMPLETED");
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderImages, setOrderImages] = useState({});
    const navigate = useNavigate(); // ✅ Thêm useNavigate

    useEffect(() => {
        const fetchOrderHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Bạn chưa đăng nhập!");

                const response = await axios.get("http://localhost:8080/api/order/history", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // 🟢 Lọc đơn hàng có trạng thái COMPLETED
                const completedOrders = response.data.filter((order) => order.status === "COMPLETED");
                setOrderHistory(completedOrders);

                // ✅ Lấy ảnh đại diện cho mỗi đơn hàng
                const imagePromises = response.data.map(async (order) => {
                    try {
                        const res = await axios.get(`http://localhost:8080/api/order/history/${order.orderId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const firstImage = res.data.products?.[0]?.imageUrl || null;
                        return { orderId: order.orderId, image: firstImage };
                    } catch {
                        return { orderId: order.orderId, image: null };
                    }
                });

                const imageResults = await Promise.all(imagePromises);
                const imageMap = {};
                imageResults.forEach(({ orderId, image }) => {
                    imageMap[orderId] = image;
                });
                setOrderImages(imageMap);
            } catch (err) {
                setError(
                    err.response?.data?.message || "Không thể tải lịch sử mua hàng. Vui lòng thử lại sau!"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, []);

    const fetchOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:8080/api/order/history/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSelectedOrderDetails(response.data);
            setIsModalOpen(true);
        } catch (err) {
            setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau!");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrderDetails(null);
    };

    const handleDanhGiaClick = (productId) => {
        console.log(productId)
        navigate(`/FormDanhGia/${productId}`); // ✅ Chuyển sang form đánh giá
    };

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div className="error">{error}</div>;

    const statusMap = {
        COMPLETED: "Chưa đánh giá",
    };

    return (
        <section className="OrderHistory-pages">
            <div className="containerr">
                <div>
                    <h2 style={{ fontWeight: "bold" }}>Đánh giá sản phẩm</h2>
                </div>

                <div className="status-bar">
                    {Object.keys(statusMap).map((status) => (
                        <button
                            key={status}
                            className={`status-button ${selectedStatus === status ? "active" : ""}`}
                            onClick={() => setSelectedStatus(status)}
                        >
                            {statusMap[status]}
                        </button>
                    ))}
                </div>

                <div className="order-history-list">
                    {orderHistory.length > 0 ? (
                        <ul>
                            {orderHistory.map((order) => (
                                < div className="order-item" key={order.orderId} >
                                    <li onClick={() => fetchOrderDetails(order.orderId)}>
                                        <div className="order-info">
                                            {orderImages[order.orderId] && (
                                                <img
                                                    src={orderImages[order.orderId]}
                                                    alt="Product"
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                            )}

                                            <div className="order-details">
                                                <p>
                                                    <strong>Mã đơn hàng:</strong> {order.orderId}
                                                </p>
                                                <p>
                                                    <strong>Trạng thái:</strong> {order.status}
                                                </p>
                                            </div>
                                        </div>
                                    </li>

                                    {/* ✅ Nút chuyển sang form đánh giá */}
                                    < div className="d-flex align-items-end justify-content-end" style={{ height: "100%" }}>
                                        <button
                                            type="button"
                                            className="btn btn-sm text-white"
                                            style={{ backgroundColor: "#ca5738ff" }}
                                            onClick={() => handleDanhGiaClick(Object.keys(order.products)[0])}
                                        >
                                            Đánh giá
                                        </button>

                                    </div>
                                </div>
                            ))}
                        </ul>
                    ) : (
                        <p>Không có đơn hàng nào ở trạng thái này.</p>
                    )}
                </div>
            </div >

            {/* Modal hiển thị chi tiết */}
            {
                isModalOpen && selectedOrderDetails && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeModal}>
                                ×
                            </button>
                            <h3>Chi tiết đơn hàng</h3>
                            <p>
                                <strong>Mã đơn hàng:</strong> {selectedOrderDetails.orderId}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong> {statusMap[selectedOrderDetails.status]}
                            </p>
                            <p>
                                <strong>Tổng tiền thanh toán:</strong> {selectedOrderDetails.finalPrice.toLocaleString()} VNĐ
                            </p>
                            <h4>Sản phẩm trong đơn hàng:</h4>
                            <ul>
                                {selectedOrderDetails.products?.map((product) => (
                                    <li key={product.productId}>
                                        <p>
                                            <img
                                                src={`http://localhost:8080/${product.imageUrl}`}
                                                alt="Product"
                                                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                            />
                                        </p>
                                        <p>
                                            <strong>Tên sản phẩm:</strong> {product.productName}
                                        </p>
                                        <p>
                                            <strong>Số lượng:</strong> {product.quantity}
                                        </p>
                                        <p>
                                            <strong>Giá:</strong> {product.price.toLocaleString()} VNĐ
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )
            }
        </section >
    );
};

export default DanhGia;
