import { useEffect, useState } from "react";
import MenuBar from "../components/MenuBar";
import axios from "axios";

const OrderStatus = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState("LIST");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/order/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
            console.log(res)
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi tải danh sách đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    //API lấy danh sách sản phẩm trong đơn hàng
    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/order/history/${orderId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSelectedOrder(response.data);
            setActiveTab("VIEW");
        } catch (err) {
            setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau!");
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        console.log("OrderID",orderId)
        try {
            const formData = new FormData();
            
            formData.append('newStatus', newStatus);

            await axios.put(
                `http://localhost:8080/api/order/${orderId}/status`,
                formData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    },
                }
            );
           setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
            
            setSelectedOrder((prev) => {
                if (prev && (prev.id === orderId || prev.orderId === orderId)) {
                    return { ...prev, status: newStatus };
                }
                return prev;
            });

            alert("Cập nhật trạng thái thành công!");
        } catch (err) {
            alert(
                "Cập nhật trạng thái thất bại: " +
                (err.response?.data?.message || "Lỗi không xác định.")
            );
        }
    };

    const renderStatus = (status) => {
        const colors = {
            PENDING: "bg-yellow-200 text-yellow-800",
            CONFIRMED: "bg-blue-200 text-blue-800",
            SHIPPING: "bg-purple-200 text-purple-800",
            COMPLETED: "bg-green-200 text-green-800",
            CANCELED: "bg-red-200 text-red-800",
            RETURNED: "bg-gray-200 text-gray-800",
        };
        return (
            <span className={`px-2 py-1 rounded ${colors[status] || "bg-gray-100"}`}>
                {status}
            </span>
        );
    };

    const formatDate = (isoStr) => {
        const d = new Date(isoStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    if (loading)
        return <p className="text-center mt-4">Đang tải danh sách đơn hàng...</p>;
    if (error)
        return <p className="text-center mt-4 text-red-500">{error}</p>;

    return (
        <div>
            <MenuBar />
            <article className="p-4">
                <h2 className="text-lg font-bold mb-4">Quản lý đơn hàng</h2>

                {/* Tabs */}
                <ul className="nav nav-tabs shadow-sm bg-white rounded px-3 py-2 mb-4">
                    <li className="nav-item">
                        <a
                            href="#"
                            className={`nav-link ${activeTab === "LIST" ? "active" : ""}`}
                            style={{ backgroundColor: activeTab === "LIST" ? "#23bd8f" : "" }}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("LIST");
                                setSelectedOrder(null);
                            }}
                        >
                            Danh sách đơn hàng
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            href="#"
                            className={`nav-link ${activeTab === "VIEW" ? "active" : ""} ${!selectedOrder ? "disabled opacity-50" : ""
                                }`}
                            style={{ backgroundColor: activeTab === "VIEW" ? "#23bd8f" : "" }}
                            onClick={(e) => {
                                e.preventDefault();
                                if (selectedOrder) setActiveTab("VIEW");
                            }}
                        >
                            Xem đơn hàng
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            href="#"
                            className={`nav-link ${activeTab === "EDIT" ? "active" : ""} ${!selectedOrder ? "disabled opacity-50" : ""
                                }`}
                            style={{ backgroundColor: activeTab === "EDIT" ? "#23bd8f" : "" }}
                            onClick={(e) => {
                                e.preventDefault();
                                if (selectedOrder) setActiveTab("EDIT");
                            }}
                        >
                            Chỉnh sửa đơn hàng
                        </a>
                    </li>
                </ul>

                {/* LIST */}
                {activeTab === "LIST" && (
                    <div className="tablee overflow-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="border px-4 py-2">Mã đơn</th>
                                    <th className="border px-4 py-2">Khách hàng</th>
                                    <th className="border px-4 py-2">Ngày tạo</th>
                                    <th className="border px-4 py-2">Tổng</th>
                                    <th className="border px-4 py-2">Trạng thái</th>
                                    <th className="border px-4 py-2">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-100">
                                        <td className="border px-4 py-2">{order.id}</td>
                                        <td className="border px-4 py-2">{order.user.fullname}</td>
                                        <td className="border px-4 py-2">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {order.finalPrice.toLocaleString()} VND
                                        </td>
                                        <td className="border px-4 py-2">
                                            {renderStatus(order.status)}
                                        </td>
                                        <td className="border px-4 py-2">
                                            <button
                                                className="btn btn-sm btn-primary me-1"
                                                onClick={() => fetchOrderDetails(order.id)}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setActiveTab("EDIT");
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* VIEW */}
                {activeTab === "VIEW" && selectedOrder && (
                    <div className="p-4 border rounded shadow bg-white">
                        <h3 className="text-lg font-bold mb-2">
                            Chi tiết đơn hàng #{selectedOrder.orderId || selectedOrder.id}
                        </h3>
                        <h4 className="mt-4 font-semibold">Sản phẩm trong đơn hàng:</h4>
                        <ul className="list-disc ps-5">
                            {selectedOrder.products?.length > 0 ? (
                                selectedOrder.products.map((p) => (
                                    <li key={p.productId} className="mt-2">
                                        <img
                                            src={
                                                p.imageUrl
                                                    ? p.imageUrl.split(";")[0].startsWith("http")
                                                        ? p.imageUrl.split(";")[0]
                                                        : `http://localhost:8080/${p.imageUrl.split(";")[0]}`
                                                    : ""
                                            }
                                            alt={p.name}
                                            width="50"
                                        />
                                        <p><strong>Tên:</strong> {p.productName}</p>
                                        <p><strong>Số lượng:</strong> {p.quantity}</p>
                                        <p><strong>Giá:</strong> {p.price.toLocaleString()} VNĐ</p>
                                    </li>
                                ))
                            ) : (
                                <p>Không có sản phẩm trong đơn hàng.</p>
                            )}
                        </ul>

                        <button
                            className="btn btn-sm btn-secondary mt-3"
                            onClick={() => {
                                setActiveTab("LIST");
                                setSelectedOrder(null);
                            }}
                        >
                            Quay lại
                        </button>
                    </div>
                )}

                {/* EDIT */}
                {activeTab === "EDIT" && selectedOrder && (
                    <div className="p-4 border rounded shadow bg-white">
                        <h3 className="text-lg font-bold mb-3">
                            Cập nhật trạng thái đơn hàng #{selectedOrder.orderId || selectedOrder.id}
                        </h3>

                        <div className="order-actions flex flex-wrap gap-2">
                            {selectedOrder.status === "PENDING" && (
                                <>
                                    <button
                                        className="btn btn-success me-1"
                                        onClick={() =>
                                            updateOrderStatus(selectedOrder.orderId || selectedOrder.id, "CONFIRMED")
                                        }
                                    >
                                        Xác nhận
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() =>
                                            updateOrderStatus(selectedOrder.orderId || selectedOrder.id, "CANCELED")
                                        }
                                    >
                                        Hủy
                                    </button>
                                </>
                            )}
                            {selectedOrder.status === "CONFIRMED" && (
                                <>
                                    <button
                                        className="btn btn-primary me-1"
                                        onClick={() =>
                                            updateOrderStatus(selectedOrder.orderId || selectedOrder.id, "SHIPPING")
                                        }
                                    >
                                        Giao hàng
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() =>
                                            updateOrderStatus(selectedOrder.orderId || selectedOrder.id, "CANCELED")
                                        }
                                    >
                                        Hủy
                                    </button>
                                </>
                            )}
                            {selectedOrder.status === "SHIPPING" && (
                                <>
                                    <button
                                        className="btn btn-success me-1"
                                        onClick={() =>
                                            updateOrderStatus(selectedOrder.orderId || selectedOrder.id, "COMPLETED")
                                        }
                                    >
                                        Giao hàng hoàn tất
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            updateOrderStatus(selectedOrder.orderId || selectedOrder.id, "RETURNED")
                                        }
                                    >
                                        Hoàn trả
                                    </button>
                                </>
                            )}
                            {selectedOrder.status === "RETURNED" && (
                                <span className="text-orange-600 fw-bold">Hoàn trả</span>
                            )}
                            {selectedOrder.status === "COMPLETED" && (
                                <span className="text-success fw-bold">
                                    Đã giao hàng thành công
                                </span>
                            )}
                            {selectedOrder.status === "CANCELED" && (
                                <span className="text-danger fw-bold">
                                    Đơn hàng đã hủy
                                </span>
                            )}
                        </div>
                        <button
                            className="btn btn-sm btn-secondary mt-4"
                            onClick={() => {
                                setActiveTab("LIST");
                                setSelectedOrder(null);
                            }}
                        >
                            Quay lại
                        </button>
                    </div>
                )}
            </article >
        </div >
    );
};

export default OrderStatus;
