<?php

namespace App\Entity;

use App\Enum\CarCategory;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Car extends Product
{
    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2, nullable: false)]
    #[Assert\NotBlank(message: 'Engine capacity is required')]
    #[Assert\Positive(message: 'Engine capacity must be positive')]
    #[Assert\Type(type: 'numeric', message: 'Engine capacity must be a number')]
    private string $engineCapacity;

    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Number of doors is required')]
    #[Assert\Choice(choices: [3, 4, 5], message: 'Number of doors must be 3, 4, or 5')]
    private int $numberOfDoors;

    #[ORM\Column(type: Types::STRING, nullable: false, enumType: CarCategory::class)]
    #[Assert\NotBlank(message: 'Car category is required')]
    private CarCategory $category;

    public function getEngineCapacity(): string
    {
        return $this->engineCapacity;
    }

    public function setEngineCapacity(string $engineCapacity): self
    {
        $this->engineCapacity = $engineCapacity;

        return $this;
    }

    public function getNumberOfDoors(): int
    {
        return $this->numberOfDoors;
    }

    public function setNumberOfDoors(int $numberOfDoors): self
    {
        $this->numberOfDoors = $numberOfDoors;

        return $this;
    }

    public function getCategory(): CarCategory
    {
        return $this->category;
    }

    public function setCategory(CarCategory $category): self
    {
        $this->category = $category;

        return $this;
    }
}
