<?php

namespace App\Entity\Trait;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait ColouredVehicleTrait
{
    #[ORM\Column(type: Types::STRING, length: 50, nullable: false)]
    #[Assert\NotBlank(message: 'Colour is required')]
    #[Assert\Length(max: 50)]
    private string $colour;

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
