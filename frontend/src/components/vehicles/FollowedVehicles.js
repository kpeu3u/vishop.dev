import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import VehicleStore from '../../stores/VehicleStore';
import VehicleCard from './VehicleCard';
import Pagination from '../common/Pagination';

const FollowedVehicles = observer(() => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    useEffect(() => {
        VehicleStore.loadFollowedVehicles(1, pageSize);
        return () => VehicleStore.clearMessages();
    }, [pageSize]);

    const handlePageChange = async (page) => {
        setCurrentPage(page);
        await VehicleStore.loadFollowedVehicles(page, pageSize);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        VehicleStore.loadFollowedVehicles(1, newPageSize);
    };

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h2 className="mb-4">Followed Vehicles</h2>
                </Col>
            </Row>

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
                    <p className="mt-2">Loading your followed vehicles...</p>
                </div>
            ) : (
                <>
                    {VehicleStore.followedVehicles.length === 0 ? (
                        <Card className="text-center py-5">
                            <Card.Body>
                                <i className="bi bi-heart fs-1 text-muted mb-3 d-block"></i>
                                <h4>No followed vehicles</h4>
                                <p className="text-muted">
                                    You haven't followed any vehicles yet. Browse our catalog to find vehicles you're interested in!
                                </p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <p className="text-muted mb-0">
                                        {VehicleStore.pagination.followedVehicles?.totalResults || VehicleStore.followedVehicles.length} followed vehicle
                                        {(VehicleStore.pagination.followedVehicles?.totalResults || VehicleStore.followedVehicles.length) !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="me-2 text-muted">Show:</span>
                                    <Form.Select 
                                        size="sm" 
                                        style={{ width: 'auto' }}
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                    >
                                        <option value={6}>6 per page</option>
                                        <option value={12}>12 per page</option>
                                        <option value={24}>24 per page</option>
                                        <option value={48}>48 per page</option>
                                    </Form.Select>
                                </div>
                            </div>

                            <Row>
                                {VehicleStore.followedVehicles.map(vehicle => (
                                    <Col key={vehicle.id} md={6} lg={4} className="mb-4">
                                        <VehicleCard 
                                            vehicle={vehicle} 
                                            showFollowButton={true}
                                        />
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {VehicleStore.pagination.followedVehicles && (
                                <Pagination
                                    paginationData={VehicleStore.pagination.followedVehicles}
                                    onPageChange={handlePageChange}
                                    className="mt-4"
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </Container>
    );
});

export default FollowedVehicles;
