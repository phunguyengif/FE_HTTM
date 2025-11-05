import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductSale from './ProductSale';

const ShowProductSale = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products/getAllActive?page=0&size=4');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("Test",data)

        if (Array.isArray(data.content)) {
          setProducts(data.content); // chỉ 4 sản phẩm, không cần slice
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
    return <p>Có lỗi xảy ra khi lấy dữ liệu: {error.message}</p>;
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // Chuyển đến trang chi tiết sản phẩm
  };
  return (
    <section className='slider-product-1'>
      <div className="containerr">
        <div className='slider-product-1-content'>
          <div className="slider-product-1-content-title">
            <h2>Sản phẩm sale mỗi ngày</h2>
          </div>
          <div className="slider-product-1-content-items">
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
