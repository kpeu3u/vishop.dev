<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Motorcycle extends Vehicle
{
    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2, nullable: false)]
    #[Assert\NotBlank(message: 'Engine capacity is required')]
    #[Assert\Positive(message: 'Engine capacity must be positive')]
    #[Assert\Type(type: 'numeric', message: 'Engine capacity must be a number')]
    private string $engineCapacity;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: false)]
    #[Assert\NotBlank(message: 'Colour is required')]
    #[Assert\Length(max: 50)]
    private string $colour;

    public function getEngineCapacity(): string
    {
        return $this->engineCapacity;
    }

    public function setEngineCapacity(string $engineCapacity): self
    {
        $this->engineCapacity = $engineCapacity;

        return $this;
    }

    public function getColour(): string
    {
        return $this->colour;
    }

    public function setColour(string $colour): self
    {
        $this->colour = $colour;

        return $this;
    }
}
