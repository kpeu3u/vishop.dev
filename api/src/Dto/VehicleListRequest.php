<?php

namespace App\Dto;

use App\Enum\VehicleType;
use Symfony\Component\Validator\Constraints as Assert;

class VehicleListRequest
{
    #[Assert\Length(max: 100, maxMessage: 'Brand filter cannot be longer than {{ limit }} characters')]
    public ?string $brand = null;

    #[Assert\Length(max: 100, maxMessage: 'Model filter cannot be longer than {{ limit }} characters')]
    public ?string $model = null;

    #[Assert\PositiveOrZero(message: 'Minimum price must be zero or positive')]
    #[Assert\Type(type: 'numeric', message: 'Minimum price must be a number')]
    public string|int|float|null $minPrice = null;

    #[Assert\PositiveOrZero(message: 'Maximum price must be zero or positive')]
    #[Assert\Type(type: 'numeric', message: 'Maximum price must be a number')]
    #[Assert\GreaterThanOrEqual(propertyPath: 'minPrice', message: 'Maximum price must be greater than or equal to minimum price')]
    public string|int|float|null $maxPrice = null;

    #[Assert\Type(type: 'boolean', message: 'In stock filter must be a boolean')]
    public ?bool $inStock = null;

    #[Assert\Choice(callback: [VehicleType::class, 'getValues'], message: 'Invalid vehicle type')]
    public ?string $type = null;
}
