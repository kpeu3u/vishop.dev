import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import VehicleStore from '../../stores/VehicleStore';
import AuthStore from '../../stores/AuthStore'; // Add this import
const VehicleForm = observer(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        price: '',
        quantity: '',
        type: 'car',
        // Vehicle-specific fields
        colour: '',
        engineCapacity: '',
        numberOfDoors: '4',
        category: 'sedan',
        numberOfBeds: '',
        numberOfAxles: '',
        loadCapacity: '',
        permittedMaximumMass: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            VehicleStore.loadVehicle(parseInt(id));
        }

        return () => {
            VehicleStore.clearMessages();
            if (isEdit) {
                VehicleStore.clearCurrentVehicle();
            }
        };
    }, [isEdit, id]);

    useEffect(() => {
        if (isEdit && VehicleStore.currentVehicle) {
            const vehicle = VehicleStore.currentVehicle;
            setFormData({
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                price: vehicle.price?.toString() || '',
                quantity: vehicle.quantity?.toString() || '',
                colour: vehicle.colour.toString() || '',
                type: vehicle.type || 'car',
                engineCapacity: vehicle.engineCapacity?.toString() || '',
                numberOfDoors: vehicle.numberOfDoors?.toString() || '4',
                category: vehicle.category || 'sedan',
                numberOfBeds: vehicle.numberOfBeds?.toString() || '',
                numberOfAxles: vehicle.numberOfAxles?.toString() || '',
                loadCapacity: vehicle.loadCapacity?.toString() || '',
                permittedMaximumMass: vehicle.permittedMaximumMass?.toString() || ''
            });
        }
    }, [isEdit, VehicleStore.currentVehicle]);

    useEffect(() => {
        // Check authentication when component mounts
        const checkAuth = async () => {
            const token = localStorage.getItem('jwt_token');
            const user = localStorage.getItem('user_data');

            if (!token || !user) {
                navigate('/login', {
                    state: { message: 'Please login to create vehicles.' }
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
                        navigate('/vehicles', {
                            state: { message: 'You must be a merchant to create vehicles.' }
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
                    VehicleStore.clearMessages();
                    VehicleStore.error = 'Your session has expired. Please login again.';
                    setIsSubmitting(false);
                    navigate('/login');
                    return;
                }

                // Check if user has ROLE_MERCHANT
                const roles = payload.roles || [];
                if (!roles.includes('ROLE_MERCHANT')) {
                    console.error('User does not have ROLE_MERCHANT!');
                    VehicleStore.clearMessages();
                    VehicleStore.error = 'You must be a merchant to create vehicles.';
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        } else {
            console.error('No JWT token found! User needs to login.');
            VehicleStore.clearMessages();
            VehicleStore.error = 'Authentication required. Please login again.';
            setIsSubmitting(false);
            navigate('/login');
            return;
        }

        const submitData = {
            brand: formData.brand,
            model: formData.model,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity, 10),
            type: formData.type
        };

        // Add vehicle-specific fields based on type
        if (formData.type === 'car') {
            if (formData.engineCapacity) submitData.engineCapacity = parseFloat(formData.engineCapacity);
            if (formData.numberOfDoors) submitData.numberOfDoors = parseInt(formData.numberOfDoors, 10);
            if (formData.category) submitData.category = formData.category;
            if (formData.colour) submitData.colour = formData.colour;
            if (formData.permittedMaximumMass) submitData.permittedMaximumMass = parseInt(formData.permittedMaximumMass, 10);
        } else if (formData.type === 'motorcycle') {
            if (formData.engineCapacity) submitData.engineCapacity = parseFloat(formData.engineCapacity);
            if (formData.colour) submitData.colour = formData.colour;
        } else if (formData.type === 'truck') {
            if (formData.engineCapacity) submitData.engineCapacity = parseFloat(formData.engineCapacity);
            if (formData.numberOfBeds) submitData.numberOfBeds = parseInt(formData.numberOfBeds, 10);
            if (formData.colour) submitData.colour = formData.colour;
            if (formData.permittedMaximumMass) submitData.permittedMaximumMass = parseInt(formData.permittedMaximumMass, 10);
        } else if (formData.type === 'trailer') {
            if (formData.numberOfAxles) submitData.numberOfAxles = parseInt(formData.numberOfAxles, 10);
            if (formData.loadCapacity) submitData.loadCapacity = parseInt(formData.loadCapacity, 10);
            if (formData.permittedMaximumMass) submitData.permittedMaximumMass = parseInt(formData.permittedMaximumMass, 10);
        } else if(formData.type === 'cart'){
            if (formData.colour) submitData.colour = formData.colour;
            if (formData.loadCapacity) submitData.loadCapacity = parseInt(formData.loadCapacity, 10);
            if (formData.permittedMaximumMass) submitData.permittedMaximumMass = parseInt(formData.permittedMaximumMass, 10);
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
                result = await VehicleStore.updateVehicle(parseInt(id), submitData);
            } else {
                result = await VehicleStore.createVehicle(submitData);
            }

            if (result.success) {
                if (isEdit) {
                    navigate(`/vehicles/${id}`);
                } else {
                    navigate('/my-vehicles');
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
        { value: 'trailer', label: 'Trailer' },
        { value: 'cart', label: 'Cart' }
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
                            <Form.Label>Colour *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.colour}
                                onChange={(e) => handleChange('colour', e.target.value)}
                                required
                                isInvalid={VehicleStore.validationErrors.colour}
                            />
                            <Form.Control.Feedback type="invalid">
                                {VehicleStore.validationErrors.colour}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Engine Capacity (L) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.engineCapacity}
                                        onChange={(e) => handleChange('engineCapacity', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.engineCapacity}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.engineCapacity}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Permitted Maximum Mass (kg) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.permittedMaximumMass || ''}
                                        onChange={(e) => handleChange('permittedMaximumMass', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.permittedMaximumMass}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.permittedMaximumMass}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Number of Doors *</Form.Label>
                                    <Form.Select
                                        value={formData.numberOfDoors}
                                        onChange={(e) => handleChange('numberOfDoors', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.numberOfDoors}
                                    >
                                        {doorOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.numberOfDoors}
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
                                        isInvalid={VehicleStore.validationErrors.category}
                                    >
                                        {carCategories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.category}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );

            case 'motorcycle':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Colour *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.colour}
                                onChange={(e) => handleChange('colour', e.target.value)}
                                required
                                isInvalid={VehicleStore.validationErrors.colour}
                            />
                            <Form.Control.Feedback type="invalid">
                                {VehicleStore.validationErrors.colour}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Engine Capacity (L) *</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.1"
                                min="0"
                                value={formData.engineCapacity}
                                onChange={(e) => handleChange('engineCapacity', e.target.value)}
                                required
                                isInvalid={VehicleStore.validationErrors.engineCapacity}
                            />
                            <Form.Control.Feedback type="invalid">
                                {VehicleStore.validationErrors.engineCapacity}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </>
                );

            case 'truck':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Colour *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.colour}
                                onChange={(e) => handleChange('colour', e.target.value)}
                                required
                                isInvalid={VehicleStore.validationErrors.colour}
                            />
                            <Form.Control.Feedback type="invalid">
                                {VehicleStore.validationErrors.colour}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Engine Capacity (L) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.engineCapacity}
                                        onChange={(e) => handleChange('engineCapacity', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.engineCapacity}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.engineCapacity}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Permitted Maximum Mass (kg) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.permittedMaximumMass || ''}
                                        onChange={(e) => handleChange('permittedMaximumMass', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.permittedMaximumMass}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.permittedMaximumMass}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Number of Beds *</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={formData.numberOfBeds}
                                onChange={(e) => handleChange('numberOfBeds', e.target.value)}
                                required
                                isInvalid={VehicleStore.validationErrors.numberOfBeds}
                            />
                            <Form.Control.Feedback type="invalid">
                                {VehicleStore.validationErrors.numberOfBeds}
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
                                isInvalid={VehicleStore.validationErrors.numberOfAxles}
                            />
                            <Form.Control.Feedback type="invalid">
                                {VehicleStore.validationErrors.numberOfAxles}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Load Capacity (kg) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.loadCapacity}
                                        onChange={(e) => handleChange('loadCapacity', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.loadCapacity}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.loadCapacity}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Permitted Maximum Mass (kg) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.permittedMaximumMass || ''}
                                        onChange={(e) => handleChange('permittedMaximumMass', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.permittedMaximumMass}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.permittedMaximumMass}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );
            case 'cart':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Colour *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.colour}
                                onChange={(e) => handleChange('colour', e.target.value)}
                                required
                                isInvalid={VehicleStore.validationErrors.colour}
                            />
                            <Form.Control.Feedback type="invalid">
                                {VehicleStore.validationErrors.colour}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Load Capacity (kg) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.loadCapacity}
                                        onChange={(e) => handleChange('loadCapacity', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.loadCapacity}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.loadCapacity}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Permitted Maximum Mass (kg) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.permittedMaximumMass || ''}
                                        onChange={(e) => handleChange('permittedMaximumMass', e.target.value)}
                                        required
                                        isInvalid={VehicleStore.validationErrors.permittedMaximumMass}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.permittedMaximumMass}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );

            default:
                return null;
        }
    };

    if (isEdit && VehicleStore.isLoading && !VehicleStore.currentVehicle) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading vehicle...</p>
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
                                {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            {/* Back Button */}
                            <div className="mb-3">
                                <Button
                                    as={Link}
                                    to={isEdit ? `/vehicles/${id}` : '/my-vehicles'}
                                    variant="outline-secondary"
                                    size="sm"
                                >
                                    <i className="bi bi-arrow-left me-1"></i>
                                    Back
                                </Button>
                            </div>

                            {/* Messages */}
                            {VehicleStore.error && (
                                <Alert variant="danger" dismissible onClose={() => VehicleStore.clearMessages()}>
                                    {VehicleStore.error}
                                </Alert>
                            )}

                            {Object.keys(VehicleStore.validationErrors).length > 0 && (
                                <Alert variant="danger">
                                    <p className="mb-2"><strong>Please fix the following errors:</strong></p>
                                    <ul className="mb-0">
                                        {Object.entries(VehicleStore.validationErrors).map(([field, messages]) => (
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
                                        isInvalid={VehicleStore.validationErrors.type}
                                    >
                                        {vehicleTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.type}
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
                                        isInvalid={VehicleStore.validationErrors.brand}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.brand}
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
                                        isInvalid={VehicleStore.validationErrors.model}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {VehicleStore.validationErrors.model}
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
                                                isInvalid={VehicleStore.validationErrors.price}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {VehicleStore.validationErrors.price}
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
                                                isInvalid={VehicleStore.validationErrors.quantity}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {VehicleStore.validationErrors.quantity}
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
                                        to={isEdit ? `/vehicles/${id}` : '/my-vehicles'}
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
                                        {isEdit ? 'Update Vehicle' : 'Create Vehicle'}
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

export default VehicleForm;
