import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Bạn chưa đăng nhập!");

        const response = await axios.get("http://localhost:8080/api/order/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data)
        setOrderHistory(response.data);
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
      console.log(response)
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

  const filterOrders = () =>
    selectedStatus === "ALL"
      ? orderHistory
      : orderHistory.filter((order) => order.status === selectedStatus);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  const statusMap = {
    ALL: "Tất cả",
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đang xử lý",
    SHIPPING: "Đang giao hàng",
    COMPLETED: "Đã hoàn thành",
    RETURNED: "Đã hoàn lại",
    CANCELED: "Đã hủy",
  };

  return (
    <section className="OrderHistory-pages">
      <div className="containerr">
        <div>
          <h2 style={{ fontWeight: "bold" }}>Lịch sử mua hàng</h2>
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
          {filterOrders().length > 0 ? (
            <ul>
              {filterOrders().map((order) => (
                <li
                  key={order.orderId}
                  className="order-item"
                  onClick={() => fetchOrderDetails(order.orderId)}
                >
                  {/* Góc phải phía trên trạng thái */}
                  <div className="order-status">
                    <span>{statusMap[order.status]}</span>
                  </div>

                  <div className="order-info">
                    {/* Thông tin đơn hàng */}
                    <div className="order-details">
                      <p>
                        <strong>Mã đơn hàng:</strong> {order.orderId}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong> {order.status}
                      </p>
                      <p>
                        <strong>Tổng tiền thanh toán:</strong> {order.finalPrice.toLocaleString()} VNĐ
                      </p>
                    </div>
                  </div>

                  {/* ✅ Nút đánh giá nằm bên trong li */}
                  {order.status === "COMPLETED" && (
                    <div className="d-flex align-items-end justify-content-end" style={{ height: "100%" }}>
                      <button
                        type="button"
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: "#ca5738ff" }}
                        onClick={(e) => {
                          e.stopPropagation(); // tránh trigger fetchOrderDetails
                          handleDanhGiaClick(Object.keys(order.products ?? {})[0]);
                        }}
                      >
                        Đánh giá
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có đơn hàng nào ở trạng thái này.</p>
          )}
        </div>

      </div>

      {isModalOpen && selectedOrderDetails && (
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
      )}
    </section>
  );
};

export default OrderHistory;
