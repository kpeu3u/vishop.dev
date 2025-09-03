<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Truck extends Product
{
    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2, nullable: false)]
    #[Assert\NotBlank(message: 'Engine capacity is required')]
    #[Assert\Positive(message: 'Engine capacity must be positive')]
    #[Assert\Type(type: 'numeric', message: 'Engine capacity must be a number')]
    private string $engineCapacity;

    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Number of beds is required')]
    #[Assert\Choice(choices: [1, 2], message: 'Number of beds must be 1 or 2')]
    private int $numberOfBeds;

    public function getEngineCapacity(): string
    {
        return $this->engineCapacity;
    }

    public function setEngineCapacity(string $engineCapacity): self
    {
        $this->engineCapacity = $engineCapacity;

        return $this;
    }

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
