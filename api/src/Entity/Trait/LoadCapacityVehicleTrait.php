<?php

namespace App\Entity\Trait;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait LoadCapacityVehicleTrait
{
    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Load capacity is required')]
    #[Assert\Positive(message: 'Load capacity must be positive')]
    #[Assert\Type(type: 'integer', message: 'Load capacity must be an integer')]
    private int $loadCapacity;

    public function getLoadCapacity(): int
    {
        return $this->loadCapacity;
    }

    public function setLoadCapacity(int $loadCapacity): self
    {
        $this->loadCapacity = $loadCapacity;

        return $this;
    }
}
