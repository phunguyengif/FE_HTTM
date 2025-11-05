import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const FormDanhGia = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const productId = Number(id); // ✅ đảm bảo productId là số

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [id]); // ✅ tránh gọi lặp vô hạn

  // Tải danh sách nhận xét
  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/product/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn từ 1 đến 5 sao.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/reviews/add",
        {
          productId,
          rating,
          comment,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Reset form
      setRating(0);
      setHover(0);
      setComment("");
      fetchReviews();
      alert("Đánh giá thành công!");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Lỗi khi gửi đánh giá, vui lòng thử lại.");
    }
  };

  return (
    <section className="Item">
      <div className="containerr">
        <div className="Review-pages">
          <div className="Review-pages-container">
            <div className="Review-header">
              <p style={{ fontSize: "15px" }}>ĐÁNH GIÁ SẢN PHẨM</p>
            </div>

            <div className="Review-rating-pages">
              <div className="Review-rating">
                <form onSubmit={handleSubmit}>
                  {/* Rating sao */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Đánh giá:</label>
                    <div className="star-rating mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          style={{
                            cursor: "pointer",
                            color: star <= (hover || rating) ? "#fc5a31" : "#ccc",
                            fontSize: "28px",
                            transition: "color 0.2s",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium mb-2">
                      Nhận xét:
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="3"
                      style={{ width: "920px" }}
                      required
                    />
                  </div>

                  {error && <p className="text-danger mt-2">{error}</p>}

                  <button type="submit" className="btn btn-primary mt-3">
                    Gửi đánh giá
                  </button>
                </form>
              </div>
            </div>

            {/* (Tùy chọn) Hiển thị danh sách đánh giá */}
            <div className="mt-4">
              <h5>Nhận xét gần đây:</h5>
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <div key={r.id} className="border rounded p-2 mb-2">
                    <div>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                    <p className="mb-0">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p>Chưa có đánh giá nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormDanhGia;
