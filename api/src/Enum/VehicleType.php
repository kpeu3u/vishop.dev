<?php

namespace App\Enum;

enum VehicleType: string
{
    case MOTORCYCLE = 'motorcycle';
    case CAR = 'car';
    case TRUCK = 'truck';
    case TRAILER = 'trailer';

    public function getLabel(): string
    {
        return match ($this) {
            self::MOTORCYCLE => 'Motorcycle',
            self::CAR => 'Car',
            self::TRUCK => 'Truck',
            self::TRAILER => 'Trailer',
        };
    }

    /** @return array<string, string> */
    public static function getChoices(): array
    {
        $choices = [];
        foreach (self::cases() as $case) {
            $choices[$case->getLabel()] = $case->value;
        }

        return $choices;
    }
}
