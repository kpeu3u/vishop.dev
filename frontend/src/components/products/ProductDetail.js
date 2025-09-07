import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import ProductStore from '../../stores/ProductStore';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetail = observer(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            ProductStore.loadProduct(parseInt(id));
        }
        return () => {
            ProductStore.clearCurrentProduct();
            ProductStore.clearMessages();
        };
    }, [id]);

    const handleFollow = async () => {
        await ProductStore.followProduct(parseInt(id));
    };

    const handleUnfollow = async () => {
        await ProductStore.unfollowProduct(parseInt(id));
    };

    const handleEdit = () => {
        navigate(`/products/${id}/edit`);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const result = await ProductStore.deleteProduct(parseInt(id));
            if (result.success) {
                navigate('/my-products');
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
            default: return 'bi-car-front';
        }
    };

    const getTypeVariant = (type) => {
        switch (type) {
            case 'car': return 'primary';
            case 'motorcycle': return 'success';
            case 'truck': return 'warning';
            case 'trailer': return 'info';
            default: return 'secondary';
        }
    };

    const renderVehicleSpecificFields = (product) => {
        switch (product.type) {
            case 'car':
                return (
                    <>
                        {product.colour && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Colour:</strong>
                                <span>{product.colour}</span>
                            </ListGroup.Item>
                        )}
                        {product.engineCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Engine Capacity:</strong>
                                <span>{product.engineCapacity}L</span>
                            </ListGroup.Item>
                        )}
                        {product.numberOfDoors && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Number of Doors:</strong>
                                <span>{product.numberOfDoors}</span>
                            </ListGroup.Item>
                        )}
                        {product.category && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Category:</strong>
                                <span>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                            </ListGroup.Item>
                        )}
                    </>
                );

            case 'motorcycle':
                return (
                    <>
                        {product.colour && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Colour:</strong>
                                <span>{product.colour}</span>
                            </ListGroup.Item>
                        )}
                        {product.engineCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Engine Capacity:</strong>
                                <span>{product.engineCapacity}L</span>
                            </ListGroup.Item>
                        )}
                    </>
                );

            case 'truck':
                return (
                    <>
                        {product.colour && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Colour:</strong>
                                <span>{product.colour}</span>
                            </ListGroup.Item>
                        )}
                        {product.engineCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Engine Capacity:</strong>
                                <span>{product.engineCapacity}L</span>
                            </ListGroup.Item>
                        )}
                        {product.numberOfBeds && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Number of Beds:</strong>
                                <span>{product.numberOfBeds}</span>
                            </ListGroup.Item>
                        )}
                    </>
                );

            case 'trailer':
                return (
                    <>
                        {product.numberOfAxles && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Number of Axles:</strong>
                                <span>{product.numberOfAxles}</span>
                            </ListGroup.Item>
                        )}
                        {product.loadCapacity && (
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Load Capacity:</strong>
                                <span>{product.loadCapacity.toLocaleString()} kg</span>
                            </ListGroup.Item>
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    if (ProductStore.isLoading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading product...</p>
            </Container>
        );
    }

    if (ProductStore.error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    {ProductStore.error}
                </Alert>
                <Button as={Link} to="/products" variant="primary">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Products
                </Button>
            </Container>
        );
    }

    const product = ProductStore.currentProduct;

    if (!product) {
        return (
            <Container className="my-5 text-center">
                <h4>Product not found</h4>
                <Button as={Link} to="/products" variant="primary">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Products
                </Button>
            </Container>
        );
    }

    const isOwner = user && product.merchant && user.id === product.merchant.id;
    const canFollow = user && user.roles.includes('ROLE_BUYER') && !isOwner;

    return (
        <Container className="my-4">
            {/* Back Button */}
            <div className="mb-3">
                <Button as={Link} to="/products" variant="outline-secondary" size="sm">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Products
                </Button>
            </div>

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

            <Row>
                {/* Product Image */}
                <Col md={6}>
                    <Card>
                        {product.imageUrl ? (
                            <Card.Img
                                variant="top"
                                src={product.imageUrl}
                                style={{ height: '400px', objectFit: 'cover' }}
                                alt={product.title}
                            />
                        ) : (
                            <div
                                className="d-flex align-items-center justify-content-center bg-light"
                                style={{ height: '400px' }}
                            >
                                <i className={`bi ${getTypeIcon(product.type)} text-muted`} style={{ fontSize: '4rem' }}></i>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Product Details */}
                <Col md={6}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg={getTypeVariant(product.type)} className="mb-2">
                            <i className={`bi ${getTypeIcon(product.type)} me-1`}></i>
                            {product.type?.charAt(0).toUpperCase() + product.type?.slice(1)}
                        </Badge>

                        {product.quantity === 0 && (
                            <Badge bg="danger">Out of Stock</Badge>
                        )}
                        {product.quantity > 0 && product.quantity <= 5 && (
                            <Badge bg="warning">Low Stock</Badge>
                        )}
                    </div>

                    <h1 className="mb-3">{product.title}</h1>

                    <div className="mb-4">
                        <h2 className="text-primary mb-0">{formatPrice(product.price)}</h2>
                    </div>

                    {product.brand && product.model && (
                        <div className="mb-3">
                            <h5 className="text-muted">
                                <strong>{product.brand}</strong> {product.model}
                            </h5>
                        </div>
                    )}

                    {product.description && (
                        <div className="mb-4">
                            <h5>Description</h5>
                            <p className="text-muted">{product.description}</p>
                        </div>
                    )}

                    {/* Specifications */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Specifications</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {product.brand && (
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Brand:</strong>
                                    <span>{product.brand}</span>
                                </ListGroup.Item>
                            )}
                            {product.model && (
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Model:</strong>
                                    <span>{product.model}</span>
                                </ListGroup.Item>
                            )}
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Type:</strong>
                                <span>{product.type?.charAt(0).toUpperCase() + product.type?.slice(1)}</span>
                            </ListGroup.Item>
                            {renderVehicleSpecificFields(product)}
                            <ListGroup.Item className="d-flex justify-content-between">
                                <strong>Quantity:</strong>
                                <span>{product.quantity}</span>
                            </ListGroup.Item>
                            {product.followersCount !== undefined && (
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <strong>Followers:</strong>
                                    <span>{product.followersCount}</span>
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
                                <strong>{product.merchant?.fullName || 'Merchant'}</strong>
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
                                    Edit Product
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    onClick={handleDelete}
                                    disabled={ProductStore.isLoading}
                                >
                                    <i className="bi bi-trash me-1"></i>
                                    Delete
                                </Button>
                            </div>
                        )}

                        {canFollow && (
                            <>
                                {product.isFollowed ? (
                                    <Button
                                        variant="outline-danger"
                                        onClick={handleUnfollow}
                                        disabled={ProductStore.isLoading}
                                    >
                                        <i className="bi bi-heart-fill me-1"></i>
                                        Unfollow Product
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={handleFollow}
                                        disabled={ProductStore.isLoading}
                                    >
                                        <i className="bi bi-heart me-1"></i>
                                        Follow Product
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

export default ProductDetail;
