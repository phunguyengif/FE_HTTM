import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductItem from './ProductItem';

const ProductList = ({ products }) => {
  const navigate = useNavigate();

  if (products.length === 0) {
    return <p>Không có sản phẩm nào để hiển thị.</p>;
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <section className="product-buy-1">
      <div className="containerr">
        <div className="product-buy-1-content">
          <div className="product-buy-1-content-product">
            {products.map((product) => (
              <ProductItem
                key={product.id}
                imageUrl={product.imageUrl}
                name={product.name}
                price={product.price}
                date={product.createdAt}
                categoryName={product.categoryId?.name || 'Không có danh mục'}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductList;
