import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  // Khởi tạo các trường bắt buộc (Step 1) và tùy chọn (Step 2)
  const [formData, setFormData] = useState({
    // Step 1: Thông tin tài khoản (Bắt buộc)
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    // Step 2: Thông tin cá nhân & sở thích (Tùy chọn)
    address: "",
    gender: "", // Nam, Nữ, Khác
    age: "",
    height: "",
    weight: "",
    stylePreference: "",
  });

  const [step, setStep] = useState(1); // 1: Thông tin cơ bản, 2: Thông tin chi tiết
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genders = [
    { label: "Nam", value: "Male" },
    { label: "Nữ", value: "Female" },
    { label: "Khác", value: "Other" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Hàm xử lý Radio Button
  const handleGenderChange = (value) => {
    setFormData({ ...formData, gender: value });
    setErrors({ ...errors, gender: "" });
  };

  // --- VALIDATION TÁCH BIỆT THEO BƯỚC ---
  const validateStep1 = () => {
    let newErrors = {};

    // Kiểm tra trường trống
    if (!formData.fullname.trim()) newErrors.fullname = "Vui lòng nhập họ và tên.";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu.";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";

    // ✅ Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      newErrors.email = "Email không hợp lệ.";

    // ✅ Password (≥ 6 ký tự, có ký tự đặc biệt, ít nhất 1 số, 1 chữ hoa, 1 chữ thường)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(formData.password))
      newErrors.password = "Mật khẩu cần ≥ 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";

    // ✅ Confirm Password
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";

    // ✅ Phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Số điện thoại phải gồm 10 hoặc 11 chữ số.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation cho Step 2 (Chỉ cần kiểm tra trường có dữ liệu)
  const validateStep2 = () => {
    // Hiện tại không có trường nào bắt buộc, nhưng có thể thêm logic nếu cần
    return true;
  };
  // ------------------------------------

  const handleNextStep = (e) => {
    e.preventDefault();
    setServerError("");
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateStep2()) {
      return; // Dừng nếu Step 2 validation thất bại (nếu có)
    }

    if (!accepted) {
      setServerError("Bạn phải chấp nhận điều khoản trước khi đăng ký!");
      return;
    }

    // 3. Gọi API
    setIsSubmitting(true);
    try {
      // Xóa confirmPassword và các trường rỗng không cần thiết
      const dataToSubmit = Object.entries(formData).reduce((acc, [key, value]) => {
        if (key !== 'confirmPassword' && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      await axios.post("http://localhost:8080/api/auth/register", dataToSubmit, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      setServerError(err.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className="d-flex w-100" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div className="container d-flex flex-column justify-content-center">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto">
            <div className="text-center mt-4">
              <h1 className="h2">Create Account ({step}/2)</h1>
              <p className="lead">
                {step === 1 ? "Thông tin tài khoản cơ bản" : "Thông tin cá nhân (Tùy chọn)"}
              </p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <div className="m-sm-3">
                  <form onSubmit={step === 1 ? handleNextStep : handleSignup}>

                    {/* --- TAB 1: THÔNG TIN TÀI KHOẢN (CƠ BẢN) --- */}
                    {step === 1 && (
                      <>
                        {/* Fullname */}
                        <div className="mb-3">
                          <label className="form-label">Full name</label>
                          <input
                            className={`form-control form-control-lg ${errors.fullname ? "is-invalid" : ""}`}
                            type="text"
                            name="fullname"
                            placeholder="Enter your name"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                          />
                          {errors.fullname && <div className="invalid-feedback">{errors.fullname}</div>}
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        {/* Phone */}
                        <div className="mb-3">
                          <label className="form-label">Phone</label>
                          <input
                            className={`form-control form-control-lg ${errors.phone ? "is-invalid" : ""}`}
                            type="text"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                          <label className="form-label">Password</label>
                          <input
                            className={`form-control form-control-lg ${errors.password ? "is-invalid" : ""}`}
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-3">
                          <label className="form-label">Confirm Password</label>
                          <input
                            className={`form-control form-control-lg ${errors.confirmPassword ? "is-invalid" : ""}`}
                            type="password"
                            name="confirmPassword"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          {errors.confirmPassword && (
                            <div className="invalid-feedback">{errors.confirmPassword}</div>
                          )}
                        </div>

                        {/* Nút Tiếp tục */}
                        <div className="d-grid gap-2 mt-3">
                          <button type="submit" className="btn btn-lg btn-secondary">
                            Tiếp tục &rarr;
                          </button>
                        </div>
                      </>
                    )}


                    {/* --- TAB 2: THÔNG TIN CÁ NHÂN & SỞ THÍCH (TÙY CHỌN) --- */}
                    {step === 2 && (
                      <>
                        {/* Address */}
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input
                            className={`form-control form-control-lg ${errors.address ? "is-invalid" : ""}`}
                            type="text"
                            name="address"
                            placeholder="Địa chỉ liên hệ/nhận hàng"
                            value={formData.address}
                            onChange={handleChange}
                          />
                          {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                        </div>

                        {/* Gender - Radio Button */}
                        <div className="mb-3">
                          <label className="form-label d-block">Giới tính</label>
                          {genders.map((g) => (
                            <div className="form-check form-check-inline" key={g.value}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name="gender"
                                id={`gender-${g.value}`}
                                value={g.value}
                                checked={formData.gender === g.value}
                                onChange={() => handleGenderChange(g.value)}
                              />
                              <label className="form-check-label" htmlFor={`gender-${g.value}`}>
                                {g.label}
                              </label>
                            </div>
                          ))}
                        </div>

                        {/* Age, Height, Weight (Có thể đặt cạnh nhau trong layout nhỏ hơn) */}
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Tuổi</label>
                            <input type="number" name="age" className="form-control" placeholder="Tuổi" value={formData.age} onChange={handleChange} min="10" max="120" />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Chiều cao (cm)</label>
                            <input type="number" name="height" className="form-control" placeholder="cm" value={formData.height} onChange={handleChange} min="50" max="250" />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Cân nặng (kg)</label>
                            <input type="number" name="weight" className="form-control" placeholder="kg" value={formData.weight} onChange={handleChange} min="10" max="300" />
                          </div>
                        </div>

                        {/* Style Preference */}
                        <div className="mb-3">
                          <label className="form-label">Phong cách yêu thích</label>
                          <textarea
                            className="form-control"
                            name="stylePreference"
                            rows="3"
                            placeholder="Dễ thương, Lịch lãm, Trẻ trung..."
                            value={formData.stylePreference}
                            onChange={handleChange}
                          ></textarea>
                        </div>

                        {/* Checkbox Accept Terms */}
                        <div className="form-check mb-3">
                          <input
                            id="Accept"
                            type="checkbox"
                            className="form-check-input"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="Accept">
                            Accept our Terms and Conditions.
                          </label>
                        </div>

                        {/* Server Error */}
                        {serverError && (
                          <p className="text-danger text-center">{serverError}</p>
                        )}

                        {/* Submit Button & Back Button */}
                        <div className="d-flex justify-content-between gap-2 mt-3">
                          <button type="button" className="btn btn-lg btn-light" onClick={() => setStep(1)}>
                            &larr; Quay lại
                          </button>
                          <button type="submit" className="btn btn-lg btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Đang đăng ký..." : "Hoàn tất đăng ký"}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <div className="text-center mb-3">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}