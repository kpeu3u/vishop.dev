import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import VehicleStore from '../../stores/VehicleStore';
import { useAuth } from '../../contexts/AuthContext';

const VehicleDetail = observer(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            VehicleStore.loadVehicle(parseInt(id));
        }
        return () => {
            VehicleStore.clearCurrentVehicle();
            VehicleStore.clearMessages();
        };
    }, [id]);

    const handleFollow = async () => {
        await VehicleStore.followVehicle(parseInt(id));
    };

    const handleUnfollow = async () => {
        await VehicleStore.unfollowVehicle(parseInt(id));
    };

    const handleEdit = () => {
        navigate(`/vehicles/${id}/edit`);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            const result = await VehicleStore.deleteVehicle(parseInt(id));
            if (result.success) {
                navigate('/my-vehicles');
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'car': return 'bi-car-front';
            case 'motorcycle': return 'bi-bicycle';
            case 'truck': return 'bi-truck';
            case 'trailer': return 'bi-truck-flatbed';
            case 'cart': return 'bi-minecart';
            default: return 'bi-car-front';
        }
    };

    const getTypeVariant = (type) => {
        switch (type) {
            case 'car': return 'primary';
            case 'motorcycle': return 'success';
            case 'truck': return 'warning';
            case 'trailer': return 'info';
            case 'cart': return 'secondary';
            default: return 'secondary';
        }
    };

    const renderVehicleSpecificFields = (vehicle) => {
        switch (vehicle.type) {
            case 'car':
                return (
                    <>
                        {vehicle.colour && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Colour:</strong>
                                <span>{vehicle.colour}</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.engineCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Engine Capacity:</strong>
                                <span>{vehicle.engineCapacity}L</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.permittedMaximumMass > 0 && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Permitted Maximum Mass:</strong>
                                <span>{vehicle.permittedMaximumMass} kg.</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.numberOfDoors && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Number of Doors:</strong>
                                <span>{vehicle.numberOfDoors}</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.category && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Category:</strong>
                                <span>{vehicle.category.charAt(0).toUpperCase() + vehicle.category.slice(1)}</span>
                            </ListGroup.Item>
                        )}
                    </>
                );

            case 'motorcycle':
                return (
                    <>
                        {vehicle.colour && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Colour:</strong>
                                <span>{vehicle.colour}</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.engineCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Engine Capacity:</strong>
                                <span>{vehicle.engineCapacity}L</span>
                            </ListGroup.Item>
                        )}
                    </>
                );

            case 'truck':
                return (
                    <>
                        {vehicle.colour && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Colour:</strong>
                                <span>{vehicle.colour}</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.engineCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Engine Capacity:</strong>
                                <span>{vehicle.engineCapacity}L</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.permittedMaximumMass > 0 && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Permitted Maximum Mass:</strong>
                                <span>{vehicle.permittedMaximumMass} kg.</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.numberOfBeds && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Number of Beds:</strong>
                                <span>{vehicle.numberOfBeds}</span>
                            </ListGroup.Item>
                        )}
                    </>
                );

            case 'trailer':
                return (
                    <>
                        {vehicle.numberOfAxles && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Number of Axles:</strong>
                                <span>{vehicle.numberOfAxles}</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.loadCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Load Capacity:</strong>
                                <span>{vehicle.loadCapacity.toLocaleString()} kg</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.permittedMaximumMass > 0 && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Permitted Maximum Mass:</strong>
                                <span>{vehicle.permittedMaximumMass} kg.</span>
                            </ListGroup.Item>
                        )}
                    </>
                );
            case 'cart':
                return (
                    <>
                        {vehicle.colour && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Colour:</strong>
                                <span>{vehicle.colour}</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.loadCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Load Capacity:</strong>
                                <span>{vehicle.loadCapacity.toLocaleString()} kg</span>
                            </ListGroup.Item>
                        )}
                        {vehicle.permittedMaximumMass > 0 && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Permitted Maximum Mass:</strong>
                                <span>{vehicle.permittedMaximumMass} kg.</span>
                            </ListGroup.Item>
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    if (VehicleStore.isLoading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading vehicle...</p>
            </Container>
        );
    }

    if (VehicleStore.error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    {VehicleStore.error}
                </Alert>
                <Button as={Link} to="/vehicles" variant="primary">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Vehicles
                </Button>
            </Container>
        );
    }

    const vehicle = VehicleStore.currentVehicle;

    if (!vehicle) {
        return (
            <Container className="my-5 text-center">
                <h4>Vehicle not found</h4>
                <Button as={Link} to="/vehicles" variant="primary">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Vehicles
                </Button>
            </Container>
        );
    }

    const isOwner = user && vehicle.merchant && user.id === vehicle.merchant.id;
    const canFollow = user && user.roles.includes('ROLE_BUYER') && !isOwner;

    return (
        <Container className="my-4">
            {/* Back Button */}
            <div className="mb-3">
                <Button as={Link} to="/vehicles" variant="outline-secondary" size="sm">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Vehicles
                </Button>
            </div>

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

            <Row>
                {/* Vehicle Image */}
                <Col md={6}>
                    <Card>
                        {vehicle.imageUrl ? (
                            <Card.Img
                                variant="top"
                                src={vehicle.imageUrl}
                                style={{ height: '400px', objectFit: 'cover' }}
                                alt={vehicle.title}
                            />
                        ) : (
                            <div
                                className="d-flex align-items-center justify-content-center bg-light"
                                style={{ height: '400px' }}
                            >
                                <i className={`bi ${getTypeIcon(vehicle.type)} text-muted`} style={{ fontSize: '4rem' }}></i>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Vehicle Details */}
                <Col md={6}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg={getTypeVariant(vehicle.type)} className="mb-2">
                            <i className={`bi ${getTypeIcon(vehicle.type)} me-1`}></i>
                            {vehicle.type?.charAt(0).toUpperCase() + vehicle.type?.slice(1)}
                        </Badge>

                        {vehicle.quantity === 0 && (
                            <Badge bg="danger">Out of Stock</Badge>
                        )}
                        {vehicle.quantity > 0 && vehicle.quantity <= 5 && (
                            <Badge bg="warning">Low Stock</Badge>
                        )}
                    </div>

                    <h1 className="mb-3">{vehicle.title}</h1>

                    <div className="mb-4">
                        <h2 className="text-primary mb-0">{formatPrice(vehicle.price)}</h2>
                    </div>

                    {vehicle.brand && vehicle.model && (
                        <div className="mb-3">
                            <h5 className="text-muted">
                                <strong>{vehicle.brand}</strong> {vehicle.model}
                            </h5>
                        </div>
                    )}

                    {/* Specifications */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Specifications</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {vehicle.brand && (
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Brand:</strong>
                                    <span>{vehicle.brand}</span>
                                </ListGroup.Item>
                            )}
                            {vehicle.model && (
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Model:</strong>
                                    <span>{vehicle.model}</span>
                                </ListGroup.Item>
                            )}
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Type:</strong>
                                <span>{vehicle.type?.charAt(0).toUpperCase() + vehicle.type?.slice(1)}</span>
                            </ListGroup.Item>
                            {renderVehicleSpecificFields(vehicle)}
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Quantity:</strong>
                                <span>{vehicle.quantity}</span>
                            </ListGroup.Item>
                            {vehicle.followersCount !== undefined && (
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Followers:</strong>
                                    <span>{vehicle.followersCount}</span>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>

                    {/* Merchant Info */}
                    <Card className="mb-4">
                        <Card.Body>
                            <h5>Seller Information</h5>
                            <p className="mb-0">
                                <i className="bi bi-person me-2"></i>
                                <strong>{vehicle.merchant?.fullName || 'Merchant'}</strong>
                            </p>
                        </Card.Body>
                    </Card>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                        {isOwner && (
                            <div className="d-flex gap-2">
                                <Button
                                    variant="primary"
                                    onClick={handleEdit}
                                    className="flex-fill"
                                >
                                    <i className="bi bi-pencil me-1"></i>
                                    Edit Vehicle
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    onClick={handleDelete}
                                    disabled={VehicleStore.isLoading}
                                >
                                    <i className="bi bi-trash me-1"></i>
                                    Delete
                                </Button>
                            </div>
                        )}

                        {canFollow && (
                            <>
                                {vehicle.isFollowed ? (
                                    <Button
                                        variant="outline-danger"
                                        onClick={handleUnfollow}
                                        disabled={VehicleStore.isLoading}
                                    >
                                        <i className="bi bi-heart-fill me-1"></i>
                                        Unfollow Vehicle
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={handleFollow}
                                        disabled={VehicleStore.isLoading}
                                    >
                                        <i className="bi bi-heart me-1"></i>
                                        Follow Vehicle
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
});

export default VehicleDetail;
