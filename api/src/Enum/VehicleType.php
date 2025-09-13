<?php

namespace App\Enum;

enum VehicleType: string
{
    case MOTORCYCLE = 'motorcycle';
    case CAR = 'car';
    case TRUCK = 'truck';
    case TRAILER = 'trailer';
    case CART = 'cart';

    public function getLabel(): string
    {
        return match ($this) {
            self::MOTORCYCLE => 'Motorcycle',
            self::CAR => 'Car',
            self::TRUCK => 'Truck',
            self::TRAILER => 'Trailer',
            self::CART => 'Cart',
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

    /** @return array<string> */
    public static function getValues(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
