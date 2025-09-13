<?php

namespace App\Service;

use App\Enum\VehicleType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RequestValidationService
{
    private const ALLOWED_FILTERS = ['brand', 'model', 'minPrice', 'maxPrice', 'inStock', 'type'];
    private const VALID_VEHICLE_TYPES = ['motorcycle', 'car', 'truck', 'trailer', 'cart'];

    /**
     * Extract and validate query filters from request.
     *
     * @return array{success: bool, filters?: array<string, mixed>, errors?: array<string, string>, error?: string}
     */
    public function validateQueryFilters(Request $request): array
    {
        $filters = [];

        foreach (self::ALLOWED_FILTERS as $filter) {
            if ($request->query->has($filter)) {
                $filters[$filter] = $filter === 'inStock'
                    ? $request->query->getBoolean($filter)
                    : $request->query->get($filter);
            }
        }

        if (empty($filters)) {
            return ['success' => true, 'filters' => []];
        }

        $validationErrors = $this->validateFilters($filters);
        if (!empty($validationErrors)) {
            return [
                'success' => false,
                'errors' => $validationErrors,
            ];
        }

        return ['success' => true, 'filters' => $filters];
    }

    /**
     * Validate search query parameter.
     *
     * @return array{success: bool, query?: string, error?: string}
     */
    public function validateSearchQuery(Request $request): array
    {
        $query = trim($request->query->get('q', ''));

        if (empty($query)) {
            return ['success' => false, 'error' => 'Search term is required'];
        }

        if (strlen($query) < 2) {
            return ['success' => false, 'error' => 'Search term must be at least 2 characters long'];
        }

        if (strlen($query) > 255) {
            return ['success' => false, 'error' => 'Search term cannot be longer than 255 characters'];
        }

        return ['success' => true, 'query' => $query];
    }

    /**
     * Extract and validate JSON request data.
     *
     * @return array{success: bool, data?: array<string, mixed>, error?: string}
     */
    public function validateJsonRequest(Request $request): array
    {
        $content = $request->getContent();

        if (empty($content)) {
            return ['success' => false, 'error' => 'Request body cannot be empty'];
        }

        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['success' => false, 'error' => 'Invalid JSON: ' . json_last_error_msg()];
        }

        if (!is_array($data)) {
            return ['success' => false, 'error' => 'Request data must be a JSON object'];
        }

        if (!$this->hasStringKeysOnly($data)) {
            return ['success' => false, 'error' => 'Invalid JSON data structure - numeric keys not allowed'];
        }

        return ['success' => true, 'data' => $data];
    }

    /**
     * Validate vehicle creation data.
     *
     * @param array<string, mixed> $data
     * @return array{success: bool, errors?: array<string, string>}
     */
    public function validateVehicleCreationData(array $data): array
    {
        $errors = [];

        // Required fields validation
        if (empty($data['type']) || !is_string($data['type'])) {
            $errors['type'] = 'Vehicle type is required';
        } elseif (!in_array($data['type'], self::VALID_VEHICLE_TYPES, true)) {
            $errors['type'] = 'Invalid vehicle type';
        }

        if (empty($data['brand']) || !is_string($data['brand'])) {
            $errors['brand'] = 'Brand is required';
        } elseif (strlen($data['brand']) > 100) {
            $errors['brand'] = 'Brand cannot be longer than 100 characters';
        }

        if (empty($data['model']) || !is_string($data['model'])) {
            $errors['model'] = 'Model is required';
        } elseif (strlen($data['model']) > 100) {
            $errors['model'] = 'Model cannot be longer than 100 characters';
        }

        if (!isset($data['price']) || !is_numeric($data['price']) || (float)$data['price'] <= 0) {
            $errors['price'] = 'Price is required and must be positive';
        }

        if (!isset($data['quantity']) || !is_int($data['quantity']) || $data['quantity'] < 0) {
            $errors['quantity'] = 'Quantity is required and must be zero or positive';
        }

        // Optional fields validation
        $errors = array_merge($errors, $this->validateOptionalVehicleFields($data));

        return empty($errors) ? ['success' => true] : ['success' => false, 'errors' => $errors];
    }

    /**
     * Validate vehicle update data.
     *
     * @param array<string, mixed> $data
     * @return array{success: bool, errors?: array<string, string>}
     */
    public function validateVehicleUpdateData(array $data): array
    {
        $errors = [];

        if (isset($data['brand'])) {
            if (!is_string($data['brand']) || strlen($data['brand']) > 100) {
                $errors['brand'] = 'Brand must be a string and cannot be longer than 100 characters';
            }
        }

        if (isset($data['model'])) {
            if (!is_string($data['model']) || strlen($data['model']) > 100) {
                $errors['model'] = 'Model must be a string and cannot be longer than 100 characters';
            }
        }

        if (isset($data['price'])) {
            if (!is_numeric($data['price']) || (float)$data['price'] <= 0) {
                $errors['price'] = 'Price must be positive';
            }
        }

        if (isset($data['quantity'])) {
            if (!is_int($data['quantity']) || $data['quantity'] < 0) {
                $errors['quantity'] = 'Quantity must be zero or positive';
            }
        }

        $errors = array_merge($errors, $this->validateOptionalVehicleFields($data));

        return empty($errors) ? ['success' => true] : ['success' => false, 'errors' => $errors];
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, string>
     */
    private function validateFilters(array $filters): array
    {
        $errors = [];

        if (isset($filters['brand']) && strlen($filters['brand']) > 100) {
            $errors['brand'] = 'Brand filter cannot be longer than 100 characters';
        }

        if (isset($filters['model']) && strlen($filters['model']) > 100) {
            $errors['model'] = 'Model filter cannot be longer than 100 characters';
        }

        if (isset($filters['minPrice']) && (!is_numeric($filters['minPrice']) || (float)$filters['minPrice'] < 0)) {
            $errors['minPrice'] = 'Minimum price must be zero or positive';
        }

        if (isset($filters['maxPrice']) && (!is_numeric($filters['maxPrice']) || (float)$filters['maxPrice'] < 0)) {
            $errors['maxPrice'] = 'Maximum price must be zero or positive';
        }

        if (isset($filters['minPrice']) && isset($filters['maxPrice'])) {
            $minPrice = (float)$filters['minPrice'];
            $maxPrice = (float)$filters['maxPrice'];
            if ($minPrice > $maxPrice) {
                $errors['minPrice'] = 'Minimum price cannot be greater than maximum price';
            }
        }

        if (isset($filters['type']) && !in_array($filters['type'], self::VALID_VEHICLE_TYPES, true)) {
            $errors['type'] = 'Invalid vehicle type';
        }

        if (isset($filters['inStock']) && !is_bool($filters['inStock'])) {
            $errors['inStock'] = 'In stock filter must be a boolean';
        }

        return $errors;
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, string>
     */
    private function validateOptionalVehicleFields(array $data): array
    {
        $errors = [];

        if (isset($data['color']) && (strlen($data['color']) > 30 || !is_string($data['color']))) {
            $errors['color'] = 'Color must be a string and cannot be longer than 30 characters';
        }

        if (isset($data['category']) && (strlen($data['category']) > 50 || !is_string($data['category']))) {
            $errors['category'] = 'Category must be a string and cannot be longer than 50 characters';
        }

        if (isset($data['engineCapacity']) && (!is_numeric($data['engineCapacity']) || (float)$data['engineCapacity'] < 0)) {
            $errors['engineCapacity'] = 'Engine capacity must be zero or positive';
        }

        if (isset($data['permittedMaxMass']) && (!is_numeric($data['permittedMaxMass']) || (float)$data['permittedMaxMass'] < 0)) {
            $errors['permittedMaxMass'] = 'Permitted max mass must be zero or positive';
        }

        return $errors;
    }

    /**
     * @param array<mixed> $data
     */
    private function hasStringKeysOnly(array $data): bool
    {
        return !array_is_list($data) && array_filter(array_keys($data), 'is_string') === array_keys($data);
    }
}
