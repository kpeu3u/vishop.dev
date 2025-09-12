<?php

namespace App\Entity;

use App\Entity\Trait\ColouredVehicleTrait;
use App\Entity\Trait\EngineVehicleTrait;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Motorcycle extends Vehicle
{
    use ColouredVehicleTrait;
    use EngineVehicleTrait;
}
