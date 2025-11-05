import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // Quản lý trạng thái quyền
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Không có token, điều hướng về trang đăng nhập
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    // Gọi API để kiểm tra quyền
    const checkAuthorization = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const role = response.data.role; // Lấy role từ API

        if (adminOnly && role !== 2) {
          // Nếu trang chỉ dành cho ADMIN mà người dùng không phải ADMIN
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false); // Dừng trạng thái loading
      }
    };

    checkAuthorization();
  }, [adminOnly]);

  // Hiển thị loading trong khi chờ kiểm tra quyền
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Nếu không được phép, chuyển hướng về trang chủ
  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  // Nếu được phép, hiển thị children
  return children;
};

export default ProtectedRoute;
