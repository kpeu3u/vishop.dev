import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

const VehicleFilters = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        brand: '',
        model: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        type: ''
    });

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);

        // Remove empty filters
        const cleanFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, v]) => v !== '' && v !== false)
        );

        onFilterChange(cleanFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            brand: '',
            model: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            type: ''
        };
        setFilters(clearedFilters);
        onFilterChange({});
    };

    const vehicleTypes = [
        { value: 'car', label: 'Cars' },
        { value: 'motorcycle', label: 'Motorcycles' },
        { value: 'truck', label: 'Trucks' },
        { value: 'trailer', label: 'Trailers' },
        { value: 'cart', label: 'Cart' }
    ];

    return (
        <Card>
            <Card.Header>
                <h5 className="mb-0">Filters</h5>
            </Card.Header>
            <Card.Body>
                {/* Vehicle Type */}
                <Form.Group className="mb-3">
                    <Form.Label>Vehicle Type</Form.Label>
                    <Form.Select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="">All Types</option>
                        {vehicleTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* Brand */}
                <Form.Group className="mb-3">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter brand..."
                        value={filters.brand}
                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                    />
                </Form.Group>

                {/* Model */}
                <Form.Group className="mb-3">
                    <Form.Label>Model</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter model..."
                        value={filters.model}
                        onChange={(e) => handleFilterChange('model', e.target.value)}
                    />
                </Form.Group>

                {/* Price Range */}
                <Form.Group className="mb-3">
                    <Form.Label>Price Range</Form.Label>
                    <Row>
                        <Col>
                            <Form.Control
                                type="number"
                                placeholder="Min price"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                        </Col>
                        <Col>
                            <Form.Control
                                type="number"
                                placeholder="Max price"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </Col>
                    </Row>
                </Form.Group>

                {/* In Stock Filter */}
                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        id="inStockFilter"
                        label="In Stock Only"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    />
                </Form.Group>

                {/* Clear Filters Button */}
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={clearFilters}
                    className="w-100"
                >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear Filters
                </Button>
            </Card.Body>
        </Card>
    );
};

export default VehicleFilters;
