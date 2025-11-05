import React, { useEffect, useState } from "react";
import axios from "axios";
import MenuBar from "../components/MenuBar";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [filterRole, setFilterRole] = useState("ALL"); // ALL, USER, ADMIN
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Người dùng chưa đăng nhập.");
            setLoading(false);
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/user/getAll", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.message || "Không thể tải danh sách người dùng!";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);


    // Lọc người dùng theo role dựa vào dropdown
    const filteredUsers = users.filter(user =>
        filterRole === "ALL" ? true : user.role === filterRole
    );

    const handleBan = async (id) => {
        try {
            await axios.post(`http://localhost:8080/api/user/banUser/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Cập nhật trạng thái trực tiếp trong state
            alert("Khóa tài khoản thành công");
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === id ? { ...user, active: false } : user
                )
            );
        } catch (err) {
            setError(err.response?.data?.message || "Khóa tài khoản thất bại");
        }
    };

    const handleUnBan = async (id) => {
        try {
            await axios.post(`http://localhost:8080/api/user/unbanUser/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Cập nhật trạng thái trực tiếp trong state
            alert("Mở tài khoản thành công");
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === id ? { ...user, active: true } : user
                )
            );
        } catch (err) {
            setError(err.response?.data?.message || "Mở tài khoản thất bại");
        }
    };


    if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;
    if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

    return (
        <div>
            <MenuBar />
            <article className="p-4">
                <div className="tablee">
                    <h4 className="text-2xl font-bold mb-4">Danh sách người dùng</h4>

                    {/* Dropdown lọc */}
                    <div className="d-flex justify-content-end mb-4">
                        <label className="mr-2 font-semibold">Lọc theo vai trò:</label>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="border rounded px-2 py-1"
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {/* Table */}
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b">Name</th>
                                <th className="py-2 px-4 border-b">Email</th>
                                <th className="py-2 px-4 border-b">Số điện thoại</th>
                                <th className="py-2 px-4 border-b">Địa chỉ</th>
                                <th className="py-2 px-4 border-b">Status</th>
                                <th className="py-2 px-4 border-b">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50"
                                style={{ backgroundColor: !user.active ? "#3476a2" : "" }}
                                >
                                    <td className="py-2 px-4 border-b">{user.fullname}</td>
                                    <td className="py-2 px-4 border-b">{user.email}</td>
                                    <td className="py-2 px-4 border-b">{user.phone}</td>
                                    <td className="py-2 px-4 border-b">{user.address}</td>
                                    <td className="py-2 px-4 border-b">
                                        {user.active ? (
                                            <span className="text-green-500 font-semibold">Hoạt động</span>
                                        ) : (
                                            <span className="text-red-500 font-semibold">Bị khóa</span>
                                        )}
                                    </td>
                                    <td>
                                        {user.active ? (
                                            <button
                                                className="btn btn-sm btn-danger me-1"
                                                onClick={() => handleBan(user.id)}
                                            >
                                                Khóa tài khoản
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleUnBan(user.id)}
                                            >
                                                Mở tài khoản
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-gray-500">
                                        Không có người dùng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </article>
        </div>
    );
};

export default UserList;
