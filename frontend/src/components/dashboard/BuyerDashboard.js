import React from 'react';
import { Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import vehicleStore from '../../stores/VehicleStore';

const BuyerDashboard = observer(() => {
    const { followedVehicles, vehicles } = vehicleStore;

    // Calculate stats
    const totalFollowed = followedVehicles.length;
    const recentVehicles = vehicles.slice(0, 5);
    const availableVehicles = vehicles.filter(p => p.quantity > 0).length;

    // Group vehicles by type for quick overview
    const vehiclesByType = vehicles.reduce((acc, vehicle) => {
        const type = vehicle.type || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    return (
        <>
            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-primary mb-2">
                                <i className="bi bi-heart fs-1"></i>
                            </div>
                            <h3 className="mb-1">{totalFollowed}</h3>
                            <p className="text-muted mb-0">Followed Vehicles</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-success mb-2">
                                <i className="bi bi-car-front fs-1"></i>
                            </div>
                            <h3 className="mb-1">{availableVehicles}</h3>
                            <p className="text-muted mb-0">Available Vehicles</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-info mb-2">
                                <i className="bi bi-collection fs-1"></i>
                            </div>
                            <h3 className="mb-1">{vehicles.length}</h3>
                            <p className="text-muted mb-0">Total Listings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-warning mb-2">
                                <i className="bi bi-search fs-1"></i>
                            </div>
                            <h3 className="mb-1">{Object.keys(vehiclesByType).length}</h3>
                            <p className="text-muted mb-0">Vehicle Types</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Followed Vehicles */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-heart-fill text-danger me-2"></i>
                                    Followed Vehicles
                                </h5>
                                <Link to="/followed" className="btn btn-sm btn-outline-primary">
                                    View All
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {followedVehicles.length > 0 ? (
                                <ListGroup variant="flush">
                                    {followedVehicles.slice(0, 5).map(vehicle => (
                                        <ListGroup.Item key={vehicle.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{vehicle.title}</h6>
                                                <small className="text-muted">
                                                    <i className="bi bi-tag me-1"></i>
                                                    ${vehicle.price?.toLocaleString()}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <Badge bg={vehicle.quantity > 0 ? 'success' : 'secondary'}>
                                                    {vehicle.quantity > 0 ? 'Available' : 'Sold'}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-heart text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-2 mb-0">No followed vehicles yet</p>
                                    <Link to="/vehicles" className="btn btn-sm btn-primary mt-2">
                                        Browse Vehicles
                                    </Link>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recent Vehicles */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-clock text-primary me-2"></i>
                                    Recent Listings
                                </h5>
                                <Link to="/vehicles" className="btn btn-sm btn-outline-primary">
                                    View All
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {recentVehicles.length > 0 ? (
                                <ListGroup variant="flush">
                                    {recentVehicles.map(vehicle => (
                                        <ListGroup.Item key={vehicle.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{vehicle.title}</h6>
                                                <small className="text-muted">
                                                    <i className="bi bi-person me-1"></i>
                                                    {vehicle.merchant?.fullName || vehicle.merchant?.email || 'Unknown Seller'}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-primary fw-bold">
                                                    ${vehicle.price?.toLocaleString()}
                                                </div>
                                                <Badge bg={vehicle.type === 'car' ? 'primary' :
                                                        vehicle.type === 'truck' ? 'success' :
                                                        vehicle.type === 'motorcycle' ? 'warning' : 'info'}>
                                                    {vehicle.type || 'vehicle'}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-collection text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-2 mb-0">No vehicles available</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Vehicle Types Overview */}
            {Object.keys(vehiclesByType).length > 0 && (
                <Row>
                    <Col>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 py-3">
                                <h5 className="mb-0">
                                    <i className="bi bi-bar-chart text-info me-2"></i>
                                    Vehicle Types Available
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {Object.entries(vehiclesByType).map(([type, count]) => (
                                        <Col md={3} key={type} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded">
                                                <div className="mb-2">
                                                    <i className={`bi ${
                                                        type === 'car' ? 'bi-car-front' :
                                                            type === 'truck' ? 'bi-truck' :
                                                                type === 'motorcycle' ? 'bi-bicycle' :
                                                                    type === 'cart' ? 'bi-minecart' :
                                                                        type === 'trailer' ? 'bi-truck-flatbed' :
                                                                    'bi-gear'
                                                    } fs-3 text-primary`}></i>
                                                </div>
                                                <h5 className="mb-1">{count}</h5>
                                                <p className="text-muted mb-0 text-capitalize">{type}s</p>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Quick Actions */}
            <Row className="mt-4">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0">
                                <i className="bi bi-lightning text-warning me-2"></i>
                                Quick Actions
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3} className="mb-2">
                                    <Link to="/vehicles" className="btn btn-primary w-100">
                                        <i className="bi bi-search me-2"></i>
                                        Browse Vehicles
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Link to="/followed" className="btn btn-outline-danger w-100">
                                        <i className="bi bi-heart me-2"></i>
                                        My Favorites
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Link to="/profile" className="btn btn-outline-secondary w-100">
                                        <i className="bi bi-person me-2"></i>
                                        My Profile
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Button variant="outline-info" className="w-100" onClick={() => vehicleStore.loadVehicles()}>
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Refresh
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
});

export default BuyerDashboard;
