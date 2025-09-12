import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import VehicleStore from '../../stores/VehicleStore';

const MyVehicles = observer(() => {
    useEffect(() => {
        VehicleStore.loadMyVehicles();
        return () => VehicleStore.clearMessages();
    }, []);

    const handleDelete = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            await VehicleStore.deleteVehicle(id);
        }
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
        } else if (quantity <= 5) {
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
                        <Button as={Link} to="/vehicles/new" variant="primary">
                            <i className="bi bi-plus-lg me-1"></i>
                            Add New Vehicle
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Messages */}
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
                                <i className="bi bi-box fs-1 text-muted mb-3 d-block"></i>
                                <h4>No vehicles yet</h4>
                                <p className="text-muted mb-4">
                                    You haven't created any vehicles yet. Start by adding your first vehicle!
                                </p>
                                <Button as={Link} to="/vehicles/new" variant="primary">
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Add Your First Vehicle
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Row>
                            {/* Desktop Table View */}
                            <Col className="d-none d-md-block">
                                <Card>
                                    <Card.Body className="p-0">
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
                                                            {vehicle.imageUrl && (
                                                                <img
                                                                    src={vehicle.imageUrl}
                                                                    alt={vehicle.title}
                                                                    className="rounded me-2"
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="fw-bold">{vehicle.title}</div>
                                                                {vehicle.brand && vehicle.model && (
                                                                    <small className="text-muted">
                                                                        {vehicle.brand} {vehicle.model}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg="secondary">
                                                            {vehicle.type?.charAt(0).toUpperCase() + vehicle.type?.slice(1)}
                                                        </Badge>
                                                    </td>
                                                    <td className="fw-bold">{formatPrice(vehicle.price)}</td>
                                                    <td>{getStockBadge(vehicle.quantity)}</td>
                                                    <td>
                                                        <i className="bi bi-heart me-1"></i>
                                                        {vehicle.followersCount || 0}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <Button
                                                                as={Link}
                                                                to={`/vehicles/${vehicle.id}`}
                                                                variant="outline-primary"
                                                                size="sm"
                                                                title="View"
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </Button>
                                                            <Button
                                                                as={Link}
                                                                to={`/vehicles/${vehicle.id}/edit`}
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                title="Edit"
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                title="Delete"
                                                                onClick={() => handleDelete(vehicle.id, vehicle.title)}
                                                                disabled={VehicleStore.isLoading}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Mobile Card View */}
                            <Col className="d-md-none">
                                {VehicleStore.myVehicles.map(vehicle => (
                                    <Card key={vehicle.id} className="mb-3">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Badge bg="secondary">
                                                    {vehicle.type?.charAt(0).toUpperCase() + vehicle.type?.slice(1)}
                                                </Badge>
                                                {getStockBadge(vehicle.quantity)}
                                            </div>

                                            <Card.Title className="h5 mb-2">{vehicle.title}</Card.Title>

                                            {vehicle.brand && vehicle.model && (
                                                <p className="text-muted mb-2">
                                                    {vehicle.brand} {vehicle.model}
                                                </p>
                                            )}

                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <strong className="text-primary fs-5">{formatPrice(vehicle.price)}</strong>
                                                <small className="text-muted">
                                                    <i className="bi bi-heart me-1"></i>
                                                    {vehicle.followersCount || 0} followers
                                                </small>
                                            </div>

                                            <div className="d-flex gap-1">
                                                <Button
                                                    as={Link}
                                                    to={`/vehicles/${vehicle.id}`}
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="flex-fill"
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    View
                                                </Button>
                                                <Button
                                                    as={Link}
                                                    to={`/vehicles/${vehicle.id}/edit`}
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="flex-fill"
                                                >
                                                    <i className="bi bi-pencil me-1"></i>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(vehicle.id, vehicle.title)}
                                                    disabled={VehicleStore.isLoading}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </Col>
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
});

export default MyVehicles;
