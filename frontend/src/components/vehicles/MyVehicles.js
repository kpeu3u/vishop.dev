import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table, Badge, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import VehicleStore from '../../stores/VehicleStore';
import Pagination from '../common/Pagination';

const MyVehicles = observer(() => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        VehicleStore.loadMyVehicles(1, pageSize);
        return () => VehicleStore.clearMessages();
    }, [pageSize]);

    const handleDelete = async (id, vehicleName) => {
        if (window.confirm(`Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`)) {
            const result = await VehicleStore.deleteVehicle(id);
            if (result.success) {
                // Reload current page or go to previous page if current page is empty
                const pagination = VehicleStore.pagination.myVehicles;
                if (pagination && VehicleStore.myVehicles.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                    VehicleStore.loadMyVehicles(currentPage - 1, pageSize);
                } else {
                    VehicleStore.loadMyVehicles(currentPage, pageSize);
                }
            }
        }
    };

    const handlePageChange = async (page) => {
        setCurrentPage(page);
        await VehicleStore.loadMyVehicles(page, pageSize);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        VehicleStore.loadMyVehicles(1, newPageSize);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    const getStockBadge = (quantity) => {
        if (quantity === 0) {
            return <Badge bg="danger">Out of Stock</Badge>;
        } else if (quantity < 5) {
            return <Badge bg="warning">Low Stock ({quantity})</Badge>;
        } else {
            return <Badge bg="success">In Stock ({quantity})</Badge>;
        }
    };

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>My Vehicles</h2>
                        <Button 
                            variant="primary" 
                            as={Link} 
                            to="/vehicles/new"
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add New Vehicle
                        </Button>
                    </div>
                </Col>
            </Row>

            {VehicleStore.error && (
                <Alert variant="danger" dismissible onClose={() => VehicleStore.clearMessages()}>
                    {VehicleStore.error}
                </Alert>
            )}

            {VehicleStore.successMessage && (
                <Alert variant="success" dismissible onClose={() => VehicleStore.clearMessages()}>
                    {VehicleStore.successMessage}
                </Alert>
            )}

            {VehicleStore.isLoading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Loading your vehicles...</p>
                </div>
            ) : (
                <>
                    {VehicleStore.myVehicles.length === 0 ? (
                        <Card className="text-center py-5">
                            <Card.Body>
                                <i className="bi bi-car-front fs-1 text-muted mb-3 d-block"></i>
                                <h4>No vehicles found</h4>
                                <p className="text-muted mb-4">
                                    You haven't added any vehicles yet. Start by adding your first vehicle!
                                </p>
                                <Button 
                                    variant="primary" 
                                    as={Link} 
                                    to="/vehicles/new"
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Add Your First Vehicle
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <p className="text-muted mb-0">
                                        {VehicleStore.pagination.myVehicles?.totalResults || VehicleStore.myVehicles.length} vehicle
                                        {(VehicleStore.pagination.myVehicles?.totalResults || VehicleStore.myVehicles.length) !== 1 ? 's' : ''} total
                                    </p>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="me-2 text-muted">Show:</span>
                                    <Form.Select 
                                        size="sm" 
                                        style={{ width: 'auto' }}
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                    >
                                        <option value={5}>5 per page</option>
                                        <option value={10}>10 per page</option>
                                        <option value={25}>25 per page</option>
                                        <option value={50}>50 per page</option>
                                    </Form.Select>
                                </div>
                            </div>

                            <Card>
                                <Table responsive hover className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Vehicle</th>
                                            <th>Type</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Followers</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {VehicleStore.myVehicles.map(vehicle => (
                                            <tr key={vehicle.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div>
                                                            <div className="fw-bold">
                                                                {vehicle.brand} {vehicle.model}
                                                            </div>
                                                            <small className="text-muted">
                                                                Year: {vehicle.year}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary" className="text-capitalize">
                                                        {vehicle.type}
                                                    </Badge>
                                                </td>
                                                <td className="fw-bold">
                                                    {formatPrice(vehicle.price)}
                                                </td>
                                                <td>
                                                    {getStockBadge(vehicle.quantity)}
                                                </td>
                                                <td>
                                                    <i className="bi bi-heart me-1"></i>
                                                    {vehicle.followersCount || 0}
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                                                            title="View Details"
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </Button>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
                                                            title="Edit Vehicle"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                                                            title="Delete Vehicle"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card>

                            {/* Pagination */}
                            {VehicleStore.pagination.myVehicles && (
                                <Pagination
                                    paginationData={VehicleStore.pagination.myVehicles}
                                    onPageChange={handlePageChange}
                                    className="mt-4"
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </Container>
    );
});

export default MyVehicles;
