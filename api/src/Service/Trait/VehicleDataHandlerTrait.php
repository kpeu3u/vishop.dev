<?php

namespace App\Service\Trait;

use App\Entity\Car;
use App\Entity\Cart;
use App\Entity\Motorcycle;
use App\Entity\Trailer;
use App\Entity\Truck;
use App\Entity\Vehicle;
use App\Enum\CarCategory;

trait VehicleDataHandlerTrait
{
    /**
     * Set common vehicle data from array.
     *
     * @param array<string, mixed> $data
     */
    private function setCommonVehicleData(Vehicle $vehicle, array $data): void
    {
        $vehicle->setBrand($this->castToString($data['brand'] ?? ''));
        $vehicle->setModel($this->castToString($data['model'] ?? ''));
        $vehicle->setPrice($this->castToNumericString($data['price'] ?? '0.00'));
        $vehicle->setQuantity($this->castToInt($data['quantity'] ?? 0));
    }

    /**
     * Set vehicle-specific data from array.
     *
     * @param array<string, mixed> $data
     */
    private function setVehicleSpecificData(Vehicle $vehicle, array $data): void
    {
        match (true) {
            $vehicle instanceof Motorcycle => $this->setMotorcycleData($vehicle, $data),
            $vehicle instanceof Car => $this->setCarData($vehicle, $data),
            $vehicle instanceof Truck => $this->setTruckData($vehicle, $data),
            $vehicle instanceof Trailer => $this->setTrailerData($vehicle, $data),
            $vehicle instanceof Cart => $this->setCartData($vehicle, $data),
            default => throw new \InvalidArgumentException('Unknown vehicle type'),
        };
    }

    /**
     * Update vehicle-specific data from array.
     *
     * @param array<string, mixed> $data
     */
    private function updateVehicleSpecificData(Vehicle $vehicle, array $data): void
    {
        if (isset($data['brand'])) {
            $vehicle->setBrand($this->castToString($data['brand']));
        }
        if (isset($data['model'])) {
            $vehicle->setModel($this->castToString($data['model']));
        }
        if (isset($data['price'])) {
            $vehicle->setPrice($this->castToNumericString($data['price']));
        }
        if (isset($data['quantity'])) {
            $vehicle->setQuantity($this->castToInt($data['quantity']));
        }

        match (true) {
            $vehicle instanceof Motorcycle => $this->updateMotorcycleData($vehicle, $data),
            $vehicle instanceof Car => $this->updateCarData($vehicle, $data),
            $vehicle instanceof Truck => $this->updateTruckData($vehicle, $data),
            $vehicle instanceof Trailer => $this->updateTrailerData($vehicle, $data),
            $vehicle instanceof Cart => $this->updateCartData($vehicle, $data),
            default => throw new \InvalidArgumentException('Unknown vehicle type'),
        };
    }

    /**
     * Format vehicle data for response.
     *
     * @return array<string, mixed>
     */
    private function formatVehicleData(Vehicle $vehicle): array
    {
        $baseData = [
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

        return match (true) {
            $vehicle instanceof Motorcycle => $baseData + $this->formatMotorcycleData($vehicle),
            $vehicle instanceof Car => $baseData + $this->formatCarData($vehicle),
            $vehicle instanceof Truck => $baseData + $this->formatTruckData($vehicle),
            $vehicle instanceof Trailer => $baseData + $this->formatTrailerData($vehicle),
            $vehicle instanceof Cart => $baseData + $this->formatCartData($vehicle),
            default => $baseData,
        };
    }

    /**
     * @param array<string, mixed> $data
     */
    private function setMotorcycleData(Motorcycle $motorcycle, array $data): void
    {
        $motorcycle->setEngineCapacity($this->castToNumericString($data['engineCapacity'] ?? '0.00'));
        $motorcycle->setColour($this->castToString($data['colour'] ?? ''));
    }

    /**
     * @param array<string, mixed> $data
     */
    private function setCarData(Car $car, array $data): void
    {
        $car->setEngineCapacity($this->castToNumericString($data['engineCapacity'] ?? '0.00'));
        $car->setNumberOfDoors($this->castToInt($data['numberOfDoors'] ?? 4));
        $car->setColour($this->castToString($data['colour'] ?? ''));
        $car->setPermittedMaximumMass($this->castToInt($data['permittedMaximumMass'] ?? 0));

        if (isset($data['category']) && \is_string($data['category'])) {
            $car->setCategory(CarCategory::from($data['category']));
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function setTruckData(Truck $truck, array $data): void
    {
        $truck->setEngineCapacity($this->castToNumericString($data['engineCapacity'] ?? '0.00'));
        $truck->setColour($this->castToString($data['colour'] ?? ''));
        $truck->setNumberOfBeds($this->castToInt($data['numberOfBeds'] ?? 1));
        $truck->setPermittedMaximumMass($this->castToInt($data['permittedMaximumMass'] ?? 0));
    }

    /**
     * @param array<string, mixed> $data
     */
    private function setTrailerData(Trailer $trailer, array $data): void
    {
        $trailer->setNumberOfAxles($this->castToInt($data['numberOfAxles'] ?? 1));
        $trailer->setLoadCapacity($this->castToInt($data['loadCapacity'] ?? 0));
        $trailer->setPermittedMaximumMass($this->castToInt($data['permittedMaximumMass'] ?? 0));
    }

    /**
     * @param array<string, mixed> $data
     */
    private function setCartData(Cart $cart, array $data): void
    {
        $cart->setColour($this->castToString($data['colour'] ?? ''));
        $cart->setLoadCapacity($this->castToInt($data['loadCapacity'] ?? 0));
        $cart->setPermittedMaximumMass($this->castToInt($data['permittedMaximumMass'] ?? 0));
    }

    /**
     * @param array<string, mixed> $data
     */
    private function updateMotorcycleData(Motorcycle $motorcycle, array $data): void
    {
        if (isset($data['engineCapacity'])) {
            $motorcycle->setEngineCapacity($this->castToNumericString($data['engineCapacity']));
        }
        if (isset($data['colour'])) {
            $motorcycle->setColour($this->castToString($data['colour']));
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function updateCarData(Car $car, array $data): void
    {
        if (isset($data['engineCapacity'])) {
            $car->setEngineCapacity($this->castToNumericString($data['engineCapacity']));
        }
        if (isset($data['numberOfDoors'])) {
            $car->setNumberOfDoors($this->castToInt($data['numberOfDoors']));
        }
        if (isset($data['colour'])) {
            $car->setColour($this->castToString($data['colour']));
        }
        if (isset($data['permittedMaximumMass'])) {
            $car->setPermittedMaximumMass($this->castToInt($data['permittedMaximumMass']));
        }
        if (isset($data['category']) && \is_string($data['category'])) {
            $car->setCategory(CarCategory::from($data['category']));
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function updateTruckData(Truck $truck, array $data): void
    {
        if (isset($data['engineCapacity'])) {
            $truck->setEngineCapacity($this->castToNumericString($data['engineCapacity']));
        }
        if (isset($data['colour'])) {
            $truck->setColour($this->castToString($data['colour']));
        }
        if (isset($data['numberOfBeds'])) {
            $truck->setNumberOfBeds($this->castToInt($data['numberOfBeds']));
        }
        if (isset($data['permittedMaximumMass'])) {
            $truck->setPermittedMaximumMass($this->castToInt($data['permittedMaximumMass']));
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function updateTrailerData(Trailer $trailer, array $data): void
    {
        if (isset($data['numberOfAxles'])) {
            $trailer->setNumberOfAxles($this->castToInt($data['numberOfAxles']));
        }
        if (isset($data['loadCapacity'])) {
            $trailer->setLoadCapacity($this->castToInt($data['loadCapacity']));
        }
        if (isset($data['permittedMaximumMass'])) {
            $trailer->setPermittedMaximumMass($this->castToInt($data['permittedMaximumMass']));
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function updateCartData(Cart $cart, array $data): void
    {
        if (isset($data['colour'])) {
            $cart->setColour($this->castToString($data['colour']));
        }
        if (isset($data['loadCapacity'])) {
            $cart->setLoadCapacity($this->castToInt($data['loadCapacity']));
        }
        if (isset($data['permittedMaximumMass'])) {
            $cart->setPermittedMaximumMass($this->castToInt($data['permittedMaximumMass']));
        }
    }

    /**
     * @return array<string, int|string>
     */
    private function formatMotorcycleData(Motorcycle $motorcycle): array
    {
        return [
            'engineCapacity' => $motorcycle->getEngineCapacity(),
            'colour' => $motorcycle->getColour(),
        ];
    }

    /**
     * @return array<string, int|string>
     */
    private function formatCarData(Car $car): array
    {
        return [
            'engineCapacity' => $car->getEngineCapacity(),
            'numberOfDoors' => $car->getNumberOfDoors(),
            'category' => $car->getCategory()->value,
            'colour' => $car->getColour(),
            'permittedMaximumMass' => $car->getPermittedMaximumMass(),
        ];
    }

    /**
     * @return array<string, int|string>
     */
    private function formatTruckData(Truck $truck): array
    {
        return [
            'engineCapacity' => $truck->getEngineCapacity(),
            'numberOfBeds' => $truck->getNumberOfBeds(),
            'colour' => $truck->getColour(),
            'permittedMaximumMass' => $truck->getPermittedMaximumMass(),
        ];
    }

    /**
     * @return array<string, int|string>
     */
    private function formatTrailerData(Trailer $trailer): array
    {
        return [
            'numberOfAxles' => $trailer->getNumberOfAxles(),
            'loadCapacity' => $trailer->getLoadCapacity(),
            'permittedMaximumMass' => $trailer->getPermittedMaximumMass(),
        ];
    }

    /**
     * @return array<string, int|string>
     */
    private function formatCartData(Cart $cart): array
    {
        return [
            'colour' => $cart->getColour(),
            'loadCapacity' => $cart->getLoadCapacity(),
            'permittedMaximumMass' => $cart->getPermittedMaximumMass(),
        ];
    }
}
