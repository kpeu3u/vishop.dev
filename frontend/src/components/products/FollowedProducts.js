import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import ProductStore from '../../stores/ProductStore';
import ProductCard from './ProductCard';

const FollowedProducts = observer(() => {
    useEffect(() => {
        ProductStore.loadFollowedProducts();
        return () => ProductStore.clearMessages();
    }, []);

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h2 className="mb-4">Followed Products</h2>
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
                    <p className="mt-2">Loading followed products...</p>
                </div>
            ) : (
                <>
                    {ProductStore.followedProducts.length === 0 ? (
                        <Card className="text-center py-5">
                            <Card.Body>
                                <i className="bi bi-heart fs-1 text-muted mb-3 d-block"></i>
                                <h4>No followed products</h4>
                                <p className="text-muted">
                                    You haven't followed any products yet. Browse products and follow the ones you're interested in!
                                </p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            <div className="mb-3">
                                <p className="text-muted">
                                    You are following {ProductStore.followedProducts.length} product{ProductStore.followedProducts.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <Row>
                                {ProductStore.followedProducts.map(product => (
                                    <Col key={product.id} md={6} lg={4} className="mb-4">
                                        <ProductCard product={product} />
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

export default FollowedProducts;
