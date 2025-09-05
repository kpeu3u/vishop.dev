import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../../contexts/AuthContext';
import productStore from '../../stores/ProductStore';
import BuyerDashboard from './BuyerDashboard';
import MerchantDashboard from './MerchantDashboard';

const Dashboard = observer(() => {
    const authStore = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                // Load basic product data for stats
                await productStore.loadProducts({ limit: 5 });

                if (authStore.isMerchant()) {
                    await productStore.loadMyProducts();
                } else if (authStore.isBuyer()) {
                    await productStore.loadFollowedProducts();
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (authStore.isAuthenticated) {
            loadDashboardData();
        }
    }, [authStore.isAuthenticated]);

    if (isLoading) {
        return (
            <Container className="my-4">
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="display-4 mb-2">Dashboard</h1>
                            <p className="text-muted lead">
                                Welcome back, {authStore.user?.fullName || authStore.user?.email}!
                            </p>
                        </div>
                        <div className="text-end">
                            <span className="badge bg-primary fs-6">
                                {authStore.isMerchant() ? 'Merchant' : 'Buyer'}
                            </span>
                        </div>
                    </div>

                    {productStore.error && (
                        <Alert variant="danger" dismissible onClose={() => productStore.clearMessages()}>
                            {productStore.error}
                        </Alert>
                    )}

                    {authStore.isMerchant() ? (
                        <MerchantDashboard />
                    ) : (
                        <BuyerDashboard />
                    )}
                </Col>
            </Row>
        </Container>
    );
});

export default Dashboard;
