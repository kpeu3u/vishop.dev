<?php

namespace App\Entity;

use App\Entity\Trait\ColouredVehicleTrait;
use App\Entity\Trait\EngineVehicleTrait;
use App\Entity\Trait\PermittedMaxMassVehicleTrait;
use App\Enum\CarCategory;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Car extends Vehicle
{
    use ColouredVehicleTrait;
    use EngineVehicleTrait;
    use PermittedMaxMassVehicleTrait;

    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Number of doors is required')]
    #[Assert\Choice(choices: [3, 4, 5], message: 'Number of doors must be 3, 4, or 5')]
    private int $numberOfDoors;

    #[ORM\Column(type: Types::STRING, nullable: false, enumType: CarCategory::class)]
    #[Assert\NotBlank(message: 'Car category is required')]
    private CarCategory $category;

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
