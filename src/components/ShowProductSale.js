import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductSale from './ProductSale';

const API_BASE_URL = 'http://localhost:8080/api/products';

const ShowProductSale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. Lấy token từ localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // 3. Truyền headers vào fetch
        const response = await fetch(`${API_BASE_URL}/recommendation`, {
          method: 'GET',
          headers: headers 
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("Test", data);

        if (Array.isArray(data)) {
          setProducts(data.slice(0, 4));
        } else {
          throw new Error('Dữ liệu không phải là một mảng');
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProducts();
    } else {
      setError(new Error('Bạn cần đăng nhập để xem gợi ý.'));
      setLoading(false);
    }
  }, [token]); 

  if (loading) {
    return <p>Đang tải sản phẩm...</p>;
  }

  if (error) {
    return <p>Có lỗi xảy ra: {error.message}</p>;
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <section className='slider-product-1'>
      <div className="containerr">
        <div className='slider-product-1-content'>
          <div className="slider-product-1-content-title">
            <h2>Sản phẩm đề xuất
            </h2>
          </div>
          <div className="slider-product-1-content-itemss">
            {products.map((product) => (
              <ProductSale
                key={product.id}
                imageUrl={product.imageUrl}
                name={product.name}
                price={product.price}
                date={product.createdAt}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowProductSale;