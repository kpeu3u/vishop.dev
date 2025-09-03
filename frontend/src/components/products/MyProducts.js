import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductStore from '../../stores/ProductStore';

const MyProducts = observer(() => {
    useEffect(() => {
        ProductStore.loadMyProducts();
        return () => ProductStore.clearMessages();
    }, []);

    const handleDelete = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            await ProductStore.deleteProduct(id);
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
                        <h2>My Products</h2>
                        <Button as={Link} to="/products/new" variant="primary">
                            <i className="bi bi-plus-lg me-1"></i>
                            Add New Product
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Messages */}
            {ProductStore.error && (
                <Alert variant="danger" dismissible onClose={() => ProductStore.clearMessages()}>
                    {ProductStore.error}
                </Alert>
            )}

            {ProductStore.successMessage && (
                <Alert variant="success" dismissible onClose={() => ProductStore.clearMessages()}>
                    {ProductStore.successMessage}
                </Alert>
            )}

            {ProductStore.isLoading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Loading your products...</p>
                </div>
            ) : (
                <>
                    {ProductStore.myProducts.length === 0 ? (
                        <Card className="text-center py-5">
                            <Card.Body>
                                <i className="bi bi-box fs-1 text-muted mb-3 d-block"></i>
                                <h4>No products yet</h4>
                                <p className="text-muted mb-4">
                                    You haven't created any products yet. Start by adding your first product!
                                </p>
                                <Button as={Link} to="/products/new" variant="primary">
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Add Your First Product
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
                                                <th>Product</th>
                                                <th>Type</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Followers</th>
                                                <th>Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {ProductStore.myProducts.map(product => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            {product.imageUrl && (
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.title}
                                                                    className="rounded me-2"
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="fw-bold">{product.title}</div>
                                                                {product.brand && product.model && (
                                                                    <small className="text-muted">
                                                                        {product.brand} {product.model}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg="secondary">
                                                            {product.type?.charAt(0).toUpperCase() + product.type?.slice(1)}
                                                        </Badge>
                                                    </td>
                                                    <td className="fw-bold">{formatPrice(product.price)}</td>
                                                    <td>{getStockBadge(product.quantity)}</td>
                                                    <td>
                                                        <i className="bi bi-heart me-1"></i>
                                                        {product.followersCount || 0}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <Button
                                                                as={Link}
                                                                to={`/products/${product.id}`}
                                                                variant="outline-primary"
                                                                size="sm"
                                                                title="View"
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </Button>
                                                            <Button
                                                                as={Link}
                                                                to={`/products/${product.id}/edit`}
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
                                                                onClick={() => handleDelete(product.id, product.title)}
                                                                disabled={ProductStore.isLoading}
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
                                {ProductStore.myProducts.map(product => (
                                    <Card key={product.id} className="mb-3">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Badge bg="secondary">
                                                    {product.type?.charAt(0).toUpperCase() + product.type?.slice(1)}
                                                </Badge>
                                                {getStockBadge(product.quantity)}
                                            </div>

                                            <Card.Title className="h5 mb-2">{product.title}</Card.Title>

                                            {product.brand && product.model && (
                                                <p className="text-muted mb-2">
                                                    {product.brand} {product.model}
                                                </p>
                                            )}

                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <strong className="text-primary fs-5">{formatPrice(product.price)}</strong>
                                                <small className="text-muted">
                                                    <i className="bi bi-heart me-1"></i>
                                                    {product.followersCount || 0} followers
                                                </small>
                                            </div>

                                            <div className="d-flex gap-1">
                                                <Button
                                                    as={Link}
                                                    to={`/products/${product.id}`}
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="flex-fill"
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    View
                                                </Button>
                                                <Button
                                                    as={Link}
                                                    to={`/products/${product.id}/edit`}
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
                                                    onClick={() => handleDelete(product.id, product.title)}
                                                    disabled={ProductStore.isLoading}
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

export default MyProducts;
