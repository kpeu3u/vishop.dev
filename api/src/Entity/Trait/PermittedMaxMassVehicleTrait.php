<?php

namespace App\Entity\Trait;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait PermittedMaxMassVehicleTrait
{
    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Permitted maximum mass is required')]
    #[Assert\Positive(message: 'Permitted maximum mass must be positive')]
    #[Assert\Type(type: 'integer', message: 'Permitted maximum mass must be a number')]
    private int $permittedMaximumMass;

    public function getPermittedMaximumMass(): int
    {
        return $this->permittedMaximumMass;
    }

    public function setPermittedMaximumMass(int $permittedMaximumMass): self
    {
        $this->permittedMaximumMass = $permittedMaximumMass;

        return $this;
    }
}
