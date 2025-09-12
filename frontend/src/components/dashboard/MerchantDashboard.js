import React from 'react';
import { Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import vehicleStore from '../../stores/VehicleStore';

const MerchantDashboard = observer(() => {
    const { myVehicles } = vehicleStore;

    // Calculate stats
    const totalVehicles = myVehicles.length;
    const activeVehicles = myVehicles.filter(p => p.quantity > 0).length;
    const soldVehicles = myVehicles.filter(p => p.quantity === 0).length;
    const totalValue = myVehicles.reduce((sum, vehicle) => sum + (vehicle.price * vehicle.quantity || 0), 0);
    const totalFollowers = myVehicles.reduce((sum, vehicle) => sum + (vehicle.followersCount || 0), 0);

    // Recent vehicles (last 5)
    const recentVehicles = myVehicles.slice(0, 5);

    // Top performing vehicles (by followers)
    const topVehicles = [...myVehicles]
        .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
        .slice(0, 5);

    // Vehicles by type
    const vehiclesByType = myVehicles.reduce((acc, vehicle) => {
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
                                <i className="bi bi-collection fs-1"></i>
                            </div>
                            <h3 className="mb-1">{totalVehicles}</h3>
                            <p className="text-muted mb-0">Total Vehicles</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-success mb-2">
                                <i className="bi bi-check-circle fs-1"></i>
                            </div>
                            <h3 className="mb-1">{activeVehicles}</h3>
                            <p className="text-muted mb-0">Active Listings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-warning mb-2">
                                <i className="bi bi-currency-dollar fs-1"></i>
                            </div>
                            <h3 className="mb-1">${totalValue.toLocaleString()}</h3>
                            <p className="text-muted mb-0">Inventory Value</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-info mb-2">
                                <i className="bi bi-people fs-1"></i>
                            </div>
                            <h3 className="mb-1">{totalFollowers}</h3>
                            <p className="text-muted mb-0">Total Followers</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Recent Vehicles */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-clock text-primary me-2"></i>
                                    Recent Vehicles
                                </h5>
                                <Link to="/my-vehicles" className="btn btn-sm btn-outline-primary">
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
                                                    <i className="bi bi-tag me-1"></i>
                                                    ${vehicle.price?.toLocaleString()} • Qty: {vehicle.quantity}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <Badge bg={vehicle.quantity > 0 ? 'success' : 'secondary'}>
                                                    {vehicle.quantity > 0 ? 'Active' : 'Sold'}
                                                </Badge>
                                                {vehicle.followersCount > 0 && (
                                                    <div className="mt-1">
                                                        <small className="text-muted">
                                                            <i className="bi bi-heart me-1"></i>
                                                            {vehicle.followersCount}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-plus-circle text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-2 mb-0">No vehicles yet</p>
                                    <Link to="/vehicles/new" className="btn btn-sm btn-primary mt-2">
                                        Add Your First Vehicle
                                    </Link>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Top Performing Vehicles */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-star text-warning me-2"></i>
                                    Most Popular
                                </h5>
                                <Link to="/my-vehicles" className="btn btn-sm btn-outline-primary">
                                    Manage
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {topVehicles.length > 0 && topVehicles.some(p => p.followersCount > 0) ? (
                                <ListGroup variant="flush">
                                    {topVehicles.filter(p => p.followersCount > 0).map(vehicle => (
                                        <ListGroup.Item key={vehicle.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{vehicle.title}</h6>
                                                <small className="text-muted">
                                                    <i className="bi bi-tag me-1"></i>
                                                    ${vehicle.price?.toLocaleString()}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-warning fw-bold">
                                                    <i className="bi bi-heart-fill me-1"></i>
                                                    {vehicle.followersCount}
                                                </div>
                                                <Badge bg={vehicle.quantity > 0 ? 'success' : 'secondary'}>
                                                    {vehicle.quantity > 0 ? 'Active' : 'Sold'}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-star text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-2 mb-0">No followers yet</p>
                                    <small className="text-muted">Keep adding quality vehicles!</small>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Inventory Overview */}
            <Row className="mb-4">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0">
                                <i className="bi bi-bar-chart text-info me-2"></i>
                                Inventory Overview
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={4} className="mb-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <div className="text-success mb-2">
                                            <i className="bi bi-check-circle fs-3"></i>
                                        </div>
                                        <h4 className="mb-1 text-success">{activeVehicles}</h4>
                                        <p className="text-muted mb-0">Active Vehicles</p>
                                    </div>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <div className="text-secondary mb-2">
                                            <i className="bi bi-x-circle fs-3"></i>
                                        </div>
                                        <h4 className="mb-1 text-secondary">{soldVehicles}</h4>
                                        <p className="text-muted mb-0">Sold Vehicles</p>
                                    </div>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <div className="text-primary mb-2">
                                            <i className="bi bi-collection fs-3"></i>
                                        </div>
                                        <h4 className="mb-1 text-primary">{Object.keys(vehiclesByType).length}</h4>
                                        <p className="text-muted mb-0">Vehicle Types</p>
                                    </div>
                                </Col>
                            </Row>

                            {/* Vehicle Types Breakdown */}
                            {Object.keys(vehiclesByType).length > 0 && (
                                <>
                                    <hr className="my-4" />
                                    <h6 className="mb-3">Vehicle Types</h6>
                                    <Row>
                                        {Object.entries(vehiclesByType).map(([type, count]) => (
                                            <Col md={3} key={type} className="mb-3">
                                                <div className="text-center p-2 border rounded">
                                                    <i className={`bi ${
                                                        type === 'car' ? 'bi-car-front' :
                                                            type === 'truck' ? 'bi-truck' :
                                                                type === 'motorcycle' ? 'bi-bicycle' :
                                                                    type === 'cart' ? 'bi-minecart' :
                                                                        type === 'trailer' ? 'bi-truck-flatbed' :
                                                                    'bi-gear'
                                                    } fs-4 text-primary mb-2`}></i>
                                                    <div className="fw-bold">{count}</div>
                                                    <small className="text-muted text-capitalize">{type}s</small>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row>
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
                                    <Link to="/vehicles/new" className="btn btn-primary w-100">
                                        <i className="bi bi-plus me-2"></i>
                                        Add Vehicle
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Link to="/my-vehicles" className="btn btn-outline-primary w-100">
                                        <i className="bi bi-collection me-2"></i>
                                        Manage Vehicles
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Link to="/profile" className="btn btn-outline-secondary w-100">
                                        <i className="bi bi-person me-2"></i>
                                        My Profile
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Button
                                        variant="outline-info"
                                        className="w-100"
                                        onClick={() => vehicleStore.loadMyVehicles()}
                                    >
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

export default MerchantDashboard;
