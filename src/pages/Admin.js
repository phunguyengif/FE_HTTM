import MenuBar from "../components/MenuBar";
import TotalProducts from "../components/TotalProducts";
import TotalDiscounts from "../components/TotalDiscounts";
import RevenuesComponent from "../components/RevenuesComponent";
import TotalOrders from "../components/TotalOrders";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import RevenueCharts from "../components/RevenueCharts";

const Admin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa dữ liệu đăng nhập
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Chuyển đến trang đăng nhập
    navigate("/login");
  }

  return (
    <div>
      <MenuBar />
      <article>
        <div class="container-fluid py-2">
          <div class="row">

            <div class="d-flex align-items-center justify-content-between ms-3 mb-4">
              <div className="d-flex align-items-center mb-3">
                <h3 className="h4 font-weight mb-0 me-3">Dashboard</h3>

                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="Search..."
                    style={{
                      borderRadius: "30px",
                      paddingRight: "40px",
                      backgroundColor: "#f8f9fa",
                      width: "220px",
                      transition: "width 0.3s ease",
                      cursor: "text",
                    }}
                  />
                  <i
                    className="fa fa-search position-absolute"
                    style={{
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "gray",
                      pointerEvents: "none",
                      cursor: "pointer",
                    }}
                  ></i>
                </div>
              </div>



              <div class="nav-item dropdown">
                <a
                  class="nav-link p-0 border-0 bg-transparent"
                  href="#"
                  data-bs-toggle="dropdown"
                >
                  <img
                    src="https://i.pravatar.cc/40"
                    class="avatar img-fluid rounded-circle"
                    alt="User"
                  />
                </a>

                <div class="dropdown-menu dropdown-menu-end shadow">
                  <a class="dropdown-item" href="/Profile">Profile</a>
                  <a class="dropdown-item" href="#">Settings</a>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item" onClick={handleLogout}>Log out</button>
                </div>
              </div>
            </div>
            <div class="col-xl-4 col-sm-6 mb-5">
              <div class="card">
                <div class="card-header p-2 ps-3">
                  <div class="d-flex justify-content-between">
                    <div>
                      <p class="text-sm mb-0 text-capitalize">Total Product</p>
                      <h4 class="mb-0"><TotalProducts /></h4>
                    </div>
                    <div >
                      <i style={{ fontSize: "30px" }} class="fa-solid fa-user"></i>

                    </div>
                  </div>
                </div>
                <div class="horizontal-line"></div>
              </div>
            </div>
            <div class="col-xl-4 col-sm-6 mb-5">
              <div class="card">
                <div class="card-header p-2 ps-3">
                  <div class="d-flex justify-content-between">
                    <div>
                      <p class="text-sm mb-0 text-capitalize">Orders List</p>
                      <h4 class="mb-0"><TotalOrders /></h4>
                    </div>
                    <div >
                      <i style={{ fontSize: "30px" }} class="fa-solid fa-chart-simple"></i>
                    </div>
                  </div>
                </div>
                <div class="horizontal-line"></div>
              </div>
            </div>
            <div class="col-xl-4 col-sm-6 mb-5">
              <div class="card">
                <div class="card-header p-2 ps-3">
                  <div class="d-flex justify-content-between">
                    <div>
                      <p class="text-sm mb-0 text-capitalize">Total Discounts</p>
                      <h4 class="mb-0"><TotalDiscounts /></h4>
                    </div>
                    <div >
                      <i style={{ fontSize: "30px" }} class="fa-solid fa-bag-shopping"></i>
                    </div>
                  </div>
                </div>
                <div class="horizontal-line"></div>
              </div>
            </div>
          </div>
          <div className="row">
            <main className="content">
              <div className="container-fluid p-0">
                <div className="mb-3">
                  <h1 className="h3 d-inline align-middle">Biểu đồ doanh thu</h1>
                </div>

                {/* Hiển thị biểu đồ */}
                <RevenueCharts />
              </div>
            </main>
          </div>
        </div>

        <div class="container-fluid">
          <div >
          </div>
        </div>

      </article>
    </div>
  );

};

export default Admin;
