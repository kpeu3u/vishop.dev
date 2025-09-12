<?php

namespace App\Entity;

use App\Entity\Trait\ColouredVehicleTrait;
use App\Entity\Trait\LoadCapacityVehicleTrait;
use App\Entity\Trait\PermittedMaxMassVehicleTrait;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Cart extends Vehicle
{
    use ColouredVehicleTrait;
    use LoadCapacityVehicleTrait;
    use PermittedMaxMassVehicleTrait;
}
