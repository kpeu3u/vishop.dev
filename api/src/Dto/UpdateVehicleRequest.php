<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateVehicleRequest
{
    #[Assert\Length(max: 100, maxMessage: 'Brand cannot be longer than {{ limit }} characters')]
    public ?string $brand = null;

    #[Assert\Length(max: 100, maxMessage: 'Model cannot be longer than {{ limit }} characters')]
    public ?string $model = null;

    #[Assert\Positive(message: 'Price must be positive')]
    #[Assert\Type(type: 'numeric', message: 'Price must be a number')]
    public string|int|float|null $price = null;

    #[Assert\PositiveOrZero(message: 'Quantity must be zero or positive')]
    #[Assert\Type(type: 'integer', message: 'Quantity must be an integer')]
    public ?int $quantity = null;

    #[Assert\Length(max: 50, maxMessage: 'Category cannot be longer than {{ limit }} characters')]
    public ?string $category = null;

    #[Assert\Length(max: 30, maxMessage: 'Color cannot be longer than {{ limit }} characters')]
    public ?string $color = null;

    #[Assert\PositiveOrZero(message: 'Engine capacity must be zero or positive')]
    #[Assert\Type(type: 'numeric', message: 'Engine capacity must be a number')]
    public string|int|float|null $engineCapacity = null;

    #[Assert\PositiveOrZero(message: 'Permitted max mass must be zero or positive')]
    #[Assert\Type(type: 'numeric', message: 'Permitted max mass must be a number')]
    public string|int|float|null $permittedMaxMass = null;
}
