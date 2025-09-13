<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Vehicle;
use App\Entity\VehicleFollow;
use App\Pagination\Paginator;
use App\Repository\VehicleFollowRepository;
use App\Repository\VehicleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class VehicleService extends AbstractService
{
    public function __construct(
        private readonly VehicleRepository $vehicleRepository,
        private readonly VehicleFollowRepository $vehicleFollowRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly ValidatorInterface $validator,
        private readonly VehicleFactory $vehicleFactory,
    ) {
    }

    /**
     * Handle vehicle listing with filters from request.
     *
     * @return array{success: bool, vehicles?: array<array<string, mixed>>, pagination?: array<string, mixed>, error?: string}
     */
    public function handleVehicleList(Request $request): array
    {
        try {
            $allowedFilters = ['brand', 'model', 'minPrice', 'maxPrice', 'inStock', 'type'];
            $filters = $this->extractFiltersFromRequest($request, $allowedFilters);

            $page = max(1, (int) $request->query->get('page', 1));
            $pageSize = min(50, max(1, (int) $request->query->get('limit', 10))); // Max 50 items per page

            $paginator = $this->vehicleRepository->findWithFilters($filters, $pageSize);
            $paginator->paginate($page);

            $vehicles = [];
            foreach ($paginator->getResults() as $vehicle) {
                $vehicles[] = $this->vehicleFactory->formatVehicleForApi($vehicle);
            }

            return [
                'success' => true,
                'vehicles' => $vehicles,
                'pagination' => $this->formatPaginationData($paginator),
            ];
        } catch (\Exception $e) {
            return $this->createErrorResponse('Failed to retrieve vehicles: ' . $e->getMessage());
        }
    }

    /**
     * Handle vehicle search from request.
     *
     * @return array{success: bool, vehicles?: array<array<string, mixed>>, pagination?: array<string, mixed>, error?: string}
     */
    public function handleVehicleSearch(Request $request): array
    {
        $searchTerm = $request->query->get('q', '');

        if (empty($searchTerm)) {
            return $this->createErrorResponse('Search term is required');
        }

        try {
            $page = max(1, (int) $request->query->get('page', 1));
            $pageSize = min(50, max(1, (int) $request->query->get('limit', 10)));

            $paginator = $this->vehicleRepository->searchVehicles($searchTerm, $pageSize);
            $paginator->paginate($page);

            $vehicles = [];
            foreach ($paginator->getResults() as $vehicle) {
                $vehicles[] = $this->vehicleFactory->formatVehicleForApi($vehicle);
            }

            return [
                'success' => true,
                'vehicles' => $vehicles,
                'pagination' => $this->formatPaginationData($paginator),
            ];
        } catch (\Exception $e) {
            return $this->createErrorResponse('Search failed: ' . $e->getMessage());
        }
    }

    /**
     * Handle vehicle details with user context.
     *
     * @return array{success: bool, vehicle?: array<string, mixed>, error?: string}
     */
    public function handleVehicleDetails(int $id, ?User $user = null): array
    {
        try {
            $vehicle = $this->getVehicleById($id);

            if (!$vehicle) {
                return $this->createErrorResponse('Vehicle not found');
            }

            $vehicleData = $this->vehicleFactory->formatVehicleForApi($vehicle);

            if ($user instanceof User && $user->isBuyer()) {
                $vehicleData['isFollowed'] = $this->isVehicleFollowedByUser($vehicle, $user);
            }

            return [
                'success' => true,
                'vehicle' => $vehicleData,
            ];
        } catch (\Exception $e) {
            return $this->createErrorResponse('Failed to retrieve vehicle details: ' . $e->getMessage());
        }
    }

    /**
     * Handle vehicle creation from request.
     *
     * @return array{success: bool, vehicle?: array<string, mixed>, error?: string, errors?: array<string, string>}
     */
    public function handleVehicleCreation(Request $request, User $user): array
    {
        if (!$user->isMerchant()) {
            return $this->createErrorResponse('Only merchants can create vehicles');
        }

        $jsonResult = $this->extractJsonData($request);
        if (!$jsonResult['success']) {
            return $jsonResult;
        }

        $data = $jsonResult['data'] ?? [];

        if (!$this->hasStringKeysOnly($data)) {
            return $this->createErrorResponse('Invalid JSON data or non-string keys');
        }

        return $this->createVehicle($data, $user);
    }

    /**
     * Handle vehicle update from request.
     *
     * @return array{success: bool, vehicle?: array<string, mixed>, error?: string, errors?: array<string, string>}
     */
    public function handleVehicleUpdate(int $id, Request $request, User $user): array
    {
        $vehicle = $this->getVehicleById($id);
        if (!$vehicle) {
            return $this->createErrorResponse('Vehicle not found');
        }

        $jsonResult = $this->extractJsonData($request);
        if (!$jsonResult['success']) {
            return $jsonResult;
        }

        $data = $jsonResult['data'] ?? [];

        if (!$this->hasStringKeysOnly($data)) {
            return $this->createErrorResponse('Invalid JSON data or non-string keys');
        }

        return $this->updateVehicle($vehicle, $data, $user);
    }

    /**
     * Handle vehicle deletion.
     *
     * @return array{success: bool, error?: string}
     */
    public function handleVehicleDeletion(int $id, User $user): array
    {
        $vehicle = $this->getVehicleById($id);
        if (!$vehicle) {
            return $this->createErrorResponse('Vehicle not found');
        }

        return $this->deleteVehicle($vehicle, $user);
    }

    /**
     * Handle merchant vehicles retrieval.
     *
     * @return array{success: bool, vehicles?: array<array<string, mixed>>, pagination?: array<string, mixed>, error?: string}
     */
    public function handleMerchantVehicles(User $user, Request $request): array
    {
        try {
            $page = max(1, (int) $request->query->get('page', 1));
            $pageSize = min(50, max(1, (int) $request->query->get('limit', 10)));

            $paginator = $this->vehicleRepository->findByMerchant($user, $pageSize);
            $paginator->paginate($page);

            $vehicles = [];
            foreach ($paginator->getResults() as $vehicle) {
                $vehicles[] = $this->vehicleFactory->formatVehicleForApi($vehicle);
            }

            return [
                'success' => true,
                'vehicles' => $vehicles,
                'pagination' => $this->formatPaginationData($paginator),
            ];
        } catch (\Exception $e) {
            return $this->createErrorResponse('Failed to retrieve merchant vehicles: ' . $e->getMessage());
        }
    }

    /**
     * Handle vehicle follow/unfollow actions.
     *
     * @return array{success: bool, error?: string, message?: string}
     */
    public function handleVehicleFollowAction(int $id, User $user, bool $follow = true): array
    {
        $vehicle = $this->getVehicleById($id);
        if (!$vehicle) {
            return $this->createErrorResponse('Vehicle not found');
        }

        return $follow ? $this->followVehicle($vehicle, $user) : $this->unfollowVehicle($vehicle, $user);
    }

    /**
     * Handle followed vehicles retrieval.
     *
     * @return array{success: bool, vehicles?: array<array<string, mixed>>, pagination?: array<string, mixed>, error?: string}
     */
    public function handleFollowedVehicles(User $user, Request $request): array
    {
        try {
            $page = max(1, (int) $request->query->get('page', 1));
            $pageSize = min(50, max(1, (int) $request->query->get('limit', 10)));

            $paginator = $this->vehicleRepository->findFollowedByUser($user, $pageSize);
            $paginator->paginate($page);

            $vehicles = [];
            foreach ($paginator->getResults() as $vehicle) {
                $vehicles[] = $this->vehicleFactory->formatVehicleForApi($vehicle);
            }

            return [
                'success' => true,
                'vehicles' => $vehicles,
                'pagination' => $this->formatPaginationData($paginator),
            ];
        } catch (\Exception $e) {
            return $this->createErrorResponse('Failed to retrieve followed vehicles: ' . $e->getMessage());
        }
    }

    /**
     * Create a new vehicle.
     *
     * @param array<string, mixed> $vehicleData
     *
     * @return array{success: bool, vehicle?: array<string, mixed>, error?: string, errors?: array<string, string>, result?: array<string, mixed>}
     */
    public function createVehicle(array $vehicleData, User $merchant): array
    {
        if (!isset($vehicleData['type']) || !\is_string($vehicleData['type'])) {
            return $this->createErrorResponse('Vehicle type is required and must be a string');
        }

        return $this->executeWithExceptionHandling(
            function () use ($vehicleData, $merchant) {
                if (!$this->entityManager->contains($merchant)) {
                    $merchant = $this->entityManager->find(User::class, $merchant->getId());
                    if (!$merchant) {
                        throw new \Exception('Merchant user not found in database');
                    }
                }

                $vehicle = $this->vehicleFactory->createVehicleByType($vehicleData['type'], $vehicleData);
                $vehicle->setMerchant($merchant);

                $validationResult = $this->handleValidationViolations($this->validator->validate($vehicle));
                if (!$validationResult['success']) {
                    return $validationResult;
                }

                $this->entityManager->persist($vehicle);
                $this->entityManager->flush();

                return ['vehicle' => $this->vehicleFactory->formatVehicleForApi($vehicle)];
            },
            'Failed to create vehicle'
        );
    }

    /**
     * Update an existing vehicle.
     *
     * @param array<string, mixed> $vehicleData
     *
     * @return array{success: bool, vehicle?: array<string, mixed>, error?: string, errors?: array<string, string>, result?: array<string, mixed>}
     */
    public function updateVehicle(Vehicle $vehicle, array $vehicleData, User $merchant): array
    {
        if ($vehicle->getMerchant()->getId() !== $merchant->getId()) {
            return $this->createErrorResponse('You can only update your own vehicles');
        }

        return $this->executeWithExceptionHandling(
            function () use ($vehicle, $vehicleData) {
                $this->vehicleFactory->updateVehicleWithData($vehicle, $vehicleData);

                $validationResult = $this->handleValidationViolations($this->validator->validate($vehicle));
                if (!$validationResult['success']) {
                    return $validationResult;
                }

                $this->entityManager->flush();

                return ['vehicle' => $this->vehicleFactory->formatVehicleForApi($vehicle)];
            },
            'Failed to update vehicle'
        );
    }

    /**
     * Delete a vehicle.
     *
     * @return array{success: bool, error?: string, result?: array<string, mixed>}
     */
    public function deleteVehicle(Vehicle $vehicle, User $merchant): array
    {
        if ($vehicle->getMerchant()->getId() !== $merchant->getId()) {
            return $this->createErrorResponse('You can only delete your own vehicles');
        }

        return $this->executeWithExceptionHandling(
            function () use ($vehicle) {
                $this->entityManager->remove($vehicle);
                $this->entityManager->flush();

                return [];
            },
            'Failed to delete vehicle'
        );
    }

    /**
     * @return array{success: bool, error?: string, message?: string}
     */
    public function followVehicle(Vehicle $vehicle, User $buyer): array
    {
        return $this->manageVehicleFollow($vehicle, $buyer, true);
    }

    /**
     * @return array{success: bool, error?: string, message?: string}
     */
    public function unfollowVehicle(Vehicle $vehicle, User $buyer): array
    {
        return $this->manageVehicleFollow($vehicle, $buyer, false);
    }

    /**
     * Follow/unfollow vehicle logic.
     *
     * @return array{success: bool, error?: string, message?: string, result?: array<string, mixed>}
     */
    private function manageVehicleFollow(Vehicle $vehicle, User $buyer, bool $follow = true): array
    {
        if (!$buyer->isBuyer()) {
            return $this->createErrorResponse('Only buyers can follow/unfollow vehicles');
        }

        $existingFollow = $this->vehicleFollowRepository->findOneBy([
            'vehicle' => $vehicle,
            'user' => $buyer,
        ]);

        if ($follow) {
            return $this->handleFollowAction($vehicle, $buyer, $existingFollow);
        }

        return $this->handleUnfollowAction($existingFollow);
    }

    /**
     * Handle follow action.
     *
     * @return array{success: bool, error?: string, message?: string, result?: array<string, mixed>}
     */
    private function handleFollowAction(Vehicle $vehicle, User $buyer, ?VehicleFollow $existingFollow): array
    {
        if ($existingFollow) {
            return $this->createErrorResponse('You are already following this vehicle');
        }

        return $this->executeWithExceptionHandling(
            function () use ($vehicle, $buyer) {
                $newFollow = new VehicleFollow();
                $newFollow->setVehicle($vehicle);
                $newFollow->setUser($buyer);
                $this->entityManager->persist($newFollow);
                $this->entityManager->flush();

                return ['message' => 'Vehicle followed successfully'];
            },
            'Failed to follow vehicle'
        );
    }

    /**
     * Handle unfollow action.
     *
     * @return array{success: bool, error?: string, message?: string, result?: array<string, mixed>}
     */
    private function handleUnfollowAction(?VehicleFollow $existingFollow): array
    {
        if (!$existingFollow) {
            return $this->createErrorResponse('You are not following this vehicle');
        }

        return $this->executeWithExceptionHandling(
            function () use ($existingFollow) {
                $this->entityManager->remove($existingFollow);
                $this->entityManager->flush();

                return ['message' => 'Vehicle unfollowed successfully'];
            },
            'Failed to unfollow vehicle'
        );
    }

    public function getVehicleById(int $id): ?Vehicle
    {
        return $this->vehicleRepository->find($id);
    }

    //    /**
    //     * @param array<string, mixed> $filters
    //     *
    //     * @return array<array<string, mixed>>
    //     */
    //    public function getAllVehicles(array $filters = []): array
    //    {
    //        $vehicles = !empty($filters)
    //            ? $this->vehicleRepository->findWithFilters($filters)
    //            : $this->vehicleRepository->findAvailableVehicles();
    //
    //        return array_map([$this->vehicleFactory, 'formatVehicleForApi'], $vehicles);
    //    }

    //    /**
    //     * @return array<array<string, mixed>>
    //     */
    //    public function searchVehicles(string $searchTerm): array
    //    {
    //        $vehicles = $this->vehicleRepository->searchVehicles($searchTerm);
    //
    //        return array_map([$this->vehicleFactory, 'formatVehicleForApi'], $vehicles);
    //    }

    //    /**
    //     * @return array<array<string, mixed>>
    //     */
    //    public function getVehiclesByMerchant(User $merchant): array
    //    {
    //        $vehicles = $this->vehicleRepository->findByMerchant($merchant);
    //
    //        return array_map([$this->vehicleFactory, 'formatVehicleForApi'], $vehicles);
    //    }

    //    /**
    //     * @return array<array<string, mixed>>
    //     */
    //    public function getFollowedVehicles(User $buyer): array
    //    {
    //        $vehicles = $this->vehicleRepository->findFollowedByUser($buyer);
    //
    //        return array_map([$this->vehicleFactory, 'formatVehicleForApi'], $vehicles);
    //    }

    public function isVehicleFollowedByUser(Vehicle $vehicle, User $user): bool
    {
        return null !== $this->vehicleFollowRepository->findOneBy([
            'vehicle' => $vehicle,
            'user' => $user,
        ]);
    }

    /**
     * Format pagination data for API response.
     *
     * @return array<string, mixed>
     */
    private function formatPaginationData(Paginator $paginator): array
    {
        return [
            'currentPage' => $paginator->getCurrentPage(),
            'lastPage' => $paginator->getLastPage(),
            'pageSize' => $paginator->getPageSize(),
            'totalResults' => $paginator->getNumResults(),
            'hasPreviousPage' => $paginator->hasPreviousPage(),
            'hasNextPage' => $paginator->hasNextPage(),
            'previousPage' => $paginator->hasPreviousPage() ? $paginator->getPreviousPage() : null,
            'nextPage' => $paginator->hasNextPage() ? $paginator->getNextPage() : null,
            'hasToPaginate' => $paginator->hasToPaginate(),
        ];
    }
}
