<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Motorcycle extends Product
{
    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2, nullable: false)]
    #[Assert\NotBlank(message: 'Engine capacity is required')]
    #[Assert\Positive(message: 'Engine capacity must be positive')]
    #[Assert\Type(type: 'numeric', message: 'Engine capacity must be a number')]
    private string $engineCapacity;

    public function getEngineCapacity(): string
    {
        return $this->engineCapacity;
    }

    public function setEngineCapacity(string $engineCapacity): self
    {
        $this->engineCapacity = $engineCapacity;

        return $this;
    }
}
