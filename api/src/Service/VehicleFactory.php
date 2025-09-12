<?php

namespace App\Service;

use App\Entity\Car;
use App\Entity\Cart;
use App\Entity\Motorcycle;
use App\Entity\Trailer;
use App\Entity\Truck;
use App\Entity\Vehicle;
use App\Service\Trait\VehicleDataHandlerTrait;

class VehicleFactory extends AbstractService
{
    use VehicleDataHandlerTrait;

    private const VEHICLE_TYPE_MAP = [
        'motorcycle' => Motorcycle::class,
        'car' => Car::class,
        'truck' => Truck::class,
        'trailer' => Trailer::class,
        'cart' => Cart::class,
    ];

    /**
     * Create a vehicle by type with data.
     *
     * @param array<string, mixed> $data
     */
    public function createVehicleByType(string $type, array $data): Vehicle
    {
        $vehicleClass = self::VEHICLE_TYPE_MAP[$type] ?? null;

        if (!$vehicleClass) {
            throw new \InvalidArgumentException("Invalid vehicle type: {$type}");
        }

        /** @var Car|Cart|Motorcycle|Trailer|Truck $vehicle */
        $vehicle = new $vehicleClass();

        $this->setCommonVehicleData($vehicle, $data);
        $this->setVehicleSpecificData($vehicle, $data);

        return $vehicle;
    }

    /**
     * Update vehicle with data.
     *
     * @param array<string, mixed> $data
     */
    public function updateVehicleWithData(Vehicle $vehicle, array $data): void
    {
        $this->updateVehicleSpecificData($vehicle, $data);
    }

    /**
     * Format vehicle for API response.
     *
     * @return array<string, mixed>
     */
    public function formatVehicleForApi(Vehicle $vehicle): array
    {
        return $this->formatVehicleData($vehicle);
    }
}
