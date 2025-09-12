<?php

namespace App\Entity;

use App\Entity\Trait\ColouredVehicleTrait;
use App\Entity\Trait\EngineVehicleTrait;
use App\Entity\Trait\PermittedMaxMassVehicleTrait;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Truck extends Vehicle
{
    use ColouredVehicleTrait;
    use EngineVehicleTrait;
    use PermittedMaxMassVehicleTrait;

    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Number of beds is required')]
    #[Assert\Choice(choices: [1, 2], message: 'Number of beds must be 1 or 2')]
    private int $numberOfBeds;

    public function getNumberOfBeds(): int
    {
        return $this->numberOfBeds;
    }

    public function setNumberOfBeds(int $numberOfBeds): self
    {
        $this->numberOfBeds = $numberOfBeds;

        return $this;
    }
}
