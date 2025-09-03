<?php

namespace App\Enum;

enum CarCategory: string
{
    case SEDAN = 'sedan';
    case HATCHBACK = 'hatchback';
    case SUV = 'suv';
    case COUPE = 'coupe';
    case MINIVAN = 'minivan';
    case PICKUP = 'pickup';
    case LIMOUSINE = 'limousine';

    public function getLabel(): string
    {
        return match ($this) {
            self::SEDAN => 'Sedan',
            self::HATCHBACK => 'Hatchback',
            self::SUV => 'SUV',
            self::COUPE => 'Coupe',
            self::MINIVAN => 'Minivan',
            self::PICKUP => 'Pickup',
            self::LIMOUSINE => 'Limousine',
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
