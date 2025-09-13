<?php

namespace App\Controller\Trait;

use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;

trait ApiControllerTrait
{
    /**
     * Get authenticated user or throw exception.
     */
    private function getAuthenticatedUser(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw new \RuntimeException('Authentication required');
        }

        return $user;
    }

    /**
     * Create standardized API response.
     *
     * @param array<string, mixed> $result
     */
    private function createApiResponse(array $result, int $successStatusCode = 200): JsonResponse
    {
        $statusCode = $this->determineStatusCode($result, $successStatusCode);
        return $this->json($result, $statusCode);
    }

    /**
     * Determine appropriate HTTP status code based on result.
     *
     * @param array<string, mixed> $result
     */
    private function determineStatusCode(array $result, int $successStatusCode): int
    {
        if ($result['success'] ?? true) {
            return $successStatusCode;
        }

        $error = $result['error'] ?? '';
        if (is_string($error) && str_contains(strtolower($error), 'not found')) {
            return 404;
        }

        if (isset($result['errors']) && is_array($result['errors'])) {
            return 422;
        }

        return 400;
    }
}
