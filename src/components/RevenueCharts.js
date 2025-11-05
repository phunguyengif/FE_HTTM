import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const RevenueCharts = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2];



    const token = localStorage.getItem("token");

    // Lấy dữ liệu theo năm được chọn
    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:8080/api/revenue/categoryYearMoney", {
                    params: { year },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu doanh thu:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, [year]);

    // Khi đang tải
    if (loading) return <p>Đang tải dữ liệu...</p>;
    // Khi không có dữ liệu
    if (!data.length) return <p>Không có dữ liệu doanh thu cho năm {year}.</p>;

    // Chuẩn bị dữ liệu biểu đồ
    const labels = data.map((item) => item.categoryName);
    const values = data.map((item) => item.totalMoney);

    const barData = {
        labels,
        datasets: [
            {
                label: "Doanh thu (VNĐ)",
                data: values,
                backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
            },
        ],
    };

    const pieData = {
        labels,
        datasets: [
            {
                label: "Tỉ lệ doanh thu",
                data: values,
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: `Doanh thu theo danh mục - Năm ${year}` },
        },
    };

    return (
        <div className="container mt-4">
            {/* Header + Chọn năm */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <label className="me-2 fw-semibold">Chọn năm:</label>
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

            {/* Hai biểu đồ */}
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-50">
                        <div className="card-header bg-light fw-bold">Biểu đồ cột</div>
                        <div className="card-body d-flex justify-content-center align-items-center" style={{ height: "800px" }}>
                            <Bar data={barData} options={options} />
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-50">
                        <div className="card-header bg-light fw-bold">Biểu đồ tròn</div>
                        <div className="card-body d-flex justify-content-center align-items-center" style={{ height: "800px" }}>
                            <Pie data={pieData} options={options} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueCharts;
