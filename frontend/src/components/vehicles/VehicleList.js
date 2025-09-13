import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import VehicleStore from '../../stores/VehicleStore';
import VehicleFilters from './VehicleFilters';
import VehicleCard from './VehicleCard';
import Pagination from '../common/Pagination';

const VehicleList = observer(() => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [isSearchMode, setIsSearchMode] = useState(false);

    useEffect(() => {
        VehicleStore.loadVehicles({}, 1, pageSize);
        return () => VehicleStore.clearMessages();
    }, [pageSize]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setIsSearchMode(true);
            setCurrentPage(1);
            await VehicleStore.searchVehicles(searchTerm, 1, pageSize);
        } else {
            await handleClearSearch();
        }
    };

    const handleClearSearch = async () => {
        setSearchTerm('');
        setIsSearchMode(false);
        setCurrentPage(1);
        await VehicleStore.loadVehicles(filters, 1, pageSize);
    };

    const handleFilterChange = async (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
        setIsSearchMode(false);
        await VehicleStore.loadVehicles(newFilters, 1, pageSize);
    };

    const handlePageChange = async (page) => {
        setCurrentPage(page);
        if (isSearchMode && searchTerm.trim()) {
            await VehicleStore.searchVehicles(searchTerm, page, pageSize);
        } else {
            await VehicleStore.loadVehicles(filters, page, pageSize);
        }
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        if (isSearchMode && searchTerm.trim()) {
            VehicleStore.searchVehicles(searchTerm, 1, newPageSize);
        } else {
            VehicleStore.loadVehicles(filters, 1, newPageSize);
        }
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
                            {(searchTerm || isSearchMode) && (
                                <Button variant="outline-secondary" onClick={handleClearSearch}>
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
                                        <div>
                                            <p className="text-muted mb-0">
                                                {VehicleStore.pagination.vehicles?.totalResults || VehicleStore.vehicles.length} vehicle
                                                {(VehicleStore.pagination.vehicles?.totalResults || VehicleStore.vehicles.length) !== 1 ? 's' : ''} found
                                                {isSearchMode && ` for "${searchTerm}"`}
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
                                        {VehicleStore.vehicles.map(vehicle => (
                                            <Col key={vehicle.id} md={6} lg={4} className="mb-4">
                                                <VehicleCard vehicle={vehicle} />
                                            </Col>
                                        ))}
                                    </Row>

                                    {/* Pagination */}
                                    {VehicleStore.pagination.vehicles && (
                                        <Pagination
                                            paginationData={VehicleStore.pagination.vehicles}
                                            onPageChange={handlePageChange}
                                            className="mt-4"
                                        />
                                    )}
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
