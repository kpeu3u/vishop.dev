import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import VehicleStore from '../../stores/VehicleStore';
import VehicleFilters from './VehicleFilters';
import VehicleCard from './VehicleCard';

const VehicleList = observer(() => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});

    useEffect(() => {
        VehicleStore.loadVehicles();
        return () => VehicleStore.clearMessages();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            await VehicleStore.searchVehicles(searchTerm);
        } else {
            await VehicleStore.loadVehicles(filters);
        }
    };

    const handleFilterChange = async (newFilters) => {
        setFilters(newFilters);
        await VehicleStore.loadVehicles(newFilters);
    };

    const clearSearch = async () => {
        setSearchTerm('');
        await VehicleStore.loadVehicles(filters);
    };

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h2 className="mb-4">Vehicles</h2>
                </Col>
            </Row>

            {/* Search Bar */}
            <Row className="mb-4">
                <Col md={8}>
                    <Form onSubmit={handleSearch}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search vehicles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" type="submit">
                                <i className="bi bi-search me-1"></i>
                                Search
                            </Button>
                            {searchTerm && (
                                <Button variant="outline-secondary" onClick={clearSearch}>
                                    <i className="bi bi-x"></i>
                                </Button>
                            )}
                        </InputGroup>
                    </Form>
                </Col>
            </Row>

            <Row>
                {/* Filters Sidebar */}
                <Col md={3}>
                    <VehicleFilters onFilterChange={handleFilterChange} />
                </Col>

                {/* Vehicle Grid */}
                <Col md={9}>
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
                            <p className="mt-2">Loading vehicles...</p>
                        </div>
                    ) : (
                        <>
                            {VehicleStore.vehicles.length === 0 ? (
                                <Card className="text-center py-5">
                                    <Card.Body>
                                        <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                                        <h4>No vehicles found</h4>
                                        <p className="text-muted">
                                            {searchTerm ? 'Try adjusting your search terms.' : 'No vehicles match your current filters.'}
                                        </p>
                                    </Card.Body>
                                </Card>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <p className="text-muted mb-0">
                                            {VehicleStore.vehicles.length} vehicle{VehicleStore.vehicles.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>

                                    <Row>
                                        {VehicleStore.vehicles.map(vehicle => (
                                            <Col key={vehicle.id} md={6} lg={4} className="mb-4">
                                                <VehicleCard vehicle={vehicle} />
                                            </Col>
                                        ))}
                                    </Row>
                                </>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
});

export default VehicleList;
