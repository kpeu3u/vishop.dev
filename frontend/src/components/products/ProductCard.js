import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Badge, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductStore from '../../stores/ProductStore';
import { useAuth } from '../../contexts/AuthContext';

const ProductCard = observer(({ product }) => {
    const authStore = useAuth();

    const handleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await ProductStore.followProduct(product.id);
    };

    const handleUnfollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await ProductStore.unfollowProduct(product.id);
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

    return (
        <Card className="h-100 shadow-sm product-card">
            {product.imageUrl && (
                <Card.Img
                    variant="top"
                    src={product.imageUrl}
                    style={{ height: '200px', objectFit: 'cover' }}
                    alt={product.title}
                />
            )}

            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg={getTypeVariant(product.type)} className="mb-2">
                        <i className={`bi ${getTypeIcon(product.type)} me-1`}></i>
                        {product.type?.charAt(0).toUpperCase() + product.type?.slice(1)}
                    </Badge>

                    {product.quantity === 0 && (
                        <Badge bg="danger">Out of Stock</Badge>
                    )}
                </div>

                <Card.Title className="h5 mb-2">
                    <Link to={`/products/${product.id}`} className="text-decoration-none">
                        {product.title}
                    </Link>
                </Card.Title>

                <div className="mb-2">
                    <strong className="text-primary fs-5">{formatPrice(product.price)}</strong>
                </div>

                {product.brand && product.model && (
                    <p className="text-muted mb-2">
                        <strong>{product.brand}</strong> {product.model}
                    </p>
                )}

                {product.description && (
                    <p className="text-muted mb-3 flex-grow-1" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {product.description}
                    </p>
                )}

                <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                            <i className="bi bi-person me-1"></i>
                            {product.merchant?.name || 'Merchant'}
                        </small>
                        {product.followersCount !== undefined && (
                            <small className="text-muted">
                                <i className="bi bi-heart me-1"></i>
                                {product.followersCount} followers
                            </small>
                        )}
                    </div>

                    <ButtonGroup className="w-100">
                        <Button
                            as={Link}
                            to={`/products/${product.id}`}
                            variant="primary"
                            size="sm"
                        >
                            <i className="bi bi-eye me-1"></i>
                            View Details
                        </Button>

                        {authStore.isAuthenticated && authStore.isBuyer() && (
                            <>
                                {product.isFollowed ? (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={handleUnfollow}
                                        disabled={ProductStore.isLoading}
                                    >
                                        <i className="bi bi-heart-fill me-1"></i>
                                        Unfollow
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleFollow}
                                        disabled={ProductStore.isLoading}
                                    >
                                        <i className="bi bi-heart me-1"></i>
                                        Follow
                                    </Button>
                                )}
                            </>
                        )}
                    </ButtonGroup>
                </div>
            </Card.Body>
        </Card>
    );
});

export default ProductCard;
