import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import ProductStore from '../../stores/ProductStore';
import AuthStore from '../../stores/AuthStore'; // Add this import
const ProductForm = observer(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        price: '',
        quantity: '',
        colour: '',
        type: 'car',
        // Vehicle-specific fields
        engineCapacity: '',
        numberOfDoors: '4',
        category: 'sedan',
        numberOfBeds: '',
        numberOfAxles: '',
        loadCapacity: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            ProductStore.loadProduct(parseInt(id));
        }

        return () => {
            ProductStore.clearMessages();
            if (isEdit) {
                ProductStore.clearCurrentProduct();
            }
        };
    }, [isEdit, id]);

    useEffect(() => {
        if (isEdit && ProductStore.currentProduct) {
            const product = ProductStore.currentProduct;
            setFormData({
                brand: product.brand || '',
                model: product.model || '',
                price: product.price?.toString() || '',
                quantity: product.quantity?.toString() || '',
                colour: product.colour || '',
                type: product.type || 'car',
                engineCapacity: product.engineCapacity?.toString() || '',
                numberOfDoors: product.numberOfDoors?.toString() || '4',
                category: product.category || 'sedan',
                numberOfBeds: product.numberOfBeds?.toString() || '',
                numberOfAxles: product.numberOfAxles?.toString() || '',
                loadCapacity: product.loadCapacity?.toString() || ''
            });
        }
    }, [isEdit, ProductStore.currentProduct]);

    useEffect(() => {
        // Check authentication when component mounts
        const checkAuth = async () => {
            const token = localStorage.getItem('jwt_token');
            const user = localStorage.getItem('user_data');

            if (!token || !user) {
                navigate('/login', {
                    state: { message: 'Please login to create products.' }
                });
                return;
            }

            // Check if user has merchant role
            if (!AuthStore.isMerchant()) {
                // Double-check by decoding the token
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const roles = payload.roles || [];
                    
                    if (!roles.includes('ROLE_MERCHANT')) {
                        navigate('/products', {
                            state: { message: 'You must be a merchant to create products.' }
                        });
                    } else {
                        // The user has merchant role in token but not in AuthStore
                        // This might happen if the user data was incomplete during login
                        AuthStore.initAuth(); // Re-initialize auth to sync with token
                    }
                } catch (error) {
                    navigate('/login');
                }
            }
        };

        checkAuth();
    }, [navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Enhanced token debugging
        const token = localStorage.getItem('jwt_token');
        const userData = localStorage.getItem('user_data');
        if (token) {
            try {
                // Decode JWT token to check expiration
                const payload = JSON.parse(atob(token.split('.')[1]));
                const now = Math.floor(Date.now() / 1000);
                const isExpired = payload.exp < now;

                if (isExpired) {
                    console.error('JWT token has expired!');
                    ProductStore.clearMessages();
                    ProductStore.error = 'Your session has expired. Please login again.';
                    setIsSubmitting(false);
                    navigate('/login');
                    return;
                }

                // Check if user has ROLE_MERCHANT
                const roles = payload.roles || [];
                if (!roles.includes('ROLE_MERCHANT')) {
                    console.error('User does not have ROLE_MERCHANT!');
                    ProductStore.clearMessages();
                    ProductStore.error = 'You must be a merchant to create products.';
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        } else {
            console.error('No JWT token found! User needs to login.');
            ProductStore.clearMessages();
            ProductStore.error = 'Authentication required. Please login again.';
            setIsSubmitting(false);
            navigate('/login');
            return;
        }

        const submitData = {
            brand: formData.brand,
            model: formData.model,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity, 10),
            colour: formData.colour,
            type: formData.type
        };

        // Add vehicle-specific fields based on type
        if (formData.type === 'car') {
            if (formData.engineCapacity) submitData.engineCapacity = parseFloat(formData.engineCapacity);
            if (formData.numberOfDoors) submitData.numberOfDoors = parseInt(formData.numberOfDoors, 10);
            if (formData.category) submitData.category = formData.category;
        } else if (formData.type === 'motorcycle') {
            if (formData.engineCapacity) submitData.engineCapacity = parseFloat(formData.engineCapacity);
        } else if (formData.type === 'truck') {
            if (formData.engineCapacity) submitData.engineCapacity = parseFloat(formData.engineCapacity);
            if (formData.numberOfBeds) submitData.numberOfBeds = parseInt(formData.numberOfBeds, 10);
        } else if (formData.type === 'trailer') {
            if (formData.numberOfAxles) submitData.numberOfAxles = parseInt(formData.numberOfAxles, 10);
            if (formData.loadCapacity) submitData.loadCapacity = parseInt(formData.loadCapacity, 10);
        }

        // Remove empty fields
        Object.keys(submitData).forEach(key => {
            if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined || (typeof submitData[key] === 'number' && isNaN(submitData[key]))) {
                delete submitData[key];
            }
        });

        try {
            let result;
            if (isEdit) {
                result = await ProductStore.updateProduct(parseInt(id), submitData);
            } else {
                result = await ProductStore.createProduct(submitData);
            }

            if (result.success) {
                if (isEdit) {
                    navigate(`/products/${id}`);
                } else {
                    navigate('/my-products');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const vehicleTypes = [
        { value: 'car', label: 'Car' },
        { value: 'motorcycle', label: 'Motorcycle' },
        { value: 'truck', label: 'Truck' },
        { value: 'trailer', label: 'Trailer' }
    ];

    const carCategories = [
        { value: 'sedan', label: 'Sedan' },
        { value: 'hatchback', label: 'Hatchback' },
        { value: 'suv', label: 'SUV' },
        { value: 'coupe', label: 'Coupe' },
        { value: 'minivan', label: 'Minivan' },
        { value: 'pickup', label: 'Pickup' },
        { value: 'limousine', label: 'Limousine' }
    ];

    const doorOptions = [
        { value: '3', label: '3 Doors' },
        { value: '4', label: '4 Doors' },
        { value: '5', label: '5 Doors' }
    ];

    const renderVehicleSpecificFields = () => {
        switch (formData.type) {
            case 'car':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Engine Capacity (L) *</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.1"
                                min="0"
                                value={formData.engineCapacity}
                                onChange={(e) => handleChange('engineCapacity', e.target.value)}
                                required
                                isInvalid={ProductStore.validationErrors.engineCapacity}
                            />
                            <Form.Control.Feedback type="invalid">
                                {ProductStore.validationErrors.engineCapacity}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Number of Doors *</Form.Label>
                                    <Form.Select
                                        value={formData.numberOfDoors}
                                        onChange={(e) => handleChange('numberOfDoors', e.target.value)}
                                        required
                                        isInvalid={ProductStore.validationErrors.numberOfDoors}
                                    >
                                        {doorOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.numberOfDoors}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category *</Form.Label>
                                    <Form.Select
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        required
                                        isInvalid={ProductStore.validationErrors.category}
                                    >
                                        {carCategories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.category}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );

            case 'motorcycle':
                return (
                    <Form.Group className="mb-3">
                        <Form.Label>Engine Capacity (L) *</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.engineCapacity}
                            onChange={(e) => handleChange('engineCapacity', e.target.value)}
                            required
                            isInvalid={ProductStore.validationErrors.engineCapacity}
                        />
                        <Form.Control.Feedback type="invalid">
                            {ProductStore.validationErrors.engineCapacity}
                        </Form.Control.Feedback>
                    </Form.Group>
                );

            case 'truck':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Engine Capacity (L) *</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.1"
                                min="0"
                                value={formData.engineCapacity}
                                onChange={(e) => handleChange('engineCapacity', e.target.value)}
                                required
                                isInvalid={ProductStore.validationErrors.engineCapacity}
                            />
                            <Form.Control.Feedback type="invalid">
                                {ProductStore.validationErrors.engineCapacity}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Number of Beds *</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={formData.numberOfBeds}
                                onChange={(e) => handleChange('numberOfBeds', e.target.value)}
                                required
                                isInvalid={ProductStore.validationErrors.numberOfBeds}
                            />
                            <Form.Control.Feedback type="invalid">
                                {ProductStore.validationErrors.numberOfBeds}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </>
                );

            case 'trailer':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Number of Axles *</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={formData.numberOfAxles}
                                onChange={(e) => handleChange('numberOfAxles', e.target.value)}
                                required
                                isInvalid={ProductStore.validationErrors.numberOfAxles}
                            />
                            <Form.Control.Feedback type="invalid">
                                {ProductStore.validationErrors.numberOfAxles}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Load Capacity (kg) *</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                value={formData.loadCapacity}
                                onChange={(e) => handleChange('loadCapacity', e.target.value)}
                                required
                                isInvalid={ProductStore.validationErrors.loadCapacity}
                            />
                            <Form.Control.Feedback type="invalid">
                                {ProductStore.validationErrors.loadCapacity}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </>
                );

            default:
                return null;
        }
    };

    if (isEdit && ProductStore.isLoading && !ProductStore.currentProduct) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading product...</p>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Header>
                            <h3 className="mb-0">
                                {isEdit ? 'Edit Product' : 'Add New Product'}
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            {/* Back Button */}
                            <div className="mb-3">
                                <Button
                                    as={Link}
                                    to={isEdit ? `/products/${id}` : '/my-products'}
                                    variant="outline-secondary"
                                    size="sm"
                                >
                                    <i className="bi bi-arrow-left me-1"></i>
                                    Back
                                </Button>
                            </div>

                            {/* Messages */}
                            {ProductStore.error && (
                                <Alert variant="danger" dismissible onClose={() => ProductStore.clearMessages()}>
                                    {ProductStore.error}
                                </Alert>
                            )}

                            {Object.keys(ProductStore.validationErrors).length > 0 && (
                                <Alert variant="danger">
                                    <p className="mb-2"><strong>Please fix the following errors:</strong></p>
                                    <ul className="mb-0">
                                        {Object.entries(ProductStore.validationErrors).map(([field, messages]) => (
                                            <li key={field}>
                                                <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                                            </li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                {/* Type */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Vehicle Type *</Form.Label>
                                    <Form.Select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        required
                                        isInvalid={ProductStore.validationErrors.type}
                                    >
                                        {vehicleTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.type}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Brand */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Brand *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => handleChange('brand', e.target.value)}
                                        required
                                        isInvalid={ProductStore.validationErrors.brand}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.brand}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Model */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Model *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => handleChange('model', e.target.value)}
                                        required
                                        isInvalid={ProductStore.validationErrors.model}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.model}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Colour */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Colour *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.colour}
                                        onChange={(e) => handleChange('colour', e.target.value)}
                                        required
                                        isInvalid={ProductStore.validationErrors.colour}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.colour}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Price and Quantity Row */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Price *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) => handleChange('price', e.target.value)}
                                                required
                                                isInvalid={ProductStore.validationErrors.price}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {ProductStore.validationErrors.price}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Quantity *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                value={formData.quantity}
                                                onChange={(e) => handleChange('quantity', e.target.value)}
                                                required
                                                isInvalid={ProductStore.validationErrors.quantity}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {ProductStore.validationErrors.quantity}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Vehicle-specific fields */}
                                {renderVehicleSpecificFields()}

                                {/* Submit Buttons */}
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <Button
                                        as={Link}
                                        to={isEdit ? `/products/${id}` : '/my-products'}
                                        variant="outline-secondary"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                className="me-1"
                                            />
                                        )}
                                        {isEdit ? 'Update Product' : 'Create Product'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
});

export default ProductForm;
