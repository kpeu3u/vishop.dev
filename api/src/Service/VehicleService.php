<?php

namespace App\Service;

use App\Entity\Car;
use App\Entity\Motorcycle;
use App\Entity\Trailer;
use App\Entity\Truck;
use App\Entity\User;
use App\Entity\Vehicle;
use App\Entity\VehicleFollow;
use App\Enum\CarCategory;
use App\Repository\VehicleFollowRepository;
use App\Repository\VehicleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

readonly class VehicleService
{
    public function __construct(
        private VehicleRepository $vehicleRepository,
        private VehicleFollowRepository $vehicleFollowRepository,
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator,
    ) {
    }

    /**
     * @param array<string, mixed> $vehicleData
     *
     * @return array{success: bool, error?: string, errors?: array<string, string>, vehicle?: array<string, mixed>}
     */
    public function createVehicle(array $vehicleData, User $merchant): array
    {
        if (!$merchant->isMerchant()) {
            return [
                'success' => false,
                'error' => 'Only merchants can create vehicles',
            ];
        }

        // Validate required type field
        if (!isset($vehicleData['type']) || !\is_string($vehicleData['type'])) {
            return [
                'success' => false,
                'error' => 'Vehicle type is required and must be a string',
            ];
        }

        try {
            // Ensure the merchant is properly managed by the EntityManager
            if (!$this->entityManager->contains($merchant)) {
                $merchant = $this->entityManager->find(User::class, $merchant->getId());
                if (!$merchant) {
                    throw new \Exception('Merchant user not found in database');
                }
            }

            $vehicle = $this->createVehicleByType($vehicleData['type'], $vehicleData);
            $vehicle->setMerchant($merchant);

            $violations = $this->validator->validate($vehicle);
            if (\count($violations) > 0) {
                $errors = [];
                foreach ($violations as $violation) {
                    $errors[$violation->getPropertyPath()] = $violation->getMessage();
                }

                return [
                    'success' => false,
                    'errors' => $errors,
                ];
            }

            $this->entityManager->persist($vehicle);
            $this->entityManager->flush();

            return [
                'success' => true,
                'vehicle' => $this->formatVehicle($vehicle),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to create vehicle: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @param array<string, mixed> $vehicleData
     *
     * @return array{success: bool, error?: string, errors?: array<string, string>, vehicle?: array<string, mixed>}
     */
    public function updateVehicle(Vehicle $vehicle, array $vehicleData, User $merchant): array
    {
        if ($vehicle->getMerchant()->getId() !== $merchant->getId()) {
            return [
                'success' => false,
                'error' => 'You can only update your own vehicles',
            ];
        }

        try {
            $this->updateVehicleData($vehicle, $vehicleData);

            $violations = $this->validator->validate($vehicle);
            if (\count($violations) > 0) {
                $errors = [];
                foreach ($violations as $violation) {
                    $errors[$violation->getPropertyPath()] = $violation->getMessage();
                }

                return [
                    'success' => false,
                    'errors' => $errors,
                ];
            }

            $this->entityManager->flush();

            return [
                'success' => true,
                'vehicle' => $this->formatVehicle($vehicle),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to update vehicle: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array{success: bool, error?: string}
     */
    public function deleteVehicle(Vehicle $vehicle, User $merchant): array
    {
        if ($vehicle->getMerchant()->getId() !== $merchant->getId()) {
            return [
                'success' => false,
                'error' => 'You can only delete your own vehicles',
            ];
        }

        try {
            $this->entityManager->remove($vehicle);
            $this->entityManager->flush();

            return ['success' => true];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to delete vehicle: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array<array<string, mixed>>
     */
    public function getVehiclesByMerchant(User $merchant): array
    {
        $vehicles = $this->vehicleRepository->findByMerchant($merchant);

        return array_map(fn (Vehicle $vehicle) => $this->formatVehicle($vehicle), $vehicles);
    }

    /**
     * @param array<string, mixed> $filters
     *
     * @return array<array<string, mixed>>
     */
    public function getAllVehicles(array $filters = []): array
    {
        if (!empty($filters)) {
            $vehicles = $this->vehicleRepository->findWithFilters($filters);
        } else {
            $vehicles = $this->vehicleRepository->findAvailableVehicles();
        }

        return array_map(fn (Vehicle $vehicle) => $this->formatVehicle($vehicle), $vehicles);
    }

    public function getVehicleById(int $id): ?Vehicle
    {
        return $this->vehicleRepository->find($id);
    }

    /**
     * @return array<array<string, mixed>>
     */
    public function searchVehicles(string $searchTerm): array
    {
        $vehicles = $this->vehicleRepository->searchVehicles($searchTerm);

        return array_map(fn (Vehicle $vehicle) => $this->formatVehicle($vehicle), $vehicles);
    }

    /**
     * @return array{success: bool, error?: string, message?: string}
     */
    public function followVehicle(Vehicle $vehicle, User $buyer): array
    {
        if (!$buyer->isBuyer()) {
            return [
                'success' => false,
                'error' => 'Only buyers can follow vehicles',
            ];
        }

        $existingFollow = $this->vehicleFollowRepository->findOneBy([
            'vehicle' => $vehicle,
            'user' => $buyer,
        ]);

        if ($existingFollow) {
            return [
                'success' => false,
                'error' => 'You are already following this vehicle',
            ];
        }

        try {
            $follow = new VehicleFollow();
            $follow->setVehicle($vehicle);
            $follow->setUser($buyer);

            $this->entityManager->persist($follow);
            $this->entityManager->flush();

            return [
                'success' => true,
                'message' => 'Vehicle followed successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to follow vehicle: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array{success: bool, error?: string, message?: string}
     */
    public function unfollowVehicle(Vehicle $vehicle, User $buyer): array
    {
        $follow = $this->vehicleFollowRepository->findOneBy([
            'vehicle' => $vehicle,
            'user' => $buyer,
        ]);

        if (!$follow) {
            return [
                'success' => false,
                'error' => 'You are not following this vehicle',
            ];
        }

        try {
            $this->entityManager->remove($follow);
            $this->entityManager->flush();

            return [
                'success' => true,
                'message' => 'Vehicle unfollowed successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to unfollow vehicle: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array<array<string, mixed>>
     */
    public function getFollowedVehicles(User $buyer): array
    {
        $vehicles = $this->vehicleRepository->findFollowedByUser($buyer);

        return array_map(fn (Vehicle $vehicle) => $this->formatVehicle($vehicle), $vehicles);
    }

    public function isVehicleFollowedByUser(Vehicle $vehicle, User $user): bool
    {
        return null !== $this->vehicleFollowRepository->findOneBy([
            'vehicle' => $vehicle,
            'user' => $user,
        ]);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createVehicleByType(string $type, array $data): Vehicle
    {
        return match ($type) {
            'motorcycle' => $this->createMotorcycle($data),
            'car' => $this->createCar($data),
            'truck' => $this->createTruck($data),
            'trailer' => $this->createTrailer($data),
            default => throw new \InvalidArgumentException('Invalid vehicle type'),
        };
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createMotorcycle(array $data): Motorcycle
    {
        $motorcycle = new Motorcycle();
        $this->setCommonVehicleData($motorcycle, $data);

        $engineCapacity = $data['engineCapacity'] ?? '0.00';
        if (is_numeric($engineCapacity)) {
            $motorcycle->setEngineCapacity((string) $engineCapacity);
        } else {
            $motorcycle->setEngineCapacity('0.00');
        }

        $colour = $data['colour'] ?? '';
        if (\is_string($colour)) {
            $motorcycle->setColour($colour);
        }

        return $motorcycle;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createCar(array $data): Car
    {
        $car = new Car();
        $this->setCommonVehicleData($car, $data);

        $engineCapacity = $data['engineCapacity'] ?? '0.00';
        if (is_numeric($engineCapacity)) {
            $car->setEngineCapacity((string) $engineCapacity);
        } else {
            $car->setEngineCapacity('0.00');
        }

        $numberOfDoors = $data['numberOfDoors'] ?? 4;
        if (\is_int($numberOfDoors) || (\is_string($numberOfDoors) && ctype_digit($numberOfDoors))) {
            $car->setNumberOfDoors((int) $numberOfDoors);
        } else {
            $car->setNumberOfDoors(4);
        }

        $colour = $data['colour'] ?? '';
        if (\is_string($colour)) {
            $car->setColour($colour);
        }

        if (isset($data['category']) && \is_string($data['category'])) {
            $car->setCategory(CarCategory::from($data['category']));
        }

        return $car;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createTruck(array $data): Truck
    {
        $truck = new Truck();
        $this->setCommonVehicleData($truck, $data);

        $engineCapacity = $data['engineCapacity'] ?? '0.00';
        if (is_numeric($engineCapacity)) {
            $truck->setEngineCapacity((string) $engineCapacity);
        } else {
            $truck->setEngineCapacity('0.00');
        }

        $colour = $data['colour'] ?? '';
        if (\is_string($colour)) {
            $truck->setColour($colour);
        }

        $numberOfBeds = $data['numberOfBeds'] ?? 1;
        if (\is_int($numberOfBeds) || (\is_string($numberOfBeds) && ctype_digit($numberOfBeds))) {
            $truck->setNumberOfBeds((int) $numberOfBeds);
        } else {
            $truck->setNumberOfBeds(1);
        }

        return $truck;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createTrailer(array $data): Trailer
    {
        $trailer = new Trailer();
        $this->setCommonVehicleData($trailer, $data);

        $numberOfAxles = $data['numberOfAxles'] ?? 1;
        if (\is_int($numberOfAxles) || (\is_string($numberOfAxles) && ctype_digit($numberOfAxles))) {
            $trailer->setNumberOfAxles((int) $numberOfAxles);
        } else {
            $trailer->setNumberOfAxles(1);
        }

        $loadCapacity = $data['loadCapacity'] ?? 0;
        if (\is_int($loadCapacity) || (\is_string($loadCapacity) && ctype_digit($loadCapacity))) {
            $trailer->setLoadCapacity((int) $loadCapacity);
        } else {
            $trailer->setLoadCapacity(0);
        }

        return $trailer;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function setCommonVehicleData(Vehicle $vehicle, array $data): void
    {
        $brand = $data['brand'] ?? '';
        $vehicle->setBrand(\is_string($brand) ? $brand : '');

        $model = $data['model'] ?? '';
        $vehicle->setModel(\is_string($model) ? $model : '');

        $price = $data['price'] ?? '0.00';
        if (is_numeric($price)) {
            $vehicle->setPrice((string) $price);
        } else {
            $vehicle->setPrice('0.00');
        }

        $quantity = $data['quantity'] ?? 0;
        if (\is_int($quantity) || (\is_string($quantity) && ctype_digit($quantity))) {
            $vehicle->setQuantity((int) $quantity);
        } else {
            $vehicle->setQuantity(0);
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function updateVehicleData(Vehicle $vehicle, array $data): void
    {
        if (isset($data['brand']) && \is_string($data['brand'])) {
            $vehicle->setBrand($data['brand']);
        }

        if (isset($data['model']) && \is_string($data['model'])) {
            $vehicle->setModel($data['model']);
        }

        if (isset($data['price']) && is_numeric($data['price'])) {
            $vehicle->setPrice((string) $data['price']);
        }

        if (isset($data['quantity']) && (\is_int($data['quantity']) || (\is_string($data['quantity']) && ctype_digit($data['quantity'])))) {
            $vehicle->setQuantity((int) $data['quantity']);
        }

        // Update type-specific fields
        if ($vehicle instanceof Motorcycle) {
            if (isset($data['engineCapacity']) && is_numeric($data['engineCapacity'])) {
                $vehicle->setEngineCapacity((string) $data['engineCapacity']);
            }
            if (isset($data['colour']) && \is_string($data['colour'])) {
                $vehicle->setColour($data['colour']);
            }
        }

        if ($vehicle instanceof Car) {
            if (isset($data['engineCapacity']) && is_numeric($data['engineCapacity'])) {
                $vehicle->setEngineCapacity((string) $data['engineCapacity']);
            }
            if (isset($data['numberOfDoors']) && (\is_int($data['numberOfDoors']) || (\is_string($data['numberOfDoors']) && ctype_digit($data['numberOfDoors'])))) {
                $vehicle->setNumberOfDoors((int) $data['numberOfDoors']);
            }
            if (isset($data['category']) && \is_string($data['category'])) {
                $vehicle->setCategory(CarCategory::from($data['category']));
            }
            if (isset($data['colour']) && \is_string($data['colour'])) {
                $vehicle->setColour($data['colour']);
            }
        }

        if ($vehicle instanceof Truck) {
            if (isset($data['engineCapacity']) && is_numeric($data['engineCapacity'])) {
                $vehicle->setEngineCapacity((string) $data['engineCapacity']);
            }
            if (isset($data['numberOfBeds']) && (\is_int($data['numberOfBeds']) || (\is_string($data['numberOfBeds']) && ctype_digit($data['numberOfBeds'])))) {
                $vehicle->setNumberOfBeds((int) $data['numberOfBeds']);
            }
            if (isset($data['colour']) && \is_string($data['colour'])) {
                $vehicle->setColour($data['colour']);
            }
        }

        if ($vehicle instanceof Trailer) {
            if (isset($data['numberOfAxles']) && (\is_int($data['numberOfAxles']) || (\is_string($data['numberOfAxles']) && ctype_digit($data['numberOfAxles'])))) {
                $vehicle->setNumberOfAxles((int) $data['numberOfAxles']);
            }
            if (isset($data['loadCapacity']) && (\is_int($data['loadCapacity']) || (\is_string($data['loadCapacity']) && ctype_digit($data['loadCapacity'])))) {
                $vehicle->setLoadCapacity((int) $data['loadCapacity']);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function formatVehicle(Vehicle $vehicle): array
    {
        $data = [
            'id' => $vehicle->getId(),
            'type' => $vehicle->getVehicleType()->value,
            'brand' => $vehicle->getBrand(),
            'model' => $vehicle->getModel(),
            'price' => $vehicle->getPrice(),
            'quantity' => $vehicle->getQuantity(),
            'merchant' => [
                'id' => $vehicle->getMerchant()->getId(),
                'fullName' => $vehicle->getMerchant()->getFullName(),
                'email' => $vehicle->getMerchant()->getEmail(),
            ],
            'createdAt' => $vehicle->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $vehicle->getUpdatedAt()?->format('Y-m-d H:i:s'),
            'followersCount' => $vehicle->getFollows()->count(),
        ];

        // Add type-specific data
        if ($vehicle instanceof Motorcycle) {
            $data['engineCapacity'] = $vehicle->getEngineCapacity();
            $data['colour'] = $vehicle->getColour();
        }

        if ($vehicle instanceof Car) {
            $data['engineCapacity'] = $vehicle->getEngineCapacity();
            $data['numberOfDoors'] = $vehicle->getNumberOfDoors();
            $data['category'] = $vehicle->getCategory()->value;
            $data['colour'] = $vehicle->getColour();
        }

        if ($vehicle instanceof Truck) {
            $data['engineCapacity'] = $vehicle->getEngineCapacity();
            $data['numberOfBeds'] = $vehicle->getNumberOfBeds();
            $data['colour'] = $vehicle->getColour();
        }

        if ($vehicle instanceof Trailer) {
            $data['numberOfAxles'] = $vehicle->getNumberOfAxles();
            $data['loadCapacity'] = $vehicle->getLoadCapacity();
        }

        return $data;
    }
}
