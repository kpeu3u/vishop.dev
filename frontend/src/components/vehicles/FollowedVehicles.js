import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import VehicleStore from '../../stores/VehicleStore';
import VehicleCard from './VehicleCard';

const FollowedVehicles = observer(() => {
    useEffect(() => {
        VehicleStore.loadFollowedVehicles();
        return () => VehicleStore.clearMessages();
    }, []);

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h2 className="mb-4">Followed Vehicles</h2>
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
                    <p className="mt-2">Loading followed vehicles...</p>
                </div>
            ) : (
                <>
                    {VehicleStore.followedVehicles.length === 0 ? (
                        <Card className="text-center py-5">
                            <Card.Body>
                                <i className="bi bi-heart fs-1 text-muted mb-3 d-block"></i>
                                <h4>No followed vehicles</h4>
                                <p className="text-muted">
                                    You haven't followed any vehicles yet. Browse vehicles and follow the ones you're interested in!
                                </p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            <div className="mb-3">
                                <p className="text-muted">
                                    You are following {VehicleStore.followedVehicles.length} vehicle{VehicleStore.followedVehicles.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <Row>
                                {VehicleStore.followedVehicles.map(vehicle => (
                                    <Col key={vehicle.id} md={6} lg={4} className="mb-4">
                                        <VehicleCard vehicle={vehicle} />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </>
            )}
        </Container>
    );
});

export default FollowedVehicles;
