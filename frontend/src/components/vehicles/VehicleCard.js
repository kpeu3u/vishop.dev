import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Badge, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import VehicleStore from '../../stores/VehicleStore';
import { useAuth } from '../../contexts/AuthContext';

const VehicleCard = observer(({ vehicle }) => {
    const authStore = useAuth();

    const handleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await VehicleStore.followVehicle(vehicle.id);
    };

    const handleUnfollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await VehicleStore.unfollowVehicle(vehicle.id);
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
        <Card className="h-100 shadow-sm vehicle-card">
            {vehicle.imageUrl && (
                <Card.Img
                    variant="top"
                    src={vehicle.imageUrl}
                    style={{ height: '200px', objectFit: 'cover' }}
                    alt={vehicle.title}
                />
            )}

            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg={getTypeVariant(vehicle.type)} className="mb-2">
                        <i className={`bi ${getTypeIcon(vehicle.type)} me-1`}></i>
                        {vehicle.type?.charAt(0).toUpperCase() + vehicle.type?.slice(1)}
                    </Badge>

                    {vehicle.quantity === 0 && (
                        <Badge bg="danger">Out of Stock</Badge>
                    )}
                </div>

                <Card.Title className="h5 mb-2">
                    <Link to={`/vehicles/${vehicle.id}`} className="text-decoration-none">
                        {vehicle.title}
                    </Link>
                </Card.Title>

                <div className="mb-2">
                    <strong className="text-primary fs-5">{formatPrice(vehicle.price)}</strong>
                </div>

                {vehicle.brand && vehicle.model && (
                    <p className="text-muted mb-2">
                        <strong>{vehicle.brand}</strong> {vehicle.model}
                    </p>
                )}

                {vehicle.description && (
                    <p className="text-muted mb-3 flex-grow-1" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {vehicle.description}
                    </p>
                )}

                <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                            <i className="bi bi-person me-1"></i>
                            {vehicle.merchant?.fullName || 'Merchant'}
                        </small>
                        {vehicle.followersCount !== undefined && (
                            <small className="text-muted">
                                <i className="bi bi-heart me-1"></i>
                                {vehicle.followersCount} followers
                            </small>
                        )}
                    </div>

                    <ButtonGroup className="w-100">
                        <Button
                            as={Link}
                            to={`/vehicles/${vehicle.id}`}
                            variant="primary"
                            size="sm"
                        >
                            <i className="bi bi-eye me-1"></i>
                            View Details
                        </Button>
                    </ButtonGroup>
                </div>
            </Card.Body>
        </Card>
    );
});

export default VehicleCard;
