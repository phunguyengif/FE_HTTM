import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import MenuBar from '../components/MenuBar';

// 1. Import các component của React Bootstrap
import {
    Container,
    Button,
    Form,
    Table,
    Spinner,
    Alert,
    Row,
    Col,
    Card
} from 'react-bootstrap';

const DiscountList = () => {
    // --- PHẦN LOGIC (GIỮ NGUYÊN HOÀN TOÀN) ---
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newDiscount, setNewDiscount] = useState({
        code: '',
        description: '',
        discountPercentage: '',
        startDate: '',
        endDate: '',
    });
    const [showForm, setShowForm] = useState(false);
    const token = localStorage.getItem('token');

    const fetchDiscounts = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/discount/available', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0',
                },
            });
            setDiscounts(response.data);
        } catch (err) {
            setError('Failed to fetch discounts.');
        } finally {
            if (loading) setLoading(false);
        }
    }, [token, loading]);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDiscount(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDiscount = async (e) => {
        e.preventDefault();
        try {
            const discountPayload = {
                code: newDiscount.code,
                description: newDiscount.description,
                discountPercentage: parseFloat(newDiscount.discountPercentage),
                startDate: newDiscount.startDate,
                endDate: newDiscount.endDate,
            };
            await axios.post(
                'http://localhost:8080/api/discount/add',
                discountPayload,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            await fetchDiscounts();
            setNewDiscount({
                code: '', description: '', discountPercentage: '', startDate: '', endDate: '',
            });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add discount.');
        }
    };

    // --- PHẦN GIAO DIỆN (ĐÃ THIẾT KẾ LẠI VỚI BOOTSTRAP) ---

    // 2. Giao diện Loading
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <Spinner animation="border" variant="primary" />
            <span className="ms-3 fs-5 text-muted">Đang tải dữ liệu...</span>
        </div>
    );

    // 3. Giao diện Lỗi
    if (error) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <Alert variant="danger" className="shadow-sm">
                <Alert.Heading>Đã xảy ra lỗi!</Alert.Heading>
                <p>{error}</p>
            </Alert>
        </div>
    );

    // 4. Giao diện chính
    return (
        <div className="bg-light min-vh-100">
            <MenuBar />
            <article>
                <Container className="py-4 py-md-5">
                    <div className="bg-white p-4 p-md-5 rounded-3 shadow-sm">
                        <h1 className="h2 mb-4 fw-bold text-dark">Quản lý Mã giảm giá</h1>

                        <Button
                            variant={showForm ? 'danger' : 'primary'}
                            onClick={() => setShowForm(!showForm)}
                            className="mb-4 px-4 py-2"
                        >
                            {showForm ? 'Hủy thêm mã' : 'Thêm mã giảm giá mới'}
                        </Button>

                        {showForm && (
                            <Card className="mb-4 shadow-sm bg-light border-0">
                                <Card.Body>
                                    <h2 className="h5 mb-3 fw-semibold">Thông tin mã giảm giá mới</h2>
                                    <Form onSubmit={handleAddDiscount}>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Floating>
                                                    <Form.Control
                                                        type="text" id="code" placeholder="Code"
                                                        name="code" value={newDiscount.code}
                                                        onChange={handleInputChange} required
                                                    />
                                                    <Form.Label htmlFor="code">Mã giảm giá (Code)</Form.Label>
                                                </Form.Floating>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Floating>
                                                    <Form.Control
                                                        type="text" id="description" placeholder="Description"
                                                        name="description" value={newDiscount.description}
                                                        onChange={handleInputChange} required
                                                    />
                                                    <Form.Label htmlFor="description">Mô tả</Form.Label>
                                                </Form.Floating>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Floating>
                                                    <Form.Control
                                                        type="number" id="discountPercentage" placeholder="Discount Percentage"
                                                        name="discountPercentage" value={newDiscount.discountPercentage}
                                                        onChange={handleInputChange} step="0.01" required
                                                    />
                                                    <Form.Label htmlFor="discountPercentage">Phần trăm giảm giá (%)</Form.Label>
                                                </Form.Floating>
                                            </Col>
                                            <Col md={6}></Col> {/* Trống để 2 input ngày ở dưới */}
                                            <Col md={6}>
                                                <Form.Floating>
                                                    <Form.Control
                                                        type="date" id="startDate" placeholder="Start Date"
                                                        name="startDate" value={newDiscount.startDate}
                                                        onChange={handleInputChange} required
                                                    />
                                                    <Form.Label htmlFor="startDate">Ngày bắt đầu</Form.Label>
                                                </Form.Floating>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Floating>
                                                    <Form.Control
                                                        type="date" id="endDate" placeholder="End Date"
                                                        name="endDate" value={newDiscount.endDate}
                                                        onChange={handleInputChange} required
                                                    />
                                                    <Form.Label htmlFor="endDate">Ngày kết thúc</Form.Label>
                                                </Form.Floating>
                                            </Col>
                                        </Row>
                                        <Button variant="success" type="submit" className="mt-4 px-4 py-2">
                                            Thêm mã giảm giá
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        )}

                        <h2 className="h5 mb-3 fw-semibold border-top pt-4">Danh sách mã hiện có</h2>
                        <div className="table-responsive rounded-3 shadow-sm border">
                            <Table striped bordered hover className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Mã</th>
                                        <th>Mô tả</th>
                                        <th>Giảm (%)</th>
                                        <th>Bắt đầu</th>
                                        <th>Kết thúc</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-4">
                                                Không có mã giảm giá nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        discounts.map((discount) => (
                                            <tr key={discount.id}>
                                                <td className="fw-medium">{discount.code}</td>
                                                <td>{discount.description}</td>
                                                <td>{discount.discountPercentage}%</td>
                                                <td>{new Date(discount.startDate).toLocaleDateString('vi-VN')}</td>
                                                <td>{new Date(discount.endDate).toLocaleDateString('vi-VN')}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Container>
            </article>
        </div>
    );
};

export default DiscountList;