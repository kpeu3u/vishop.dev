<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\VehicleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/vehicles', name: 'api_vehicle_')]
class VehicleController extends AbstractController
{
    public function __construct(
        private readonly VehicleService $vehicleService,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $filters = [];

        if ($request->query->has('brand')) {
            $filters['brand'] = $request->query->get('brand');
        }
        if ($request->query->has('model')) {
            $filters['model'] = $request->query->get('model');
        }
        if ($request->query->has('minPrice')) {
            $filters['minPrice'] = $request->query->get('minPrice');
        }
        if ($request->query->has('maxPrice')) {
            $filters['maxPrice'] = $request->query->get('maxPrice');
        }
        if ($request->query->has('inStock')) {
            $filters['inStock'] = $request->query->getBoolean('inStock');
        }

        $vehicles = $this->vehicleService->getAllVehicles($filters);

        return $this->json([
            'success' => true,
            'vehicles' => $vehicles,
        ]);
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->query->get('q', '');

        if (empty($searchTerm)) {
            return $this->json([
                'success' => false,
                'error' => 'Search term is required',
            ], 400);
        }

        $vehicles = $this->vehicleService->searchVehicles($searchTerm);

        return $this->json([
            'success' => true,
            'vehicles' => $vehicles,
        ]);
    }

    #[Route('/{id}', name: 'show', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $vehicle = $this->vehicleService->getVehicleById($id);

        if (!$vehicle) {
            return $this->json([
                'success' => false,
                'error' => 'Vehicle not found',
            ], 404);
        }

        $vehicleData = $this->vehicleService->formatVehicle($vehicle);

        // Add follow status if user is authenticated and is a buyer
        $user = $this->getUser();
        if ($user instanceof User && $user->isBuyer()) {
            $vehicleData['isFollowed'] = $this->vehicleService->isVehicleFollowedByUser($vehicle, $user);
        }

        return $this->json([
            'success' => true,
            'vehicle' => $vehicleData,
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_MERCHANT')] // Re-enable this
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user - not authenticated properly',
            ], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!$this->isValidVehicleData($data)) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data or non-string keys',
            ], 400);
        }

        /** @var array<string, mixed> $data */
        $result = $this->vehicleService->createVehicle($data, $user);

        return $this->json($result, $result['success'] ? 201 : 400);
    }

    #[Route('/{id}', name: 'update', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['PUT', 'PATCH'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $vehicle = $this->vehicleService->getVehicleById($id);

        if (!$vehicle) {
            return $this->json([
                'success' => false,
                'error' => 'Vehicle not found',
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!$this->isValidVehicleData($data)) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data or non-string keys',
            ], 400);
        }

        /** @var array<string, mixed> $data */
        $result = $this->vehicleService->updateVehicle($vehicle, $data, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/{id}', name: 'delete', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['DELETE'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $vehicle = $this->vehicleService->getVehicleById($id);

        if (!$vehicle) {
            return $this->json([
                'success' => false,
                'error' => 'Vehicle not found',
            ], 404);
        }

        $result = $this->vehicleService->deleteVehicle($vehicle, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/my-vehicles', name: 'my_vehicles', methods: ['GET'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function myVehicles(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $vehicles = $this->vehicleService->getVehiclesByMerchant($user);

        return $this->json([
            'success' => true,
            'vehicles' => $vehicles,
        ]);
    }

    #[Route('/{id}/follow', name: 'follow', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['POST'])]
    #[IsGranted('ROLE_BUYER')]
    public function follow(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $vehicle = $this->vehicleService->getVehicleById($id);

        if (!$vehicle) {
            return $this->json([
                'success' => false,
                'error' => 'Vehicle not found',
            ], 404);
        }

        $result = $this->vehicleService->followVehicle($vehicle, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/{id}/unfollow', name: 'unfollow', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['DELETE'])]
    #[IsGranted('ROLE_BUYER')]
    public function unfollow(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $vehicle = $this->vehicleService->getVehicleById($id);

        if (!$vehicle) {
            return $this->json([
                'success' => false,
                'error' => 'Vehicle not found',
            ], 404);
        }

        $result = $this->vehicleService->unfollowVehicle($vehicle, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/followed', name: 'followed', methods: ['GET'])]
    #[IsGranted('ROLE_BUYER')]
    public function followedVehicles(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $vehicles = $this->vehicleService->getFollowedVehicles($user);

        return $this->json([
            'success' => true,
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Validates that the data is an associative array with string keys.
     */
    private function isValidVehicleData(mixed $data): bool
    {
        if (!\is_array($data)) {
            return false;
        }

        // Check if all keys are strings (associative array)
        foreach (array_keys($data) as $key) {
            if (!\is_string($key)) {
                return false;
            }
        }

        return true;
    }
}
