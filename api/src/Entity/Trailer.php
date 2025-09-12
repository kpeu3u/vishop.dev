<?php

namespace App\Entity;

use App\Entity\Trait\LoadCapacityVehicleTrait;
use App\Entity\Trait\PermittedMaxMassVehicleTrait;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Trailer extends Vehicle
{
    use LoadCapacityVehicleTrait;
    use PermittedMaxMassVehicleTrait;
    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Number of axles is required')]
    #[Assert\Choice(choices: [1, 2, 3], message: 'Number of axles must be 1, 2, or 3')]
    private int $numberOfAxles;

    public function getNumberOfAxles(): int
    {
        return $this->numberOfAxles;
    }

    public function setNumberOfAxles(int $numberOfAxles): self
    {
        $this->numberOfAxles = $numberOfAxles;

        return $this;
    }
}
