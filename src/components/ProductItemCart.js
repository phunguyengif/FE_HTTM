import React from 'react';

const ProductItemCart = ({ imageUrl, name, price, onClick, onRemove, quantity, onSelect, isSelected }) => {
    const formatPrice = (price) => {
        if (typeof price !== 'number') return '';
        return price.toLocaleString('vi-VN');
    };
    return (
        <div className="product-buy-1-content-product-item">

            <div className="select-product">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </div>
            <div onClick={onClick}>
                <img
                    src={
                        imageUrl
                            ? imageUrl.split(";")[0].startsWith("http")
                                ? imageUrl.split(";")[0]
                                : `http://localhost:8080/${imageUrl.split(";")[0]}`
                            : ""
                    }
                    alt={name}
                />
                <div className="product-cart-1-content-product-item-text">
                    <li>{name}</li>
                    <li>Số lượng: {quantity}</li>
                    <li>Giá: {formatPrice(price)} VND</li>
                </div>
            </div>
            <div className="remove-product">
                <button
                    className="btn " onClick={onRemove}>
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

export default ProductItemCart;
