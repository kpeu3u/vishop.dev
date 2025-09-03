<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Trailer extends Product
{
    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Number of axles is required')]
    #[Assert\Choice(choices: [1, 2, 3], message: 'Number of axles must be 1, 2, or 3')]
    private int $numberOfAxles;

    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Load capacity is required')]
    #[Assert\Positive(message: 'Load capacity must be positive')]
    #[Assert\Type(type: 'integer', message: 'Load capacity must be an integer')]
    private int $loadCapacity;

    public function getNumberOfAxles(): int
    {
        return $this->numberOfAxles;
    }

    public function setNumberOfAxles(int $numberOfAxles): self
    {
        $this->numberOfAxles = $numberOfAxles;

        return $this;
    }

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
