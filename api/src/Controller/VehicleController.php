<?php

namespace App\Controller;

use App\Controller\Trait\ApiControllerTrait;
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
    use ApiControllerTrait;

    public function __construct(
        private readonly VehicleService $vehicleService,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $result = $this->vehicleService->handleVehicleList($request);

        return $this->createApiResponse($result);
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $result = $this->vehicleService->handleVehicleSearch($request);

        return $this->createApiResponse($result);
    }

    #[Route('/{id}', name: 'show', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->getUser();
        $result = $this->vehicleService->handleVehicleDetails($id, $user instanceof User ? $user : null);

        return $this->createApiResponse($result);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        $result = $this->vehicleService->handleVehicleCreation($request, $user);

        return $this->createApiResponse($result, 201);
    }

    #[Route('/{id}', name: 'update', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['PUT', 'PATCH'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        $result = $this->vehicleService->handleVehicleUpdate($id, $request, $user);

        return $this->createApiResponse($result);
    }

    #[Route('/{id}', name: 'delete', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['DELETE'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        $result = $this->vehicleService->handleVehicleDeletion($id, $user);

        return $this->createApiResponse($result);
    }

    #[Route('/my-vehicles', name: 'my_vehicles', methods: ['GET'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function myVehicles(): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        $result = $this->vehicleService->handleMerchantVehicles($user);

        return $this->createApiResponse($result);
    }

    #[Route('/{id}/follow', name: 'follow', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['POST'])]
    #[IsGranted('ROLE_BUYER')]
    public function follow(int $id): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        $result = $this->vehicleService->handleVehicleFollowAction($id, $user);

        return $this->createApiResponse($result);
    }

    #[Route('/{id}/unfollow', name: 'unfollow', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['DELETE'])]
    #[IsGranted('ROLE_BUYER')]
    public function unfollow(int $id): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        $result = $this->vehicleService->handleVehicleFollowAction($id, $user, false);

        return $this->createApiResponse($result);
    }

    #[Route('/followed', name: 'followed', methods: ['GET'])]
    #[IsGranted('ROLE_BUYER')]
    public function followedVehicles(): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        $result = $this->vehicleService->handleFollowedVehicles($user);

        return $this->createApiResponse($result);
    }
}
