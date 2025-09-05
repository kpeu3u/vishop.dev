import React from 'react';
import { Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import productStore from '../../stores/ProductStore';

const MerchantDashboard = observer(() => {
    const { myProducts } = productStore;

    // Calculate stats
    const totalProducts = myProducts.length;
    const activeProducts = myProducts.filter(p => p.quantity > 0).length;
    const soldProducts = myProducts.filter(p => p.quantity === 0).length;
    const totalValue = myProducts.reduce((sum, product) => sum + (product.price * product.quantity || 0), 0);
    const totalFollowers = myProducts.reduce((sum, product) => sum + (product.followersCount || 0), 0);

    // Recent products (last 5)
    const recentProducts = myProducts.slice(0, 5);

    // Top performing products (by followers)
    const topProducts = [...myProducts]
        .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
        .slice(0, 5);

    // Products by type
    const productsByType = myProducts.reduce((acc, product) => {
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
                                <i className="bi bi-collection fs-1"></i>
                            </div>
                            <h3 className="mb-1">{totalProducts}</h3>
                            <p className="text-muted mb-0">Total Products</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="text-success mb-2">
                                <i className="bi bi-check-circle fs-1"></i>
                            </div>
                            <h3 className="mb-1">{activeProducts}</h3>
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
                {/* Recent Products */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-clock text-primary me-2"></i>
                                    Recent Products
                                </h5>
                                <Link to="/my-products" className="btn btn-sm btn-outline-primary">
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
                                                    <i className="bi bi-tag me-1"></i>
                                                    ${product.price?.toLocaleString()} • Qty: {product.quantity}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <Badge bg={product.quantity > 0 ? 'success' : 'secondary'}>
                                                    {product.quantity > 0 ? 'Active' : 'Sold'}
                                                </Badge>
                                                {product.followersCount > 0 && (
                                                    <div className="mt-1">
                                                        <small className="text-muted">
                                                            <i className="bi bi-heart me-1"></i>
                                                            {product.followersCount}
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
                                    <p className="text-muted mt-2 mb-0">No products yet</p>
                                    <Link to="/products/new" className="btn btn-sm btn-primary mt-2">
                                        Add Your First Product
                                    </Link>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Top Performing Products */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-star text-warning me-2"></i>
                                    Most Popular
                                </h5>
                                <Link to="/my-products" className="btn btn-sm btn-outline-primary">
                                    Manage
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {topProducts.length > 0 && topProducts.some(p => p.followersCount > 0) ? (
                                <ListGroup variant="flush">
                                    {topProducts.filter(p => p.followersCount > 0).map(product => (
                                        <ListGroup.Item key={product.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{product.title}</h6>
                                                <small className="text-muted">
                                                    <i className="bi bi-tag me-1"></i>
                                                    ${product.price?.toLocaleString()}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-warning fw-bold">
                                                    <i className="bi bi-heart-fill me-1"></i>
                                                    {product.followersCount}
                                                </div>
                                                <Badge bg={product.quantity > 0 ? 'success' : 'secondary'}>
                                                    {product.quantity > 0 ? 'Active' : 'Sold'}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-star text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-2 mb-0">No followers yet</p>
                                    <small className="text-muted">Keep adding quality products!</small>
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
                                        <h4 className="mb-1 text-success">{activeProducts}</h4>
                                        <p className="text-muted mb-0">Active Products</p>
                                    </div>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <div className="text-secondary mb-2">
                                            <i className="bi bi-x-circle fs-3"></i>
                                        </div>
                                        <h4 className="mb-1 text-secondary">{soldProducts}</h4>
                                        <p className="text-muted mb-0">Sold Products</p>
                                    </div>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <div className="text-primary mb-2">
                                            <i className="bi bi-collection fs-3"></i>
                                        </div>
                                        <h4 className="mb-1 text-primary">{Object.keys(productsByType).length}</h4>
                                        <p className="text-muted mb-0">Product Types</p>
                                    </div>
                                </Col>
                            </Row>

                            {/* Vehicle Types Breakdown */}
                            {Object.keys(productsByType).length > 0 && (
                                <>
                                    <hr className="my-4" />
                                    <h6 className="mb-3">Vehicle Types</h6>
                                    <Row>
                                        {Object.entries(productsByType).map(([type, count]) => (
                                            <Col md={3} key={type} className="mb-3">
                                                <div className="text-center p-2 border rounded">
                                                    <i className={`bi ${
                                                        type === 'car' ? 'bi-car-front' :
                                                            type === 'truck' ? 'bi-truck' :
                                                                type === 'motorcycle' ? 'bi-bicycle' :
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
                                    <Link to="/products/new" className="btn btn-primary w-100">
                                        <i className="bi bi-plus me-2"></i>
                                        Add Product
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Link to="/my-products" className="btn btn-outline-primary w-100">
                                        <i className="bi bi-collection me-2"></i>
                                        Manage Products
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
                                        onClick={() => productStore.loadMyProducts()}
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
