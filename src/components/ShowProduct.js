import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductItem from './ProductItem';

const ShowProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products/getAll?page=0&size=8');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (Array.isArray(data.content)) {
          setProducts(data.content);
        } else {
          throw new Error('Dữ liệu không phải là một mảng');
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Đang tải sản phẩm...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Có lỗi xảy ra khi lấy dữ liệu: {error.message}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  if (products.length === 0) {
    return <p>Không có sản phẩm nào để hiển thị.</p>;
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <section className='product-buy-1'>
      <div className="containerr">
        <div className="product-buy-1-content">
          <div className="product-buy-1-content-product">
            {products.map((product) => (
              <ProductItem
                key={product.id}
                imageUrl={product.imageUrl}
                name={product.name}
                price={product.price}
                date={product.date}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowProduct;
