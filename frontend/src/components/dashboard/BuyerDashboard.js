import React from 'react';
import { Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import productStore from '../../stores/ProductStore';

const BuyerDashboard = observer(() => {
    const { followedProducts, products } = productStore;

    // Calculate stats
    const totalFollowed = followedProducts.length;
    const recentProducts = products.slice(0, 5);
    const availableProducts = products.filter(p => p.quantity > 0).length;

    // Group products by type for quick overview
    const productsByType = products.reduce((acc, product) => {
        const type = product.type || 'other';
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
                            <p className="text-muted mb-0">Followed Products</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-success mb-2">
                                <i className="bi bi-car-front fs-1"></i>
                            </div>
                            <h3 className="mb-1">{availableProducts}</h3>
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
                            <h3 className="mb-1">{products.length}</h3>
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
                            <h3 className="mb-1">{Object.keys(productsByType).length}</h3>
                            <p className="text-muted mb-0">Vehicle Types</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Followed Products */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-heart-fill text-danger me-2"></i>
                                    Followed Products
                                </h5>
                                <Link to="/followed" className="btn btn-sm btn-outline-primary">
                                    View All
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {followedProducts.length > 0 ? (
                                <ListGroup variant="flush">
                                    {followedProducts.slice(0, 5).map(product => (
                                        <ListGroup.Item key={product.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{product.title}</h6>
                                                <small className="text-muted">
                                                    <i className="bi bi-tag me-1"></i>
                                                    ${product.price?.toLocaleString()}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <Badge bg={product.quantity > 0 ? 'success' : 'secondary'}>
                                                    {product.quantity > 0 ? 'Available' : 'Sold'}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-heart text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-2 mb-0">No followed products yet</p>
                                    <Link to="/products" className="btn btn-sm btn-primary mt-2">
                                        Browse Products
                                    </Link>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recent Products */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-clock text-primary me-2"></i>
                                    Recent Listings
                                </h5>
                                <Link to="/products" className="btn btn-sm btn-outline-primary">
                                    View All
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {recentProducts.length > 0 ? (
                                <ListGroup variant="flush">
                                    {recentProducts.map(product => (
                                        <ListGroup.Item key={product.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{product.title}</h6>
                                                <small className="text-muted">
                                                    <i className="bi bi-person me-1"></i>
                                                    {product.merchant?.fullName || product.merchant?.email || 'Unknown Seller'}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-primary fw-bold">
                                                    ${product.price?.toLocaleString()}
                                                </div>
                                                <Badge bg={product.type === 'car' ? 'primary' :
                                                    product.type === 'truck' ? 'success' :
                                                        product.type === 'motorcycle' ? 'warning' : 'info'}>
                                                    {product.type || 'vehicle'}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-collection text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-2 mb-0">No products available</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Vehicle Types Overview */}
            {Object.keys(productsByType).length > 0 && (
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
                                    {Object.entries(productsByType).map(([type, count]) => (
                                        <Col md={3} key={type} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded">
                                                <div className="mb-2">
                                                    <i className={`bi ${
                                                        type === 'car' ? 'bi-car-front' :
                                                            type === 'truck' ? 'bi-truck' :
                                                                type === 'motorcycle' ? 'bi-bicycle' :
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
                                    <Link to="/products" className="btn btn-primary w-100">
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
                                    <Button variant="outline-info" className="w-100" onClick={() => productStore.loadProducts()}>
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
