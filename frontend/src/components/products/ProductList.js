import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import ProductStore from '../../stores/ProductStore';
import ProductFilters from './ProductFilters';
import ProductCard from './ProductCard';

const ProductList = observer(() => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});

    useEffect(() => {
        ProductStore.loadProducts();
        return () => ProductStore.clearMessages();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            await ProductStore.searchProducts(searchTerm);
        } else {
            await ProductStore.loadProducts(filters);
        }
    };

    const handleFilterChange = async (newFilters) => {
        setFilters(newFilters);
        await ProductStore.loadProducts(newFilters);
    };

    const clearSearch = async () => {
        setSearchTerm('');
        await ProductStore.loadProducts(filters);
    };

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h2 className="mb-4">Products</h2>
                </Col>
            </Row>

            {/* Search Bar */}
            <Row className="mb-4">
                <Col md={8}>
                    <Form onSubmit={handleSearch}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search products..."
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
                    <ProductFilters onFilterChange={handleFilterChange} />
                </Col>

                {/* Product Grid */}
                <Col md={9}>
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
                            <p className="mt-2">Loading products...</p>
                        </div>
                    ) : (
                        <>
                            {ProductStore.products.length === 0 ? (
                                <Card className="text-center py-5">
                                    <Card.Body>
                                        <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                                        <h4>No products found</h4>
                                        <p className="text-muted">
                                            {searchTerm ? 'Try adjusting your search terms.' : 'No products match your current filters.'}
                                        </p>
                                    </Card.Body>
                                </Card>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <p className="text-muted mb-0">
                                            {ProductStore.products.length} product{ProductStore.products.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>

                                    <Row>
                                        {ProductStore.products.map(product => (
                                            <Col key={product.id} md={6} lg={4} className="mb-4">
                                                <ProductCard product={product} />
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

export default ProductList;
