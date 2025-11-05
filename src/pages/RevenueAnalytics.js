import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import MenuBar from "../components/MenuBar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
   Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const token = localStorage.getItem("token");

const RevenueAnalytics = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [yearChartData, setYearChartData] = useState({ labels: [], datasets: [] });
  const [monthChartData, setMonthChartData] = useState({ labels: [], datasets: [] });
  const [monthlyOrderData, setMonthlyOrderData] = useState({ labels: [], datasets: [] });

  const yearChartRef = useRef(null);
  const orderChartRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  // ===== BIỂU ĐỒ DOANH THU NĂM (LINE) =====
  useEffect(() => {
    const fetchYearlyRevenue = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/revenue/categoryYearMoney`,
          {
            params: { year },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;

        const labels = data.map((item) => item.categoryName);
        const values = data.map((item) => item.totalMoney);

        // Gradient fill
        const chart = yearChartRef.current;
        let gradient = "rgba(75,192,192,0.2)";
        if (chart) {
          const ctx = chart.ctx;
          gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(33,150,243,0.4)");
          gradient.addColorStop(1, "rgba(33,150,243,0.05)");
        }

        setYearChartData({
          labels,
          datasets: [
            {
              label: `Doanh thu năm ${year}`,
              data: values,
              borderColor: "#2196F3",
              backgroundColor: gradient,
              tension: 0.4,
              fill: true,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: "#2196F3",
            },
          ],
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu doanh thu năm:", error);
      }
    };

    fetchYearlyRevenue();
  }, [year]);

  // ===== BIỂU ĐỒ DOANH THU THEO THÁNG (BAR NGANG) =====
  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/revenue/categoryMonthMoney`,
          {
            params: { year, month },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;

        const labels = data.map((item) => item.categoryName);
        const values = data.map((item) => item.totalMoney);

        setMonthChartData({
          labels,
          datasets: [
            {
              label: `Doanh thu tháng ${month}/${year}`,
              data: values,
              backgroundColor: "#4BC0C0",
              borderRadius: 8,
            },
          ],
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu doanh thu tháng:", error);
      }
    };

    fetchMonthlyRevenue();
  }, [year, month]);

  // ===== BIỂU ĐỒ ĐƯỜNG THEO TRẠNG THÁI ĐƠN HÀNG / THÁNG =====
  useEffect(() => {
    const fetchMonthlyOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/revenue/monthlyOrderStatus`,
          {
            params: { year },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;

        const labels = data.map((item) => `${item.month}`);
        const values = data.map((item) => item.totalOrder);

         // Gradient fill
        const chart = orderChartRef.current;
        let gradient = "rgba(255,99,132,0.2)";
        if (chart) {
          const ctx = chart.ctx;
          gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(255,99,132,0.4)");
          gradient.addColorStop(1, "rgba(255,99,132,0.05)");
        }

        setMonthlyOrderData({
          labels,
          datasets: [
            {
              label: `Số đơn hàng (${year})`,
              data: values,
              borderColor: "#FF6384",
              backgroundColor: gradient,
              tension: 0.4,
              fill: true,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: "#FF6384",
            },
          ],
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu đơn hàng theo tháng:", error);
      }
    };

    fetchMonthlyOrders();
  }, [year]);

  // ===== OPTIONS =====
   const defaultTooltip = {
    backgroundColor: "rgba(255,255,255,0.9)",
    titleColor: "#333",
    bodyColor: "#333",
    borderColor: "#ddd",
    borderWidth: 1,
    titleFont: { weight: "bold" },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", tooltip: defaultTooltip  },
      title: { display: true, text: `Doanh thu theo thương hiệu - Năm ${year}` },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#555" }, title: { display: true, text: "Doanh thu (VNĐ)" } },
      x: { title: { display: true, text: "Thương hiệu" }, ticks: { color: "#555" } },
    },
  };

  const barOptions = {
    indexAxis: "y", // nằm ngang
    responsive: true,
    plugins: {
      legend: { position: "top", tooltip: defaultTooltip },
      title: {
        display: true,
        text: `Doanh thu theo danh mục - Tháng ${month}/${year}`,
      },
    },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: "Doanh thu (VNĐ)" }, ticks: { color: "#555" } },
      y: { title: { display: true, text: "Danh mục" }, ticks: { color: "#555" } },
    },
  };

  const monthlyLineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", tooltip: defaultTooltip },
      title: { display: true, text: `Số đơn hàng theo tháng (${year})` },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Số đơn hàng" }, ticks: { color: "#555" } },
      x: { title: { display: true, text: "Tháng" }, ticks: { color: "#555" } },
    },
  };

  return (
    <div>
      <MenuBar />
      <article>
        <div className="container-fluid py-2">
          <div className="row">
            {/* ===== BIỂU ĐỒ LINE THEO NĂM ===== */}
            <div className="col-12 mb-5">
              <div className="card shadow-sm">
                <div className="card-header p-2 ps-3 d-flex justify-content-between align-items-center">
                  <p className="fw-bold mb-0">Doanh thu theo thương hiệu (năm)</p>
                  <div>
                    <label className="me-2">Chọn năm:</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="form-select d-inline-block w-auto"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ height: "400px" }}>
                    <Line ref={yearChartRef} data={yearChartData} options={lineOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== BIỂU ĐỒ CỘT + ĐƯỜNG THEO THÁNG (2 NỬA) ===== */}
            <div className="col-12">
              <div className="row">
                {/* BAR NGANG */}
                <div className="col-md-6 mb-5">
                  <div className="card shadow-sm h-100">
                    <div className="card-header p-2 ps-3 d-flex justify-content-between align-items-center">
                      <p className="fw-bold mb-0">Doanh thu theo danh mục (tháng)</p>
                      <div>
                        <label className="me-2">Tháng:</label>
                        <select
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          className="form-select d-inline-block w-auto"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="card-body">
                      <div style={{ height: "400px" }}>
                        <Bar data={monthChartData} options={barOptions} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* LINE BIỂU ĐỒ ĐƠN HÀNG THEO THÁNG */}
                <div className="col-md-6 mb-5">
                  <div className="card shadow-sm h-100">
                    <div className="card-header p-2 ps-3">
                      <p className="fw-bold mb-0">
                        Số lượng đơn hàng theo tháng ({year})
                      </p>
                    </div>
                    <div className="card-body">
                      <div style={{ height: "400px" }}>
                        <Line ref={orderChartRef} data={monthlyOrderData} options={monthlyLineOptions} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default RevenueAnalytics;
