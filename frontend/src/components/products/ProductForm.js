import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import ProductStore from '../../stores/ProductStore';

const ProductForm = observer(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        quantity: '',
        brand: '',
        model: '',
        type: 'car',
        imageUrl: ''
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
                title: product.title || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                quantity: product.quantity?.toString() || '',
                brand: product.brand || '',
                model: product.model || '',
                type: product.type || 'car',
                imageUrl: product.imageUrl || ''
            });
        }
    }, [isEdit, ProductStore.currentProduct]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const submitData = {
            ...formData,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity, 10)
        };

        // Remove empty fields
        Object.keys(submitData).forEach(key => {
            if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
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
                                {/* Title */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Title *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        required
                                        isInvalid={ProductStore.validationErrors.title}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.title}
                                    </Form.Control.Feedback>
                                </Form.Group>

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
                                    <Form.Label>Brand</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => handleChange('brand', e.target.value)}
                                        isInvalid={ProductStore.validationErrors.brand}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.brand}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Model */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Model</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => handleChange('model', e.target.value)}
                                        isInvalid={ProductStore.validationErrors.model}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.model}
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

                                {/* Description */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        isInvalid={ProductStore.validationErrors.description}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.description}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Image URL */}
                                <Form.Group className="mb-4">
                                    <Form.Label>Image URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        isInvalid={ProductStore.validationErrors.imageUrl}
                                    />
                                    <Form.Text className="text-muted">
                                        Optional: Enter a URL for the product image
                                    </Form.Text>
                                    <Form.Control.Feedback type="invalid">
                                        {ProductStore.validationErrors.imageUrl}
                                    </Form.Control.Feedback>
                                </Form.Group>

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
