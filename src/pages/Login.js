import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import loginImage from "../assets/images/img-login.svg";
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/Admin");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorEmail("");
    setErrorPassword("");
    setServerError("");

    // Kiểm tra hợp lệ trước khi gửi request
    let valid = true;

    // Regex email bắt buộc .com
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

    if (!email) {
      setErrorEmail("Vui lòng nhập email");
      valid = false;
    } else if (!emailRegex.test(email)) {
      setErrorEmail("Email không hợp lệ (phải có đuôi .com)");
      valid = false;
    }

    if (!password) {
      setErrorPassword("Vui lòng nhập mật khẩu");
      valid = false;
    }

    if (!valid) return;

    // Gửi request đăng nhập
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/Admin");
    } catch (err) {
      setServerError(err.response?.data?.message || "Đăng nhập thất bại!");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main className="d-flex w-100" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <div className="container d-flex flex-column justify-content-center">
          <div className="row justify-content-center">
            <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 mt-0">
              <div className="text-center mt-0">
                <h1 className="h2">Welcome back!</h1>
                <p className="lead">Sign in to your account to continue</p>
              </div>

              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <img
                      src={loginImage}
                      alt="Login"
                      style={{ width: "150px", height: "150px" }}
                    />
                  </div>

                  <form onSubmit={handleLogin}>
                    {serverError && (
                      <p className="text-danger text-center fw-bold">{serverError}</p>
                    )}

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control form-control-lg"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {errorEmail && <div className="text-danger small mt-1">{errorEmail}</div>}
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        className="form-control form-control-lg"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {errorPassword && <div className="text-danger small mt-1">{errorPassword}</div>}
                    </div>

                    <div className="form-check mb-3">
                      <input
                        id="remember"
                        type="checkbox"
                        className="form-check-input"
                        defaultChecked
                      />
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="form-check-label" htmlFor="remember">
                          Remember me
                        </label>

                        {/* <Link
                          to="/forgot-password"
                          className="text-decoration-none text-primary fw-semibold"
                        >
                          Forgot Password?
                        </Link> */}
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-lg btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Đang đăng nhập..." : "Sign in"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="text-center mt-3 mb-3">
                Don't have an account?{" "}
                <Link to="/register" className="fw-bold text-decoration-none">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
