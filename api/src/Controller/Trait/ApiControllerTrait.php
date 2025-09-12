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
        $statusCode = match (true) {
            !$result['success'] && $this->isNotFoundError($result) => 404,
            !$result['success'] => 400,
            200 !== $successStatusCode => $successStatusCode,
            default => 200,
        };

        return $this->json($result, $statusCode);
    }

    /**
     * Check if the error indicates a "not found" scenario.
     *
     * @param array<string, mixed> $result
     */
    private function isNotFoundError(array $result): bool
    {
        $error = $result['error'] ?? '';

        return \is_string($error) && str_contains($error, 'not found');
    }
}
