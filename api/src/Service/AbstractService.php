<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\ConstraintViolationListInterface;

abstract class AbstractService
{
    /**
     * Extract and validate JSON data from request.
     *
     * @return array{success: bool, data: array<string, mixed>}|array{success: bool, error: string}
     */
    protected function extractJsonData(Request $request): array
    {
        $content = $request->getContent();
        $data = json_decode($content, true);

        if (!\is_array($data)) {
            return $this->createErrorResponse('Invalid JSON data provided');
        }

        if (!$this->hasStringKeysOnly($data)) {
            return $this->createErrorResponse('Invalid JSON data structure - numeric keys not allowed');
        }

        /** @var array<string, mixed> $validatedData */
        $validatedData = $data;

        return [
            'success' => true,
            'data' => $validatedData,
        ];
    }

    /**
     * Validate that an array has string keys only.
     *
     * @param array<mixed> $data
     */
    protected function hasStringKeysOnly(array $data): bool
    {
        return false === array_is_list($data) && array_filter(array_keys($data), 'is_string') === array_keys($data);
    }

    /**
     * Extract filters from request query parameters.
     *
     * @param array<string> $allowedFilters
     *
     * @return array<string, mixed>
     */
    protected function extractFiltersFromRequest(Request $request, array $allowedFilters): array
    {
        $filters = [];
        $booleanFilters = ['inStock'];

        foreach ($allowedFilters as $filter) {
            if ($request->query->has($filter)) {
                $filters[$filter] = \in_array($filter, $booleanFilters, true)
                    ? $request->query->getBoolean($filter)
                    : $request->query->get($filter);
            }
        }

        return $filters;
    }

    /**
     * Validate required fields in data array.
     *
     * @param array<string, mixed> $data
     * @param array<string>        $requiredFields
     *
     * @return array{success: bool, error?: string}
     */
    protected function validateRequiredFields(array $data, array $requiredFields): array
    {
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || !\is_string($data[$field]) || empty(trim($data[$field]))) {
                return $this->createErrorResponse(ucfirst($field) . ' is required');
            }
        }

        return ['success' => true];
    }

    /**
     * Handle Symfony validation errors.
     *
     * @return array{success: bool, errors?: array<string, string>}
     */
    protected function handleValidationViolations(ConstraintViolationListInterface $violations): array
    {
        if (0 === \count($violations)) {
            return ['success' => true];
        }

        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }

        return [
            'success' => false,
            'errors' => $errors,
        ];
    }

    /**
     * Safely cast numeric value to string.
     */
    protected function castToNumericString(mixed $value, string $default = '0.00'): string
    {
        return is_numeric($value) ? (string) $value : $default;
    }

    /**
     * Safely cast value to integer.
     */
    protected function castToInt(mixed $value, int $default = 0): int
    {
        if (\is_int($value)) {
            return $value;
        }

        if (\is_string($value) && ctype_digit($value)) {
            return (int) $value;
        }

        return $default;
    }

    /**
     * Safely cast value to string.
     */
    protected function castToString(mixed $value, string $default = ''): string
    {
        return \is_string($value) ? $value : $default;
    }

    /**
     * Execute operation with exception handling.
     *
     * @template T
     *
     * @param callable(): T $operation
     *
     * @return array{success: bool, result?: T, error?: string}
     */
    protected function executeWithExceptionHandling(callable $operation, string $errorMessage): array
    {
        try {
            $result = $operation();

            return [
                'success' => true,
                'result' => $result,
            ];
        } catch (\Exception $e) {
            return $this->createErrorResponse($errorMessage . ': ' . $e->getMessage());
        }
    }

    /**
     * Create standardized error response.
     *
     * @return array{success: bool, error: string}
     */
    protected function createErrorResponse(string $error): array
    {
        return [
            'success' => false,
            'error' => $error,
        ];
    }
}
